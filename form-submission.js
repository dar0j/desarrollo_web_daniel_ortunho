document.addEventListener('DOMContentLoaded', function() {
    // Capturar elementos del DOM
    const submitBtn = document.getElementById('submit-btn');
    const confirmationDialog = document.getElementById('confirmation-dialog');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    const successMessage = document.getElementById('success-message');
    const backToHomeBtn = document.getElementById('back-to-home');
    const form = document.querySelector('form');
    
    if (submitBtn && confirmationDialog && form) {
        // Mostrar diálogo de confirmación al hacer clic en "Agregar esta actividad"
        submitBtn.addEventListener('click', function() {
            if (form.checkValidity()) {
                // Verificar que al menos un tema esté seleccionado
                const checkedTemas = document.querySelectorAll('.tema-checkbox:checked');
                if (checkedTemas.length === 0) {
                    document.getElementById('tema-validation-message').style.display = 'block';
                    return;
                }
                
                // Mostrar el diálogo de confirmación
                confirmationDialog.style.display = 'block';
            } else {
                form.reportValidity();
            }
        });
    }
    
    if (confirmYesBtn && successMessage) {
        // Manejar clic en "Sí, estoy seguro"
        confirmYesBtn.addEventListener('click', function() {
            // Ocultar el formulario y la confirmación
            if (form) form.style.display = 'none';
            confirmationDialog.style.display = 'none';
            
            // Mostrar mensaje de éxito
            successMessage.style.display = 'block';
        });
    }
    
    if (confirmNoBtn) {
        // Manejar clic en "No, no estoy seguro"
        confirmNoBtn.addEventListener('click', function() {
            confirmationDialog.style.display = 'none';
        });
    }
    
    if (backToHomeBtn) {
        // Manejar clic en "Volver a la portada"
        backToHomeBtn.addEventListener('click', function() {
            window.location.href = 'portada.html';
        });
    }
});