document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.getElementById('submit-btn');
    const confirmDialog = document.getElementById('confirmation-dialog');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    const backToHome = document.getElementById('back-to-home');
    const form = document.getElementById('activityForm');

    // Al hacer clic en "Agregar esta actividad"
    if (submitBtn) {
        submitBtn.addEventListener('click', function(event) {
            // Evitar envío automático del formulario
            event.preventDefault();
            
            // Validar el formulario desde el HTML nativo
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Validaciones JS
            if (!validateForm()) {
                return;
            }
            
            confirmDialog.style.display = 'block';
        });
    }

    if (confirmYes) {
        confirmYes.addEventListener('click', function() {
            // Esconder el diálogo y enviar el formulario
            confirmDialog.style.display = 'none';
            form.submit();
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener('click', function() {
            confirmDialog.style.display = 'none';
        });
    }

    if (backToHome) {
        backToHome.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
});