# Tarea 2 - Desarrollo Web

## Descripción
Esta tarea consiste en implementar una aplicación web que permite gestionar actividades recreativas que están siendo desarrolladas (o se desarrollarán) cerca de algún sector en particular, usando el lenguaje de programación Python con el framework Flask, junto con una base de datos MySQL (MariaDB en Linux Manjaro que es mi notebook) y SQLAlchemy  para abstraer operaciones de base de datos.

La aplicación permite agregar nuevas actividades recreativas con información detallada, visualizar las actividades existentes y consultar información estadística sobre estas.

El frontend está hecho con plantillas HTML5 con Jinja, CSS y usa validaciones para inputs maliciosos con Javascript y HTML en el lado del cliente y Python en el lado del servidor.

Instalar en un ambiente virtual de Python las siguientes dependencias:
```
pip install flask flask-sqlalchemy pymysql werkzeug pillow
```

## Decisiones tomadas
Se separó los comportamientos dinámicos en estos 3 archivos:

`select.js`: Gestión de regiones y comunas mediante llamadas AJAX

`validations.js`: Validaciones de campos del formulario

`form-submission.js`: Manejo de eventos de envío del formulario

