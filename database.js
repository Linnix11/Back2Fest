// database.js
const emailDatabase = {
    subscribers: [],

    addSubscriber(email) {
        // Charger les données existantes avant d'ajouter
        this.loadFromLocalStorage();
        
        if (!this.subscribers.includes(email)) {
            this.subscribers.push({
                email: email,
                date: new Date().toISOString()
            });
            this.saveToLocalStorage();
            return true;
        }
        return false;
    },

    removeSubscriber(email) {
        this.subscribers = this.subscribers.filter(sub => sub.email !== email);
        this.saveToLocalStorage();
    },

    getAllSubscribers() {
        // Charger les données avant de les retourner
        this.loadFromLocalStorage();
        return this.subscribers;
    },

    saveToLocalStorage() {
        localStorage.setItem('newsletterDB', JSON.stringify(this.subscribers));
    },

    loadFromLocalStorage() {
        const saved = localStorage.getItem('newsletterDB');
        if (saved) {
            this.subscribers = JSON.parse(saved);
        }
    },

    exportToCSV() {
        const csvContent = 'data:text/csv;charset=utf-8,Email,Date\n' 
            + this.subscribers.map(sub => `${sub.email},${sub.date}`).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', 'newsletter_subscribers.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    exportToJSON() {
        const jsonContent = 'data:text/json;charset=utf-8,'
            + encodeURIComponent(JSON.stringify(this.subscribers, null, 2));
        const link = document.createElement('a');
        link.setAttribute('href', jsonContent);
        link.setAttribute('download', 'newsletter_subscribers.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Initialiser la base de données
emailDatabase.loadFromLocalStorage();

export default emailDatabase;