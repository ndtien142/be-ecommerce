'use strict';

const { CREATED, SuccessResponse } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
    createProduct = async (req, res, next) => {
        new CREATED({
            message: 'Product created successfully',
            metadata: await ProductService.createProduct(
                req.body.product_type,
                { ...req.body, product_shop: req.userId },
            ),
        }).send(res, {
            'Content-Type': 'application/json',
        });
    };

    // QUERY
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list draft success!',
            metadata: await ProductService.findAllDraftsForShop({
                ...req.query,
                product_shop: req.userId,
            }),
        }).send(res);
    };

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list publish success',
            metadata: await ProductService.findAllPublishProduct({
                ...req.query,
                product_shop: req.userId,
            }),
        }).send(res);
    };

    // PUT
    publishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Publish product success',
            metadata: await ProductService.publicProductByShop({
                product_id: req.params.id,
                product_shop: req.userId,
            }),
        }).send(res);
    };
    unpublishProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Unpublish product success',
            metadata: await ProductService.unpublishProductByShop({
                product_id: req.params.id,
                product_shop: req.userId,
            }),
        }).send(res);
    };

    searchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Search product success',
            metadata: await ProductService.searchProduct({
                searchText: req.params.searchText,
            }),
        }).send(res);
    };
}

module.exports = new ProductController();
