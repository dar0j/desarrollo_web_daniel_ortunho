// Parámetros constantes de validación 
const MAX_ORGANIZADOR_LENGTH = 200;
const MAX_SECTOR_LENGTH = 100;
const MAX_DESCRIPCION_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 100;
const MIN_CONTACTO_LENGTH = 4;
const MAX_CONTACTO_LENGTH = 50;
const MIN_OTRO_TEMA_LENGTH = 3;
const MAX_OTRO_TEMA_LENGTH = 15;
const PHONE_REGEX = /^\+[0-9]{3}\.[0-9]{8}$/;
const EMAIL_REGEX = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;

function isValidEmail(email) {
    if (!email || email.length > MAX_EMAIL_LENGTH) return false;
    return EMAIL_REGEX.test(email);
}

// Configura los campos de fecha con valores predeterminados
function setupDateFields() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    if (!fechaInicio || !fechaTermino) return;
    
    const now = new Date();
    const formattedNow = formatDate(now);
    
    fechaInicio.value = formattedNow;
    
    // Prellenar fecha de término con fecha de inicio + 3 horas
    updateEndDate();
    
    fechaInicio.addEventListener('change', updateEndDate);
    fechaTermino.addEventListener('change', validateDates);
}

function formatDate(date) {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + 'T' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0');
}

function updateEndDate() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    if (fechaInicio.value) {
        const newStart = new Date(fechaInicio.value);
        const newEnd = new Date(newStart.getTime() + (3 * 60 * 60 * 1000)); // Añadir 3 horas
        fechaTermino.value = formatDate(newEnd);
    }
}

// Valida que la fecha de término sea mayor a la fecha de inicio

function validateDates() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    if (fechaInicio.value && fechaTermino.value) {
        const startDate = new Date(fechaInicio.value);
        const endDate = new Date(fechaTermino.value);
        
        if (endDate <= startDate) {
            alert('La fecha de término debe ser posterior a la fecha de inicio.');
            fechaTermino.value = '';
            
            // Re-establecer (inicio + 3 horas)
            updateEndDate();
            return false;
        }
    }
    return true;
}

/**
 * Valida todos los campos del formulario
 * @returns {boolean} true si todos los campos son válidos
 */
function validateForm() {
    const organizadorInput = document.getElementById("organizador");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("cel");
    const regionInput = document.getElementById("region");
    const comunaInput = document.getElementById("comuna");
    const sectorInput = document.getElementById("sector");
    const descripcionInput = document.getElementById("desc");
    const otroTemaInput = document.getElementById("otro-tema");
    
    if (!validateRequired(organizadorInput, "Por favor, ingrese el nombre del organizador.")) return false;
    if (!validateRequired(emailInput, "Por favor, ingrese un email.")) return false;
    if (!validateRequired(regionInput, "Por favor, seleccione una región.")) return false;
    if (!validateRequired(comunaInput, "Por favor, seleccione una comuna.")) return false;
    
    if (!validateMaxLength(organizadorInput, MAX_ORGANIZADOR_LENGTH, "El nombre del organizador")) return false;
    if (sectorInput.value && !validateMaxLength(sectorInput, MAX_SECTOR_LENGTH, "El sector")) return false;
    if (descripcionInput.value && !validateMaxLength(descripcionInput, MAX_DESCRIPCION_LENGTH, "La descripción")) return false;
    
    // Validación de que al menos un tema esté seleccionado
    const temaCheckboxes = document.querySelectorAll('.tema-checkbox:checked');
    if (temaCheckboxes.length === 0) {
        document.getElementById('tema-validation-message').style.display = 'block';
        return false;
    } else {
        document.getElementById('tema-validation-message').style.display = 'none';
    }
    
    // Validación de "otro tema" si está seleccionado
    const otroTemaCheckbox = document.getElementById('tema-otro');
    if (otroTemaCheckbox && otroTemaCheckbox.checked) {
        if (!validateMinLength(otroTemaInput, MIN_OTRO_TEMA_LENGTH, "La descripción del tema")) return false;
        if (!validateMaxLength(otroTemaInput, MAX_OTRO_TEMA_LENGTH, "La descripción del tema")) return false;
    }
    
    if (!isValidEmail(emailInput.value)) {
        showError(emailInput, "Por favor, ingrese una dirección de correo electrónico válida.");
        return false;
    }
    
    if (phoneInput.value && !PHONE_REGEX.test(phoneInput.value)) {
        showError(phoneInput, "El teléfono debe tener el formato +569.12345678");
        return false;
    }
    
    if (!validateContactInputs()) return false;
    
    if (!validateDates()) return false;

    return true;
}

// Valida que un campo no esté vacío
function validateRequired(input, errorMessage) {
    if (!input.value.trim()) {
        showError(input, errorMessage);
        return false;
    }
    return true;
}

function validateMaxLength(input, maxLength, fieldName) {
    if (input.value.length > maxLength) {
        showError(input, `${fieldName} no puede superar los ${maxLength} caracteres.`);
        return false;
    }
    return true;
}

function validateMinLength(input, minLength, fieldName) {
    if (input.value.length < minLength) {
        showError(input, `${fieldName} debe tener al menos ${minLength} caracteres.`);
        return false;
    }
    return true;
}

// Muestra un mensaje de error y enfoca el campo
function showError(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
    input.focus();
    return false;
}

function validateContactInputs() {
    let isValid = true;
    const contactInputs = document.querySelectorAll('.contact-input-container input[type="text"]');
    
    contactInputs.forEach(input => {
        if (input.required) {
            if (!validateMinLength(input, MIN_CONTACTO_LENGTH, "El ID/URL de contacto")) {
                isValid = false;
                return false;
            }
            if (!validateMaxLength(input, MAX_CONTACTO_LENGTH, "El ID/URL de contacto")) {
                isValid = false;
                return false;
            }
        }
    });
    return isValid;
}

// Inicializa todas las validaciones cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function() {
    setupDateFields();
    
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", function(event) {
            if (!validateForm()) {
                event.preventDefault();
            }
        });
    }
});