var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
    try {
        const db = req.app.locals.db;

        // Conta il numero totale di recensioni
        const totalReviews = await db.collection('Reviews').countDocuments();

        // Conta il numero di critici distinti
        const distinctCritics = await db.collection('Reviews').distinct('reviews.critic_name');

        // Conta il numero totale di recensioni con critici top
        const totalTopCriticReviews = await db.collection('Reviews').aggregate([
            { $unwind: '$reviews' },
            { $match: { 'reviews.top_critic': true } },
            { $count: 'totalTopCriticReviews' }
        ]).toArray();

        res.json({
            message: "Welcome to the Reviews API",
            totalReviews,
            totalCritics: distinctCritics.length,
            totalTopCriticReviews: totalTopCriticReviews[0]?.totalTopCriticReviews || 0,
            availableRoutes: [
                { method: "GET", route: "/all", description: "Fetch all reviews" },
                { method: "GET", route: "/movie/:title", description: "Fetch reviews by film title" },
                { method: "GET", route: "/publisher/:publisher", description: "Fetch reviews by publisher" },
                { method: "GET", route: "/top_critic/:status", description: "Fetch reviews by top critic status (true/false)" }
            ]
        });
    } catch (error) {
        console.error('Error while generating API overview:', error);
        res.status(500).json({ error: 'Error while generating API overview.' });
    }
});


//route per ottenere tutte le reviews da tutti film
router.get('/all', async function(req, res, next) {
    try {
        const db = req.app.locals.db;

        const allReviews = await db.collection('Reviews').find().toArray();

        res.json(allReviews);

    } catch (error) {
        console.error('Error getting all reviews', error);
        res.status(500).json({ error: 'Error getting all reviews.' });
    }
});

// cerca il titolo del film
router.get('/movie/:title', async function (req, res, next) {
    try {
        const db = req.app.locals.db; // Accedi al database tramite app.locals
        const { title } = req.params; // Estrarre il parametro del titolo dal percorso

        const reviewsByFilm = await db
            .collection('Reviews') // Nome corretto della collezione
            .findOne({ movie_title: title }) // Ricerca case-insensitive

        res.json(reviewsByFilm);
        //res.json(reviewsByFilm); // Restituisce i risultati trovati
    } catch (error) {
        console.error('Error while fetching Reviews by film title:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by film title.' });
    }
});

//route per trovare le reviews dal publisher
router.get('/publisher/:publisher', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { publisher } = req.params;

        const reviewsByPublisher = await db.collection('Reviews').aggregate([
            { $unwind: '$reviews' },
            { $match: { 'reviews.publisher_name': new RegExp(publisher, 'i') } },
            { $replaceRoot: { newRoot: '$reviews' } }
        ]).toArray();

        res.json(reviewsByPublisher);
    } catch (error) {
        console.error('Error while fetching reviews by publisher:', error);
        res.status(500).json({ error: 'Error while fetching reviews by publisher.' });
    }
});

//per trovare le reviews top critic
router.get('/top_critic/:status', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { status } = req.params;

        const topCritic = status === 'true';

        const reviewsByTopCritic = await db.collection('Reviews').aggregate([
            { $unwind: '$reviews' },
            { $match: { 'reviews.top_critic': topCritic } },
            { $replaceRoot: { newRoot: '$reviews' } }
        ]).toArray();

        res.json(reviewsByTopCritic);
    } catch (error) {
        console.error('Error while fetching reviews by top critic:', error);
        res.status(500).json({ error: 'Error while fetching reviews by top critic.' });
    }
});

router.get('/last_review', async function (req, res, next) {
    try{
        const db = req.app.locals.db;
        const { status } = req.params;

        const last_review = await db.collection('Reviews').aggregate([
            { $unwind: '$reviews' },
            { $sort: {'reviews.review_date':-1} },
        ]).limit(10).toArray();
        res.json(last_review);
    }catch(error){
        console.error('Error while fetching reviews by last review:', error);
        res.status(500).json({ error: 'Error while fetching latest review.' });
    }
});

// Route per trovare i top 10 critici più presenti
router.get('/critics/top-10', async function(req, res, next) {
    try {
        const db = req.app.locals.db;

        const pipeline = [
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: '$reviews.critic_name',
                    totalReviews: { $sum: 1 }
                }
            },
            { $sort: { totalReviews: -1 } },
            { $limit: 10 }
        ];

        const topCritics = await db.collection('Reviews').aggregate(pipeline).toArray();

        res.json(topCritics);
    } catch (error) {
        console.error('Error getting top 10 critics', error);
        res.status(500).json({ error: 'Error getting top 10 critics.' });
    }
});

// Route per trovare i 10 film con più critici (distinti) che li hanno recensiti
router.get('/movies/top-10-reviewed', async function(req, res, next) {
    try {
        const db = req.app.locals.db;

        const pipeline = [
            { $unwind: '$reviews' },
            {
                $group: {
                    _id: '$movie_title',
                    distinctCritics: { $addToSet: '$reviews.critic_name' }
                }
            },
            {
                $project: {
                    movie_title: '$_id',
                    criticsCount: { $size: '$distinctCritics' },
                    _id: 0
                }
            },
            { $sort: { criticsCount: -1 } },
            { $limit: 10 }
        ];

        const topReviewedMovies = await db.collection('Reviews').aggregate(pipeline).toArray();

        res.json(topReviewedMovies);
    } catch (error) {
        console.error('Error getting top 10 reviewed movies', error);
        res.status(500).json({ error: 'Error getting top 10 reviewed movies.' });
    }
});

module.exports = router;
