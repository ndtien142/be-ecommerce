'use strict';

const express = require('express');
const cartController = require('../../controllers/cart.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.post('', asyncHandler(cartController.addToCart));
router.put('', asyncHandler(cartController.updateCart));
router.delete('', asyncHandler(cartController.deleteProductItemInCart));
router.get('/:userId', asyncHandler(cartController.getListCart));

module.exports = router;
