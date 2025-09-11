'use strict';

const cartModel = require('../cart.model');

const createUserCart = async ({ cart_userId, product }) => {
    const query = {
        cart_userId,
    };
    const updateOrInsert = {
        $addToSet: {
            cart_products: product,
        },
    };
    const option = { upsert: true, new: true };
    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
};

const updateUserCart = async ({ cart_userId, product }) => {
    const { productId, quantity } = product;

    let updateCart = await cartModel.findOneAndUpdate(
        {
            cart_userId,
            'cart_products.productId': productId,
            cart_state: 'active',
        },
        {
            $inc: { 'cart_products.$.quantity': quantity },
            $set: { updatedAt: new Date() },
        },
        { new: true },
    );

    if (!updateCart) {
        updateCart = await cartModel.findOneAndUpdate(
            {
                cart_userId,
                cart_state: 'active',
            },
            {
                $push: { cart_products: product },
                $set: { updatedAt: new Date() },
            },
            { new: true, upsert: true },
        );
    }
    return updateCart;
};

module.exports = { createUserCart, updateUserCart };
