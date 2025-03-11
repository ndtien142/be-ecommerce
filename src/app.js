require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");

const app = express();

app.use(morgan("dev"));
// morgan("combined");
// morgan("tiny");
// morgan("short");
// morgan("common");
app.use(helmet());
app.use(compression());

// init middlewares

// init db
require("./dbs/init.mongodb");
// const { countConnect } = require("./helpers/check.connect");
// countConnect();

// init routes
app.get("/", (req, res, next) => {
  return res.status(500).json({
    message: "Hello world",
  });
});

// handling error

module.exports = app;
