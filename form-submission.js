document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const confirmDialog = document.getElementById('confirmation-dialog');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const successMessage = document.getElementById('success-message');
    const backToHome = document.getElementById('back-to-home');
    const form = document.getElementById('activityForm');

    // Al hacer clic en "Agregar esta actividad"
    submitBtn.addEventListener('click', function() {
        // Validar el formulario una sola vez usando las validaciones nativas del HTML
        if (!form.checkValidity()) {
            // Esto activará los mensajes de error nativos del navegador
            form.reportValidity();
            return;
        }
        
        // Validaciones adicionales que no se pueden hacer con HTML
        if (!validateForm()) {
            return;
        }
        
        // Si pasa todas las validaciones, mostrar diálogo de confirmación
        confirmDialog.style.display = 'block';
    });

    // Al hacer clic en "Sí, estoy seguro"
    confirmYes.addEventListener('click', function() {
        confirmDialog.style.display = 'none';
        successMessage.style.display = 'block';
        form.style.display = 'none';
        submitBtn.style.display = 'none';
    });

    // Al hacer clic en "No, no estoy seguro"
    confirmNo.addEventListener('click', function() {
        confirmDialog.style.display = 'none';
    });

    // Al hacer clic en "Volver a la portada"
    backToHome.addEventListener('click', function() {
        window.location.href = 'portada.html';
    });
});