from app import db
from datetime import datetime

class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    comunas = db.relationship('Comuna', backref='region', lazy=True)

class Comuna(db.Model):
    __tablename__ = 'comuna'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)

class Actividad(db.Model):
    __tablename__ = 'actividad'
    id = db.Column(db.Integer, primary_key=True)
    comuna_id = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)
    sector = db.Column(db.String(100), nullable=True)
    nombre = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    celular = db.Column(db.String(15), nullable=True)
    dia_hora_inicio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    dia_hora_termino = db.Column(db.DateTime, nullable=True)
    descripcion = db.Column(db.String(500), nullable=True)
    
    comuna = db.relationship('Comuna', backref='actividades')
    fotos = db.relationship('Foto', backref='actividad', lazy=True)
    contactos = db.relationship('ContactarPor', backref='actividad', lazy=True)
    temas = db.relationship('ActividadTema', backref='actividad', lazy=True)

class Foto(db.Model):
    __tablename__ = 'foto'
    id = db.Column(db.Integer, primary_key=True)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)

class ContactarPor(db.Model):
    __tablename__ = 'contactar_por'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.Enum('whatsapp', 'telegram', 'X', 'instagram', 'tiktok', 'otra'), nullable=False)
    identificador = db.Column(db.String(150), nullable=False)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)

class ActividadTema(db.Model):
    __tablename__ = 'actividad_tema'
    id = db.Column(db.Integer, primary_key=True)
    tema = db.Column(db.Enum('música', 'deporte', 'ciencias', 'religión', 'política', 'tecnología', 'juegos', 'baile', 'comida', 'otro'), nullable=False)
    glosa_otro = db.Column(db.String(15), nullable=True)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)