// Script pour la gestion du formulaire
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const formMessage = document.getElementById('formMessage');

    // Validation des champs
    const validateField = (input) => {
        const value = input.value.trim();
        let error = '';

        switch(input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    error = 'Email invalide';
                }
                break;
            case 'tel':
                const phoneRegex = /^[0-9+\s-]{10,}$/;
                if (!phoneRegex.test(value)) {
                    error = 'Numéro de téléphone invalide';
                }
                break;
            case 'checkbox':
                if (input.name === 'terms' && !input.checked) {
                    error = 'Vous devez accepter les conditions';
                }
                break;
            default:
                if (!value) {
                    error = 'Ce champ est requis';
                }
        }

        const errorElement = input.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = error;
        }
        return !error;
    };

    // Gestionnaire de soumission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Valider tous les champs
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Simuler l'envoi
        const submitBtn = form.querySelector('.submit-button');
        submitBtn.classList.add('loading');

        try {
            // Simulation d'une requête API
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Succès
            formMessage.className = 'form-message success';
            formMessage.textContent = 'Inscription réussie ! Vous recevrez un email de confirmation.';
            form.reset();

        } catch (error) {
            // Erreur
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Une erreur est survenue. Veuillez réessayer.';

        } finally {
            submitBtn.classList.remove('loading');
        }
    });

    // Validation en temps réel
    form.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
});