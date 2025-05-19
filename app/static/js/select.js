const poblarRegiones = async () => {
    const selectRegion = document.getElementById("region");
    
    try {
        const response = await fetch('/api/regiones');
        if (!response.ok) {
            throw new Error('Error al obtener regiones');
        }
        
        const regiones = await response.json();
        
        selectRegion.innerHTML = '<option value="">Seleccione una región</option>';
        
        regiones.forEach(region => {
            const option = document.createElement("option");
            option.value = region.id;
            option.text = region.nombre;
            selectRegion.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando regiones:', error);
    }
};

const updateComunas = async () => {
    const selectRegion = document.getElementById("region");
    const selectComuna = document.getElementById("comuna");
    const selectedRegionId = selectRegion.value;
    
    selectComuna.innerHTML = '<option value="">Seleccione una comuna</option>';
    
    if (!selectedRegionId) return;
    
    try {
        const response = await fetch(`/api/comunas/${selectedRegionId}`);
        if (!response.ok) {
            throw new Error('Error al obtener comunas');
        }
        
        const comunas = await response.json();
        
        comunas.forEach(comuna => {
            const option = document.createElement("option");
            option.value = comuna.nombre;
            option.text = comuna.nombre;
            option.dataset.id = comuna.id;
            selectComuna.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando comunas:', error);
    }
};

function handleContactCheckbox(event) {
    const checkbox = event.target;
    const contactOption = checkbox.closest('.contact-option');
    const inputContainer = contactOption.querySelector('.contact-input-container');
    const input = inputContainer.querySelector('input[type="text"]');
    
    if (checkbox.checked) {
        inputContainer.style.display = 'block';
        input.required = true;
    } else {
        inputContainer.style.display = 'none';
        input.required = false;
        input.value = '';
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
        // Muestra un mensaje de validación
        document.getElementById('tema-validation-message').style.display = 'block';
    } else {
        document.getElementById('tema-validation-message').style.display = 'none';
    }
}

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
                
                photosContainer.insertBefore(newPhotoDiv, addPhotoBtn);
                
                if (photoCount >= maxPhotos) {
                    addPhotoBtn.style.display = 'none';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar regiones desde la base de datos
    await poblarRegiones();
    
    // Actualizar comunas cuando cambia la región
    const regionSelect = document.getElementById("region");
    if (regionSelect) {
        regionSelect.addEventListener("change", updateComunas);
    }

    const contactCheckboxes = document.querySelectorAll('.contact-checkbox');
    contactCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleContactCheckbox);
    });
    
    const temaCheckboxes = document.querySelectorAll('.tema-checkbox');
    temaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleTemaCheckbox);
    });
    
    setupPhotoHandling();
    
    // Inicializar los campos de fecha
    if (typeof setupDateFields === 'function') {
        setupDateFields();
    }
    
    // Aquí se asegura que al menos un tema esté seleccionado
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
});