'use strict';

const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth');
const router = express.Router();

// Check api key
router.use(apiKey);

router.use(permission('0000'));

router.use('/v1/api/checkout', require('./checkout'));

router.use('/v1/api/shop', require('./access'));

router.use('/v1/api/product', require('./product'));

router.use('/v1/api/discount', require('./discount'));

router.use('/v1/api/cart', require('./cart'));

module.exports = router;
