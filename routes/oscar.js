var express = require('express');
var router = express.Router();

/**
 * Route to provide an overview of the Oscar API.
 * @name GET/
 * @function
 * @param {string} path - Endpoint of the route ("/").
 * @param {callback} middleware - Async function to handle the request and response.
 * @returns {Object} - Overview of the API, including total entries, categories, and winners.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/', async function (req, res, next) {
    try {
        const db = req.app.locals.db;

        // Count total Oscar entries
        const totalEntries = await db.collection('Oscars').countDocuments();

        // Count distinct categories
        const distinctCategories = await db.collection('Oscars').distinct('oscars.category');

        // Count total winners
        const totalWinners = await db.collection('Oscars').aggregate([
            { $unwind: '$oscars' },
            { $match: { 'oscars.winner': true } },
            { $count: 'totalWinners' }
        ]).toArray();

        res.json({
            message: "Welcome to the Oscar API",
            totalEntries,
            totalCategories: distinctCategories.length,
            totalWinners: totalWinners[0]?.totalWinners || 0,
            availableRoutes: [
                { method: "GET", route: "/film/:title", description: "Fetch Oscars by film title" },
                { method: "GET", route: "/category/:category", description: "Fetch Oscars by category" },
                { method: "GET", route: "/year_film/:year", description: "Fetch Oscars by year of the film" },
                { method: "GET", route: "/winner/:status", description: "Fetch Oscars by winner status" },
                { method: "GET", route: "/top/:limit", description: "Fetch top films by most Oscar wins" },
                { method: "GET", route: "/categories", description: "Fetch all distinct Oscar categories" }
            ]
        });
    } catch (error) {
        console.error('Error while generating API overview:', error);
        res.status(500).json({ error: 'Error while generating API overview.' });
    }
});

/**
 * Route to fetch all Oscars.
 * @name GET/all
 * @function
 * @param {string} path - Endpoint of the route ("/all").
 * @returns {Array} - An array of all Oscars in the database.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/all', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const allOscars = await db.collection('Oscars').find().toArray();
        res.json(allOscars);
    } catch (error) {
        console.error('Error while fetching all Oscars:', error);
        res.status(500).json({ error: 'Error while fetching all Oscars.' });
    }
});

/**
 * Route to fetch Oscars by film title.
 * @name GET/film/:title
 * @function
 * @param {string} path - Endpoint of the route ("/film/:title").
 * @param {string} title - The title of the film to search for (case-insensitive).
 * @returns {Array} - An array of Oscars for the specified film.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/film/:title', async function (req, res, next) {
    try {
        const db = req.app.locals.db; // Accedi al database tramite app.locals
        const { title } = req.params; // Estrarre il parametro del titolo dal percorso

        // Cerca il titolo del film usando il campo "movie_title"
        const oscarsByFilm = await db
            .collection('Oscars') // Nome corretto della collezione
            .find({ movie_title: new RegExp(title, 'i') }) // Ricerca case-insensitive
            .toArray();

        res.json(oscarsByFilm); // Restituisce i risultati trovati
    } catch (error) {
        console.error('Error while fetching Oscars by film title:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by film title.' });
    }
});

/**
 * Route to fetch Oscars by category.
 * @name GET/category/:category
 * @function
 * @param {string} path - Endpoint of the route ("/category/:category").
 * @param {string} category - The category to search for (case-insensitive).
 * @returns {Array} - An array of Oscars in the specified category.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/category/:category', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { category } = req.params;

        const oscarsByCategory = await db
            .collection('Oscars')
            .find({ 'oscars.category': new RegExp(category, 'i') })
            .toArray();
        res.json(oscarsByCategory);
    } catch (error) {
        console.error('Error while fetching Oscars by category:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by category.' });
    }
});


/**
 * Route to fetch Oscars by year of the film.
 * @name GET/year_film/:year
 * @function
 * @param {string} path - Endpoint of the route ("/year_film/:year").
 * @param {number} year - The year of the film to search for.
 * @returns {Array} - An array of Oscars for films released in the specified year.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/year_film/:year', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { year } = req.params;

        const oscarsByYear = await db
            .collection('Oscars')
            .find({ 'oscars.year_film': parseInt(year) })
            .toArray();
        res.json(oscarsByYear);
    } catch (error) {
        console.error('Error while fetching Oscars by year of the film:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by year of the film.' });
    }
});

/**
 * Route to fetch Oscars by winner status.
 * @name GET/winner/:status
 * @function
 * @param {string} path - Endpoint of the route ("/winner/:status").
 * @param {boolean} status - The winner status to search for (`true` or `false`).
 * @returns {Array} - An array of Oscars matching the winner status.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/winner/:status', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { status } = req.params;

        const winnerStatus = status === 'true';
        const oscarsByWinner = await db
            .collection('Oscars')
            .find({ 'oscars.winner': winnerStatus })
            .toArray();
        res.json(oscarsByWinner);
    } catch (error) {
        console.error('Error while fetching Oscars by winner status:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by winner status.' });
    }
});

/**
 * Route to fetch top films with the most nominations.
 * @name GET/top/:limit
 * @function
 * @param {string} path - Endpoint of the route ("/top/:limit").
 * @param {number} limit - The number of top films to fetch.
 * @returns {Array} - An array of top films with the most Oscar wins.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/top/:limit', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { limit } = req.params;

        const topFilms = await db
            .collection('Oscars')
            .aggregate([
                { $unwind: '$oscars' },
                { $match: { 'oscars.winner': true } },
                {
                    $group: {
                        _id: '$movie_title',
                        totalWins: { $sum: 1 }
                    }
                },
                { $sort: { totalWins: -1 } },
                { $limit: parseInt(limit, 10) }
            ])
            .toArray();
        res.json(topFilms);
    } catch (error) {
        console.error('Error while fetching top films:', error);
        res.status(500).json({ error: 'Error while fetching top films.' });
    }
});

router.get('/test', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const testResults = await db.collection('Oscars').find().limit(10).toArray(); // Mostra i primi 10 documenti
        res.json({ message: 'Database connection is working', samples: testResults });
    } catch (error) {
        console.error('Error during database connection test:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

/**
 * Route to fetch films with the most nominations.
 * @name GET/nominations/top/:limit
 * @function
 * @param {string} path - Endpoint of the route ("/nominations/top/:limit").
 * @param {number} limit - The number of top films to fetch.
 * @returns {Array} - An array of films with the most Oscar nominations.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/nominations/top/:limit', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { limit } = req.params;

        const topNominatedFilms = await db
            .collection('Oscars')
            .aggregate([
                { $unwind: '$oscars' }, // Separa ogni elemento dell'array per elaborarlo singolarmente
                {
                    $group: {
                        _id: '$oscars.film', // Raggruppa per titolo del film
                        totalNominations: { $sum: 1 } // Conta tutte le nomination (vincitrici e non)
                    }
                },
                { $sort: { totalNominations: -1 } }, // Ordina per numero di nomination decrescente
                { $limit: parseInt(limit, 10) } // Limita ai primi N film specificati dal parametro
            ])
            .toArray();

        res.json(topNominatedFilms);
    } catch (error) {
        console.error('Error while fetching top nominated films:', error);
        res.status(500).json({ error: 'Error while fetching top nominated films.' });
    }
});


module.exports = router;
