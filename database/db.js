const { MongoClient } = require('mongodb');

// Configura l'URI e il nome del database
const uri = 'mongodb://localhost:27017'; // Modifica con il tuo URI MongoDB
const dbName = 'RT_reviews_oscars'; // Sostituisci con il nome del tuo database

// Crea un'istanza del client MongoDB
const client = new MongoClient(uri);

// Funzione per connettersi al database
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(dbName); // Restituisce l'istanza del database
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Esce se la connessione fallisce
    }
}

module.exports = connectToDatabase();