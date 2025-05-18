import {region_comuna} from "./tg_region_comuna.js";

const poblarRegiones = () => {
    const selectRegion = document.getElementById("region");
    Object.keys(region_comuna).forEach(region => {
        const option = document.createElement("option");
        option.value = region;
        option.text = region;
        selectRegion.appendChild(option);
    });
};

const updateComunas = () => {
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");
    const selectedRegion = selectRegion.value;
    
    // Borrar comunas seleccionadas anteriormente
    selectComuna.innerHTML = '<option value="">Seleccione una comuna</option>';
    
    if (region_comuna[selectedRegion]) {
        region_comuna[selectedRegion].forEach(comuna => {
            const option = document.createElement("option");
            option.value = comuna;
            option.text = comuna;
            selectComuna.appendChild(option);
        });
    }
};

function handleContactCheckbox(event) {
    const checkbox = event.target;
    const contactOption = checkbox.closest('.contact-option');
    const inputContainer = contactOption.querySelector('.contact-input-container');
    const input = inputContainer.querySelector('input[type="text"]');
    
    // Mostrar/ocultar el campo de entrada
    if (checkbox.checked) {
        inputContainer.style.display = 'block';
        input.required = true;
    } else {
        inputContainer.style.display = 'none';
        input.required = false;
        input.value = ''; // Limpiar el valor
    }
    
    // Verificar el límite de 5 selecciones
    const checkedBoxes = document.querySelectorAll('.contact-checkbox:checked');
    if (checkedBoxes.length > 5) {
        checkbox.checked = false;
        inputContainer.style.display = 'none';
        input.required = false;
        alert('Solo puede seleccionar un máximo de 5 opciones de contacto.');
    }
}

// Función para manejar los checkboxes de tema
function handleTemaCheckbox(event) {
    const checkbox = event.target;
    
    // Si es la opción "otro", mostrar/ocultar el campo para especificar
    if (checkbox.id === 'tema-otro') {
        const otroContainer = document.querySelector('.otro-tema-container');
        const otroInput = document.getElementById('otro-tema');
        
        if (checkbox.checked) {
            otroContainer.style.display = 'block';
            otroInput.required = true;
        } else {
            otroContainer.style.display = 'none';
            otroInput.required = false;
            otroInput.value = '';
        }
    }
    
    // Verificar que al menos un tema esté seleccionado
    const checkedTemas = document.querySelectorAll('.tema-checkbox:checked');
    if (checkedTemas.length === 0) {
        // Opcional: mostrar un mensaje de validación
        document.getElementById('tema-validation-message').style.display = 'block';
    } else {
        document.getElementById('tema-validation-message').style.display = 'none';
    }
}

// Función para manejar la adición de fotos
function setupPhotoHandling() {
    let photoCount = 1;
    const maxPhotos = 5;
    const addPhotoBtn = document.getElementById('add-photo');
    const photosContainer = document.getElementById('photos-container');
    
    if (addPhotoBtn && photosContainer) {
        addPhotoBtn.addEventListener('click', function() {
            if (photoCount < maxPhotos) {
                photoCount++;
                
                // Crear nuevo input para foto
                const newPhotoDiv = document.createElement('div');
                newPhotoDiv.innerHTML = `
                    <label for="foto${photoCount}">Foto ${photoCount}: </label>
                    <input type="file" id="foto${photoCount}" name="foto${photoCount}" accept="image/*">
                    <br><br>
                `;
                
                // Insertar antes del botón
                photosContainer.insertBefore(newPhotoDiv, addPhotoBtn);
                
                // Si llegamos al máximo, ocultar el botón
                if (photoCount >= maxPhotos) {
                    addPhotoBtn.style.display = 'none';
                }
            }
        });
    }
}

window.onload = () => {
    // Inicializar regiones y comunas
    poblarRegiones();
    
    // Event listener para actualizar comunas cuando cambia la región
    const regionSelect = document.getElementById("region");
    if (regionSelect) {
        regionSelect.addEventListener("change", updateComunas);
    }

    // Añadir listeners a todos los checkboxes de contacto
    const contactCheckboxes = document.querySelectorAll('.contact-checkbox');
    contactCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleContactCheckbox);
    });
    
    // Añadir listeners a todos los checkboxes de tema
    const temaCheckboxes = document.querySelectorAll('.tema-checkbox');
    temaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleTemaCheckbox);
    });
    
    // Configurar manejo de fotos
    setupPhotoHandling();
    
    // Inicializar los campos de fecha
    if (typeof setupDateFields === 'function') {
        setupDateFields();
    }
    
    // Validación de formulario para asegurar al menos un tema seleccionado
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            const checkedTemas = document.querySelectorAll('.tema-checkbox:checked');
            if (checkedTemas.length === 0) {
                event.preventDefault();
                alert('Debe seleccionar al menos un tema');
                document.getElementById('tema-validation-message').style.display = 'block';
                return false;
            }
        });
    }
};