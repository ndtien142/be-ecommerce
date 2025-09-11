'use strict';

const { CREATED, SuccessResponse } = require('../core/success.response');
const CartService = require('../services/cart.service');

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new Cart Success',
            metadata: await CartService.addToCart({ ...req.body }),
        }).send(res);
    };
    updateCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new Cart Success',
            metadata: await CartService.addToCartV2({ ...req.body }),
        }).send(res);
    };
    deleteProductItemInCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete Cart Success',
            metadata: await CartService.deleteProductItemUserCart(req.body),
        }).send(res);
    };
    getListCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list cart Success',
            metadata: await CartService.getListUserCart({
                userId: req.params.userId,
            }),
        }).send(res);
    };
}

module.exports = new CartController();
