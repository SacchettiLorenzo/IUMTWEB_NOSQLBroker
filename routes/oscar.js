var express = require('express');
var router = express.Router();

/**
 * Route to provide an overview of the Oscar API.
 * @name GET/
 * @function
 * @param {string} path - Endpoint of the route ("/").
 * @param {callback} middleware - Async function to handle the request and response.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/', async function (req, res, next) {
    try {
        // Count total Oscar entries
        const totalEntries = await db.collection('oscar').countDocuments();

        // Count distinct categories
        const distinctCategories = await db.collection('oscar').distinct('oscar.category');

        // Count total winners
        const totalWinners = await db.collection('oscar').aggregate([
            { $unwind: '$oscar' },
            { $match: { 'oscar.winner': true } },
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
                { method: "GET", route: "/categories", description: "Fetch all distinct Oscar categories" },
                { method: "GET", route: "/search", description: "Perform advanced search with filters" }
            ]
        });
    } catch (error) {
        console.error('Error while generating API overview:', error);
        res.status(500).json({ error: 'Error while generating API overview.' });
    }
});

/**
 * Route to fetch all Oscars.
 * @name GET/
 * @function
 * @param {string} path - Endpoint of the route ("/").
 * @param {callback} middleware - Async function to handle the request and response.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/', async function (req, res, next) {
    try {
        const allOscars = await db.collection('oscar').find().toArray();
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
 * @param {callback} middleware - Async function to handle the request and response.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/film/:title', async function (req, res, next) {
    try {
        const { title } = req.params;
        const oscarsByFilm = await db
            .collection('oscar')
            .find({ 'oscar.film': new RegExp(title, 'i') })
            .toArray();
        res.json(oscarsByFilm);
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
 * @param {callback} middleware - Async function to handle the request and response.
 * @throws {Error} - Returns a 500 status if an error occurs.
 */
router.get('/category/:category', async function (req, res, next) {
    try {
        const { category } = req.params;
        const oscarsByCategory = await db
            .collection('oscar')
            .find({ 'oscar.category': new RegExp(category, 'i') })
            .toArray();
        res.json(oscarsByCategory);
    } catch (error) {
        console.error('Error while fetching Oscars by category:', error);
        res.status(500).json({ error: 'Error while fetching Oscars by category.' });
    }
});


module.exports = router;
