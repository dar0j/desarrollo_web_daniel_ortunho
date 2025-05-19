import os

SECRET_KEY = os.urandom(32)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload

# Database configuration
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2'
SQLALCHEMY_TRACK_MODIFICATIONS = False