'use strict';

const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// Authentication - handle check user can access to resource or not

// get amount discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));

// get list
router.get(
    '/list-product-code',
    asyncHandler(discountController.getAllDiscountWithProduct),
);

router.use(authentication);

// Create new discount
router.post('', asyncHandler(discountController.createDiscount));
router.get('', asyncHandler(discountController.getAllDiscountCodeOfShop));

module.exports = router;
