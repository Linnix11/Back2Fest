// auth.js

export class AuthService {
    constructor() {
        this.DB_NAME = 'rap_revolution_db';
        this.SESSION_KEY = 'rap_revolution_session';
        this.initDatabase();
        this.currentUser = this.checkSession();
    }

    initDatabase() {
        if (!localStorage.getItem(this.DB_NAME)) {
            const initialDB = {
                users: [],
                sessions: [],
                tickets: [],
                profiles: []
            };
            localStorage.setItem(this.DB_NAME, JSON.stringify(initialDB));
        }
    }

    checkSession() {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (!sessionData) return null;

        const session = JSON.parse(sessionData);
        const now = new Date().getTime();

        if (now > session.expiresAt) {
            localStorage.removeItem(this.SESSION_KEY);
            return null;
        }

        return session.user;
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem(this.DB_NAME));
    }

    saveDatabase(data) {
        localStorage.setItem(this.DB_NAME, JSON.stringify(data));
    }

    createSession(user) {
        const session = {
            user,
            createdAt: new Date().getTime(),
            expiresAt: new Date().getTime() + (7 * 24 * 60 * 60 * 1000) // 7 jours
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        this.currentUser = user;
    }

    async register(userData) {
        const db = this.getDatabase();
        
        // Vérifier si l'email existe
        if (db.users.some(user => user.email === userData.email)) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Validation du mot de passe
        if (userData.password.length < 8) {
            throw new Error('Le mot de passe doit contenir au moins 8 caractères');
        }

        // Créer l'utilisateur
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // En production, hasher le mot de passe
            phone: userData.phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'user'
        };

        // Créer le profil
        const newProfile = {
            userId: newUser.id,
            avatar: null,
            preferences: {
                newsletter: userData.newsletter || false,
                notifications: true
            }
        };

        db.users.push(newUser);
        db.profiles.push(newProfile);
        this.saveDatabase(db);

        // Créer la session
        const { password, ...safeUser } = newUser;
        this.createSession(safeUser);

        return safeUser;
    }

    async login(email, password) {
        const db = this.getDatabase();
        const user = db.users.find(u => u.email === email);

        if (!user || user.password !== password) {
            throw new Error('Email ou mot de passe incorrect');
        }

        const { password: _, ...safeUser } = user;
        this.createSession(safeUser);

        return safeUser;
    }

    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async updateProfile(userId, updateData) {
        const db = this.getDatabase();
        const userIndex = db.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Utilisateur non trouvé');
        }

        // Mise à jour utilisateur
        const updatedUser = {
            ...db.users[userIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        // Ne pas écraser le mot de passe si non fourni
        if (!updateData.password) {
            updatedUser.password = db.users[userIndex].password;
        }

        db.users[userIndex] = updatedUser;
        this.saveDatabase(db);

        const { password, ...safeUser } = updatedUser;
        this.currentUser = safeUser;
        this.createSession(safeUser); // Rafraîchir la session

        return safeUser;
    }

    async updateAvatar(userId, avatarUrl) {
        const db = this.getDatabase();
        const profile = db.profiles.find(p => p.userId === userId);
        
        if (profile) {
            profile.avatar = avatarUrl;
            this.saveDatabase(db);
        }
    }

    async buyTicket(ticketData) {
        if (!this.currentUser) {
            throw new Error('Vous devez être connecté pour acheter un billet');
        }

        const db = this.getDatabase();
        const newTicket = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            ...ticketData,
            status: 'valid',
            purchaseDate: new Date().toISOString(),
            validationDate: null
        };

        db.tickets.push(newTicket);
        this.saveDatabase(db);
        return newTicket;
    }

    getMyTickets() {
        if (!this.currentUser) return [];
        
        const db = this.getDatabase();
        return db.tickets.filter(t => t.userId === this.currentUser.id);
    }

    async deleteAccount(userId) {
        if (!this.currentUser || this.currentUser.id !== userId) {
            throw new Error('Non autorisé');
        }

        const db = this.getDatabase();
        
        // Supprimer l'utilisateur et ses données associées
        db.users = db.users.filter(u => u.id !== userId);
        db.profiles = db.profiles.filter(p => p.userId !== userId);
        db.tickets = db.tickets.filter(t => t.userId !== userId);
        
        this.saveDatabase(db);
        this.logout();
    }

    // Utilitaires pour la gestion des erreurs et messages
    handleError(error) {
        console.error('Auth Error:', error);
        return {
            success: false,
            message: error.message || 'Une erreur est survenue',
            error: error
        };
    }

    handleSuccess(data) {
        return {
            success: true,
            data: data
        };
    }
}

// Export de l'instance par défaut
export const authService = new AuthService();