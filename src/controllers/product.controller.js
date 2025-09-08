'use strict';

const { CREATED } = require('../core/success.response');
const ProductService = require('../services/product.service');

class ProductController {
    createProduct = async (req, res, next) => {
        new CREATED({
            message: 'Product created successfully',
            metadata: await ProductService.createProduct(
                req.body.product_type,
                req.body,
            ),
        }).send(res, {
            'Content-Type': 'application/json',
        });
    };
}

module.exports = new ProductController();
