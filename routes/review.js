var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

});

//route per ottenere tutte le reviews da tutti film
router.get('/reviews/all', async function(req, res, next) {
    try {
        const db = req.app.locals.db;

        const allReviews = await db.collection('Reviews').aggregate([
            { $unwind: '$reviews' },
            { $replaceRoot: { newRoot: '$reviews' } }
        ]).toArray();

        res.json(allReviews);

    } catch (error) {
        console.error('Error getting all reviews', error);
        res.status(500).json({ error: 'Error getting all reviews.' });
    }
});

// cerca il titolo del film
router.get('/reviews/film/:title', async function (req, res, next) {
    try {
        const db = req.app.locals.db;
        const { title } = req.params;

        const reviewsByFilm = await db.collection('Reviews').findOne(
            { movie_title: new RegExp(title, 'i') },
            { projection: { reviews: 1, _id: 0 } }
        );

        res.json(reviewsByFilm?.reviews || []);
    } catch (error) {
        console.error('Error while fetching reviews by film title:', error);
        res.status(500).json({ error: 'Error while fetching reviews by film title.' });
    }
});

//route per trovare le reviews dal publisher
router.get('/reviews/publisher/:publisher', async function (req, res, next) {
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
router.get('/reviews/top_critic/:status', async function (req, res, next) {
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











module.exports = router;
