# Tarea 1 - Desarrollo Web

## Descripción
Esta tarea consiste en la implementación de una página HTML, CSS y Javascript. 
Aplicación web que permita gestionar actividades recreativas que están siendo desarrolladas (o se desarrollarán) cerca suyo o de algún sector en particular. 
Además, la aplicación debe permitir agregar una nueva actividad recreativa con fecha y hora de inicio y si corresponde, fecha y hora de término, entre otros datos.

Debe usar HTML5 y CSS3. No se complique con el diseño gráfico.
En esta tarea NO ES NECESARIO USAR un servidor web. Basta con desarrollar
archivos HTML, enlazarlos entre ellos y los abre directamente con el navegador web.
Tampoco es necesario almacenar la información que ingresa el usuario, esto es
solo un prototipo para validar las interfaces, navegación y reglas que deben cumplir los
datos.
Respete los tipos de los input del formulario.
En la evaluación se utilizará el validador de HTML (http://validator.w3.org/) y CSS
(http://jigsaw.w3.org/css-validator/) de W3C.
Pruebe que sus archivos funcionen bien en distintos navegadores y en distintas
resoluciones de pantalla.
Cada una de las validaciones deben ser hechas en JavaScript. El uso del atributo
required de los formularios, NO cuenta como validación.
Debe incluir un archivo README.md, en el cual explique algún detalle o decisión que
usted tomó y que se deba tener en cuenta.

## Decisiones tomadas

### Estructura de archivos
- Se implementó una estructura modular separando la funcionalidad en múltiples archivos JavaScript para facilitar el mantenimiento:
  - `select.js`: Gestión de regiones y comunas
  - `validations.js`: Validaciones de campos del formulario
  - Formularios integrados directamente en HTML con JavaScript para validación

### Diseño e interfaz
- Se priorizó un diseño simple y funcional enfocado en la usabilidad
- Se utilizaron variables CSS para mantener una paleta de colores consistente
- Se implementó un diseño responsivo básico para funcionar en diferentes tamaños de pantalla

### Validaciones
- Se implementaron validaciones tanto del lado del cliente mediante JavaScript como con atributos HTML5:
  - Validación de formato de email con expresiones regulares
  - Validación de número de teléfono con el formato +NNN.NNNNNNNN
  - Validación de fechas para asegurar que la fecha de término sea posterior a la fecha de inicio
  - Validación de selección de al menos un tema para la actividad

### Gestión de imágenes
- Se establecieron dos tamaños estándar para las imágenes:
  - Miniaturas: 320x240 píxeles
  - Visualización completa: 800x600 píxeles
- Se implementó un sistema modal para visualizar las imágenes en tamaño completo

### Navegación
- Se diseñó un sistema de navegación intuitivo con botones claros para volver atrás
- Se implementó un flujo de confirmación antes de agregar una actividad para evitar envíos accidentales

### Datos
- Para este prototipo, se utilizaron datos estáticos para demostración
- La estructura de datos se diseñó pensando en una futura implementación con base de datos
