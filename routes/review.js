var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

});


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
})


module.exports = router;
