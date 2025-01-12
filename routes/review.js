var express = require('express');
var router = express.Router();


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
