// newsletter.js
class NewsletterManager {
    constructor() {
        this.storageKey = 'rap_revolution_newsletter';
        this.initStorage();
        this.initForm();
    }

    initStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({
                subscribers: [],
                lastUpdate: new Date().toISOString()
            }));
        }
    }

    initForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.email.value;
        const button = form.querySelector('button');
        const buttonText = button.querySelector('.button-text');
        const buttonLoader = button.querySelector('.button-loader');

        // Activer le loader
        button.disabled = true;
        buttonText.style.opacity = '0';
        buttonLoader.style.display = 'block';

        try {
            const result = await this.addSubscriber(email);
            this.showMessage(result.message, result.success ? 'success' : 'error');
            if (result.success) {
                form.reset();
            }
        } catch (error) {
            this.showMessage('Une erreur est survenue', 'error');
        } finally {
            // Désactiver le loader
            button.disabled = false;
            buttonText.style.opacity = '1';
            buttonLoader.style.display = 'none';
        }
    }

    async addSubscriber(email) {
        const data = JSON.parse(localStorage.getItem(this.storageKey));
        
        // Vérifier si l'email existe déjà
        if (data.subscribers.some(sub => sub.email === email)) {
            return {
                success: false,
                message: 'Cet email est déjà inscrit'
            };
        }

        // Ajouter le nouvel abonné
        data.subscribers.push({
            id: Date.now(),
            email: email,
            date: new Date().toISOString()
        });

        data.lastUpdate = new Date().toISOString();
        localStorage.setItem(this.storageKey, JSON.stringify(data));

        return {
            success: true,
            message: 'Inscription réussie !'
        };
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('formMessage');
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;

        // Effacer le message après 3 secondes
        setTimeout(() => {
            messageEl.className = 'form-message';
            messageEl.textContent = '';
        }, 3000);
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', function() {
    window.newsletterManager = new NewsletterManager();
});

// Exemple d'utilisation
window.newsletterManager.addSubscriber('test@example.com')
    .then(result => console.log(result));

