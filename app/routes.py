import os
import uuid
from datetime import datetime
from flask import render_template, request, redirect, url_for, flash, jsonify, abort
from werkzeug.utils import secure_filename
from app import app, db
from app.models import Region, Comuna, Actividad, ContactarPor, ActividadTema, Foto

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
        
        import re
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