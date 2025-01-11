var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./swagger/docs.json');


var indexRouter = require('./routes/index');
var oscarRouter = require('./routes/oscar');
var reviewRouter = require('./routes/review');

var app = express();

// Importa la connessione al database
const dbPromise = require('./database/db');

// Associa il database a `app.locals` una volta che la connessione è stabilita
dbPromise.then((db) => {
    app.locals.db = db; // Rende il database accessibile tramite app.locals
}).catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Esce se la connessione fallisce
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/oscar', oscarRouter);
app.use('/review', reviewRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));


module.exports = app;
