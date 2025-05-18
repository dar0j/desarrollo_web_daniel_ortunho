function isValidEmail(email) {
    return /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(email);
}

// Función para prellenar las fechas cuando se carga la página
function setupDateFields() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    if (!fechaInicio || !fechaTermino) return;
    
    // Prellenar fecha de inicio con la fecha y hora actual
    const now = new Date();
    const formattedNow = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + 'T' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0');
    
    fechaInicio.value = formattedNow;
    
    // Prellenar fecha de término con fecha de inicio + 3 horas
    updateEndDate();
    
    // Añadir event listeners para la validación
    fechaInicio.addEventListener('change', updateEndDate);
    fechaTermino.addEventListener('change', validateDates);
}

// Actualiza la fecha de término para que sea 3 horas después de la fecha de inicio
function updateEndDate() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    if (fechaInicio.value) {
        const newStart = new Date(fechaInicio.value);
        const newEnd = new Date(newStart.getTime() + (3 * 60 * 60 * 1000)); // Añadir 3 horas
        
        const formattedNewEnd = newEnd.getFullYear() + '-' + 
                         String(newEnd.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(newEnd.getDate()).padStart(2, '0') + 'T' + 
                         String(newEnd.getHours()).padStart(2, '0') + ':' + 
                         String(newEnd.getMinutes()).padStart(2, '0');
        
        fechaTermino.value = formattedNewEnd;
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
            fechaTermino.value = ''; // Limpiar el valor incorrecto
            
            // Re-establecer valor predeterminado (inicio + 3 horas)
            updateEndDate();
        }
    }
}

document.querySelector("form").addEventListener("submit", function(event) {
    const phoneInput = document.getElementById("cel");
    const phoneRegex = /\+[0-9]{3}\.[0-9]{8}/;
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');
    
    // Validación del teléfono
    if (phoneInput.value && !phoneRegex.test(phoneInput.value)) {
        event.preventDefault();
        phoneInput.setCustomValidity("El teléfono debe tener el formato +569.12345678");
        phoneInput.reportValidity();
        return;
    } else {
        phoneInput.setCustomValidity("");
    }
    
    // Validación de fechas en el envío
    if (fechaInicio && fechaTermino && fechaInicio.value && fechaTermino.value) {
        const startDate = new Date(fechaInicio.value);
        const endDate = new Date(fechaTermino.value);
        
        if (endDate <= startDate) {
            event.preventDefault();
            alert('La fecha de término debe ser posterior a la fecha de inicio.');
            return;
        }
    }
});

function validateForm() {
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("cel");
    const regionInput = document.getElementById("region");
    const comunaInput = document.getElementById("comuna");
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaTermino = document.getElementById('fecha_termino');

    if (!isValidEmail(emailInput.value)) {
        alert("Por favor, ingrese una dirección de correo electrónico válida.");
        return false;
    }

    if (phoneInput.value && !/\+[0-9]{3}\.[0-9]{8}/.test(phoneInput.value)) {
        alert("El teléfono debe tener el formato +569.12345678");
        return false;
    }

    if (regionInput.value === "") {
        alert("Por favor, seleccione una región.");
        return false;
    }

    if (comunaInput.value === "") {
        alert("Por favor, seleccione una comuna.");
        return false;
    }
    
    // Validación de fechas
    if (fechaInicio && fechaTermino && fechaInicio.value && fechaTermino.value) {
        const startDate = new Date(fechaInicio.value);
        const endDate = new Date(fechaTermino.value);
        
        if (endDate <= startDate) {
            alert('La fecha de término debe ser posterior a la fecha de inicio.');
            return false;
        }
    }

    return true;
}