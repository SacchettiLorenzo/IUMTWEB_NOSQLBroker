var express = require('express');
var router = express.Router();


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


/**
 * Route to fetch the latest 10 reviews.
 * @name GET/last_review
 * @function
 * @param {string} path - Endpoint of the route ("/last_review").
 * @returns {Object[]} - An array of the latest 10 reviews sorted by descending date.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
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

/**
 * Route to find the top 10 critics with the most reviews.
 * @name GET/critics/top-10
 * @function
 * @param {string} path - Endpoint of the route ("/critics/top-10").
 * @returns {Object[]} - An array of objects where each object includes a critic's name and totalReviews count.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
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


/**
 * Route to find the top 10 movies based on the largest number of distinct critics.
 * @name GET/movies/top-10-reviewed
 * @function
 * @param {string} path - Endpoint of the route ("/movies/top-10-reviewed").
 * @returns {Object[]} - An array of objects with fields 'movie_title' and 'criticsCount'.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
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
