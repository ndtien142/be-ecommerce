require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const compression = require('compression');

const app = express();

// parse application/json
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
// morgan("combined");
// morgan("tiny");
// morgan("short");
// morgan("common");
app.use(helmet());
app.use(compression());

// init middlewares

// init db
require('./dbs/init.mongodb');
// const { countConnect, checkOverload } = require('./helpers/check.connect');

// countConnect();
// checkOverload();

// init routes
app.use('/', require('./routes'));

// handling error
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        status: 'error',
        code: error.status || 500,
        message: error.message || 'Internal Server Error',
    });
});

module.exports = app;
