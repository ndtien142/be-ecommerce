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

module.exports = app;
