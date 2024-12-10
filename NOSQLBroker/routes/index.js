var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json("This is the main route of the NOSQLBroker Server")
});

module.exports = router;
