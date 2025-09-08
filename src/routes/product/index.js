'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// Authentication - handle check user can access to resource or not
router.use(authentication);

router.post('/', asyncHandler(productController.createProduct));

module.exports = router;
