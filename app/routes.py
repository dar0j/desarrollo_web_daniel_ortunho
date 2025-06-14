import os
import uuid
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, jsonify, abort
from werkzeug.utils import secure_filename
from app import app, db
from app.models import Region, Comuna, Actividad, ContactarPor, ActividadTema, Foto, Comentario
from sqlalchemy import func, extract
from datetime import datetime, timedelta
import re

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def save_file(file, subdir=""):
    """Save a file to upload directory with a unique name"""
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], subdir)
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    # Return the relative path for the database
    return os.path.join('uploads', subdir, unique_filename)

@app.route('/')
def index():
    actividades = Actividad.query.order_by(Actividad.id.desc()).limit(5).all()
    return render_template('portada.html', actividades=actividades)

@app.route('/agregar-actividad', methods=['GET', 'POST'])
def agregar_actividad():
    if request.method == 'POST':
        organizador = request.form.get('organizador')
        email = request.form.get('email')
        celular = request.form.get('cel', None)
        comuna_nombre = request.form.get('comuna')
        sector = request.form.get('sector', '')
        fecha_inicio = request.form.get('fecha_inicio')
        fecha_termino = request.form.get('fecha_termino', None)
        descripcion = request.form.get('desc', '')
        
        # Server-side validation
        errors = {}
        
        if not organizador or not email or not comuna_nombre or not fecha_inicio:
            errors['general'] = 'Todos los campos requeridos deben ser completados'
        
        email_regex = re.compile(r'^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
        if email and not email_regex.match(email):
            errors['email'] = 'Formato de email inválido'
        
        phone_regex = re.compile(r'^\+[0-9]{3}\.[0-9]{8}$')
        if celular and not phone_regex.match(celular):
            errors['celular'] = 'Formato de celular inválido'
        
        # Validate at least one theme is selected
        temas = request.form.getlist('tema[]')
        if not temas:
            errors['temas'] = 'Debe seleccionar al menos un tema'
        
        if errors:
            regions = Region.query.all()
            return render_template('agregar-actividad.html', errors=errors, form_data=request.form)
        
        try:
            comuna = Comuna.query.filter_by(nombre=comuna_nombre).first()
            if not comuna:
                flash('Comuna no encontrada', 'error')
                return redirect(url_for('agregar_actividad'))
            
            inicio_dt = datetime.strptime(fecha_inicio, '%Y-%m-%dT%H:%M')
            termino_dt = None
            if fecha_termino:
                termino_dt = datetime.strptime(fecha_termino, '%Y-%m-%dT%H:%M')
            
            nueva_actividad = Actividad(
                comuna_id=comuna.id,
                sector=sector,
                nombre=organizador,
                email=email,
                celular=celular,
                dia_hora_inicio=inicio_dt,
                dia_hora_termino=termino_dt,
                descripcion=descripcion
            )
            
            db.session.add(nueva_actividad)
            db.session.flush()  # To get the ID
            
            for tema in temas:
                glosa_otro = None
                if tema == 'otro':
                    glosa_otro = request.form.get('otro-tema')
                
                nuevo_tema = ActividadTema(
                    tema=tema,
                    glosa_otro=glosa_otro,
                    actividad_id=nueva_actividad.id
                )
                db.session.add(nuevo_tema)
            
            for contacto_tipo in request.form.getlist('contacto[]'):
                id_url = request.form.get(f'idurl-{contacto_tipo}')
                if id_url:
                    nuevo_contacto = ContactarPor(
                        nombre=contacto_tipo,
                        identificador=id_url,
                        actividad_id=nueva_actividad.id
                    )
                    db.session.add(nuevo_contacto)
            
            for i in range(1, 6):  # Max 5 photos
                foto_key = f'foto{i}'
                if foto_key in request.files:
                    foto = request.files[foto_key]
                    if foto and foto.filename and allowed_file(foto.filename):
                        # Save both thumbnail and full-size versions, still need to resize the images
                        foto_path = save_file(foto)
                        
                        nueva_foto = Foto(
                            ruta_archivo=foto_path,
                            nombre_archivo=secure_filename(foto.filename),
                            actividad_id=nueva_actividad.id
                        )
                        db.session.add(nueva_foto)
            
            db.session.commit()
            flash('Actividad agregada exitosamente', 'success')
            return redirect(url_for('index'))
            
        except Exception as e:
            db.session.rollback()
            flash(f'Error al agregar actividad: {str(e)}', 'error')
            return redirect(url_for('agregar_actividad'))
    
    # GET request - show the form
    regions = Region.query.all()
    return render_template('agregar-actividad.html')

@app.route('/listado')
def listado():
    page = request.args.get('page', 1, type=int)
    per_page = 5 
    
    pagination = Actividad.query.order_by(Actividad.dia_hora_inicio.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    actividades = pagination.items
    
    return render_template('listado.html', actividades=actividades, pagination=pagination)

@app.route('/actividad/<int:id>')
def ver_actividad(id):
    actividad = Actividad.query.get_or_404(id)
    return jsonify({
        'id': actividad.id,
        'organizador': actividad.nombre,
        'email': actividad.email,
        'celular': actividad.celular,
        'comuna': actividad.comuna.nombre,
        'region': actividad.comuna.region.nombre,
        'sector': actividad.sector,
        'inicio': actividad.dia_hora_inicio.strftime('%Y-%m-%d %H:%M'),
        'termino': actividad.dia_hora_termino.strftime('%Y-%m-%d %H:%M') if actividad.dia_hora_termino else None,
        'descripcion': actividad.descripcion,
        'fotos': [{'id': foto.id, 'ruta': foto.ruta_archivo, 'nombre': foto.nombre_archivo} for foto in actividad.fotos],
        'contactos': [{'tipo': contacto.nombre, 'identificador': contacto.identificador} for contacto in actividad.contactos],
        'temas': [{'tema': tema.tema, 'otro': tema.glosa_otro} for tema in actividad.temas]
    })

@app.route('/estadisticas')
def estadisticas():
    return render_template('estadisticas.html')

@app.route('/api/regiones')
def get_regiones():
    regiones = Region.query.all()
    return jsonify([{'id': r.id, 'nombre': r.nombre} for r in regiones])

@app.route('/api/comunas/<int:region_id>')
def get_comunas(region_id):
    comunas = Comuna.query.filter_by(region_id=region_id).all()
    return jsonify([{'id': c.id, 'nombre': c.nombre} for c in comunas])

@app.route('/api/actividad/<int:actividad_id>/comentarios', methods=['GET'])
def obtener_comentarios(actividad_id):
    """Obtener los comentarios de una actividad"""
    try:
        actividad = Actividad.query.get_or_404(actividad_id)
        comentarios = Comentario.query.filter_by(actividad_id=actividad_id).order_by(Comentario.fecha.desc()).all()
        
        comentarios_data = []
        for comentario in comentarios:
            comentarios_data.append({
                'id': comentario.id,
                'nombre': comentario.nombre,
                'texto': comentario.texto,
                'fecha': comentario.fecha.strftime('%Y-%m-%d %H:%M')
            })
        
        return jsonify({
            'success': True,
            'comentarios': comentarios_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/actividad/<int:actividad_id>/comentarios', methods=['POST'])
def agregar_comentario(actividad_id):
    """Agregar un nuevo comentario"""
    try:
        # Verificar que la actividad existe
        actividad = Actividad.query.get_or_404(actividad_id)
        
        data = request.get_json()
        nombre = data.get('nombre', '').strip()
        texto = data.get('texto', '').strip()
        
        errors = {}
        
        if not nombre:
            errors['nombre'] = 'El nombre es obligatorio'
        elif len(nombre) < 3:
            errors['nombre'] = 'El nombre debe tener como mínimo 3 caracteres'
        elif len(nombre) > 80:
            errors['nombre'] = 'El nombre no puede superar los 80 caracteres'
        
        if not texto:
            errors['texto'] = 'Debe tener texto'
        elif len(texto) < 5:
            errors['texto'] = 'El comentario debe tener al menos 5 caracteres'
        elif len(texto) > 300:
            errors['texto'] = 'El comentario no puede superar los 300 caracteres'
        
        if errors:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        nuevo_comentario = Comentario(
            nombre=nombre,
            texto=texto,
            actividad_id=actividad_id
        )
        
        db.session.add(nuevo_comentario)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Comentario agregado!',
            'comentario': {
                'id': nuevo_comentario.id,
                'nombre': nuevo_comentario.nombre,
                'texto': nuevo_comentario.texto,
                'fecha': nuevo_comentario.fecha.strftime('%Y-%m-%d %H:%M')
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/estadisticas/actividades-por-dia')
def estadisticas_actividades_por_dia():
    """Obtener cantidad de actividades por día"""
    try:
        # Limitar actividades de los últimos 30 días
        fecha_limite = datetime.now() - timedelta(days=30)
        
        # Consulta agrupada por fecha
        resultados = db.session.query(
            func.date(Actividad.dia_hora_inicio).label('fecha'),
            func.count(Actividad.id).label('cantidad')
        ).filter(
            Actividad.dia_hora_inicio >= fecha_limite
        ).group_by(
            func.date(Actividad.dia_hora_inicio)
        ).order_by('fecha').all()
        
        datos = []
        for resultado in resultados:
            fecha_str = resultado.fecha.strftime('%Y-%m-%d')
            timestamp = int(resultado.fecha.timestamp() * 1000) # ms
            datos.append([timestamp, resultado.cantidad])
        
        return jsonify({
            'success': True,
            'datos': datos
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/estadisticas/actividades-por-tema')
def estadisticas_actividades_por_tema():
    """Obtener distribución de actividades por tema"""
    try:
        # Consulta agrupada por tema
        resultados = db.session.query(
            ActividadTema.tema,
            func.count(ActividadTema.id).label('cantidad')
        ).group_by(ActividadTema.tema).all()
        
        datos = []
        for resultado in resultados:
            tema = resultado.tema
            if tema == 'otro':
                tema = 'Otros'
            datos.append({
                'name': tema.capitalize(),
                'y': resultado.cantidad
            })
        
        return jsonify({
            'success': True,
            'datos': datos
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/api/estadisticas/actividades-por-horario-mes')
def estadisticas_actividades_por_horario_mes():
    """Obtener actividades por horario y mes"""
    try:
        # Limitar n° actividades a los últimos 12 meses
        fecha_limite = datetime.now() - timedelta(days=365)
        
        resultados = db.session.query(
            extract('year', Actividad.dia_hora_inicio).label('año'),
            extract('month', Actividad.dia_hora_inicio).label('mes'),
            extract('hour', Actividad.dia_hora_inicio).label('hora'),
            func.count(Actividad.id).label('cantidad')
        ).filter(
            Actividad.dia_hora_inicio >= fecha_limite
        ).group_by('año', 'mes', 'hora').all()
        
        # Procesar datos por mes y clasificar por horario
        meses_datos = {}
        meses_nombres = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        
        for resultado in resultados:
            año = int(resultado.año)
            mes = int(resultado.mes)
            hora = int(resultado.hora)
            cantidad = resultado.cantidad
            
            mes_key = f"{año}-{mes:02d}"
            if mes_key not in meses_datos:
                meses_datos[mes_key] = {
                    'nombre': f"{meses_nombres[mes-1]} {año}",
                    'mañana': 0,    # 6-11
                    'mediodia': 0,  # 12-17
                    'tarde': 0      # 18-23
                }
            
            # Clasificar mañana, mediodía y tarde.
            if 6 <= hora <= 11:
                meses_datos[mes_key]['mañana'] += cantidad
            elif 12 <= hora <= 17:
                meses_datos[mes_key]['mediodia'] += cantidad
            elif 18 <= hora <= 23:
                meses_datos[mes_key]['tarde'] += cantidad
        
        categorias = []
        datos_mañana = []
        datos_mediodia = []
        datos_tarde = []
        
        # Ordenar por fecha
        for mes_key in sorted(meses_datos.keys()):
            datos = meses_datos[mes_key]
            categorias.append(datos['nombre'])
            datos_mañana.append(datos['mañana'])
            datos_mediodia.append(datos['mediodia'])
            datos_tarde.append(datos['tarde'])
        
        return jsonify({
            'success': True,
            'categorias': categorias,
            'series': [
                {
                    'name': 'Mañana (6-11h)',
                    'data': datos_mañana
                },
                {
                    'name': 'Mediodía (12-17h)',
                    'data': datos_mediodia
                },
                {
                    'name': 'Tarde (18-23h)',
                    'data': datos_tarde
                }
            ]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500