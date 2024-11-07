

class DatabaseService {
    constructor() {
        this.DB_NAME = 'rap_revolution_db';
        this.initDatabase();
    }

    initDatabase() {
        const db = localStorage.getItem(this.DB_NAME);
        if (!db) {
            const initialDB = {
                users: [],
                tickets: [],
                sessions: []
            };
            localStorage.setItem(this.DB_NAME, JSON.stringify(initialDB));
        }
    }

    getDatabase() {
        return JSON.parse(localStorage.getItem(this.DB_NAME));
    }

    saveDatabase(data) {
        localStorage.setItem(this.DB_NAME, JSON.stringify(data));
    }

    // Gestion des utilisateurszdd
    async createUser(userData) {
        const db = this.getDatabase();
        
        // Vérifier si l'email existe déjà
        if (db.users.some(user => user.email === userData.email)) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Créer un nouvel utilisateur
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.users.push(newUser);
        this.saveDatabase(db);
        
        // Retourner l'utilisateur sans le mot de passe
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async login(email, password) {
        const db = this.getDatabase();
        const user = db.users.find(u => u.email === email);

        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // En production, utilisez une vraie comparaison de hash
        if (user.password !== password) {
            throw new Error('Email ou mot de passe incorrect');
        }

        // Créer une session
        const session = {
            id: Date.now().toString(),
            userId: user.id,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
        };

        db.sessions.push(session);
        this.saveDatabase(db);

        // Retourner l'utilisateur sans le mot de passe
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            session
        };
    }

    async getUserById(userId) {
        const db = this.getDatabase();
        const user = db.users.find(u => u.id === userId);
        
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateUser(userId, updateData) {
        const db = this.getDatabase();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('Utilisateur non trouvé');
        }

        // Mise à jour de l'utilisateur
        db.users[userIndex] = {
            ...db.users[userIndex],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveDatabase(db);
        
        const { password, ...userWithoutPassword } = db.users[userIndex];
        return userWithoutPassword;
    }

    async deleteUser(userId) {
        const db = this.getDatabase();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('Utilisateur non trouvé');
        }

        // Supprimer l'utilisateur et ses sessions
        db.users.splice(userIndex, 1);
        db.sessions = db.sessions.filter(s => s.userId !== userId);
        
        this.saveDatabase(db);
        return true;
    }

    // Gestion des sessions
    async validateSession(sessionId) {
        const db = this.getDatabase();
        const session = db.sessions.find(s => s.id === sessionId);

        if (!session) {
            throw new Error('Session invalide');
        }

        if (new Date(session.expiresAt) < new Date()) {
            // Supprimer la session expirée
            db.sessions = db.sessions.filter(s => s.id !== sessionId);
            this.saveDatabase(db);
            throw new Error('Session expirée');
        }

        return this.getUserById(session.userId);
    }

    async logout(sessionId) {
        const db = this.getDatabase();
        db.sessions = db.sessions.filter(s => s.id !== sessionId);
        this.saveDatabase(db);
        return true;
    }

    // Gestion des tickets
    async createTicket(userId, ticketData) {
        const db = this.getDatabase();
        const newTicket = {
            id: Date.now().toString(),
            userId,
            ...ticketData,
            createdAt: new Date().toISOString()
        };

        db.tickets.push(newTicket);
        this.saveDatabase(db);
        return newTicket;
    }

    async getUserTickets(userId) {
        const db = this.getDatabase();
        return db.tickets.filter(t => t.userId === userId);
    }
}

// Exportation du service
const dbService = new DatabaseService();
export default dbService;