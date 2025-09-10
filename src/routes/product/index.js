'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const asyncHandler = require('../../middleware/handleError');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

router.get(
    '/search/:searchText',
    asyncHandler(productController.searchProduct),
);
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:id', asyncHandler(productController.findProduct));

// Authentication - handle check user can access to resource or not
router.use(authentication);

router.post('/', asyncHandler(productController.createProduct));

router.patch('/:id', asyncHandler(productController.updateProduct));

router.put('/publish/:id', asyncHandler(productController.publishProduct));

router.put('/unpublish/:id', asyncHandler(productController.unpublishProduct));

// QUERY
router.get(
    '/published/all',
    asyncHandler(productController.getAllPublishForShop),
);
router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));

module.exports = router;
