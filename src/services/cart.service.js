'use strict';

const { NotFoundError } = require('../core/error.response');
const cartModel = require('../models/cart.model');
const {
    createUserCart,
    updateUserCart,
} = require('../models/repositories/cart.repo');
const { findOneProduct } = require('../models/repositories/product.repo');

/**
 * Key features: Cart Service
 * - Add product to cart [User]
 * - reduce product quantity by one [User]
 * - increase product quantity by one [User]
 * - get cart [User]
 * - Delete cart [User]
 * - Delete cart item [User]
 */

class CartService {
    static async addToCart({ userId, product = {} }) {
        // check user existed
        const userCart = await cartModel.findOne({ cart_userId: userId });

        console.log('check data: ', userId, product);
        console.log(userCart);

        if (!userCart) {
            // create cart for user
            return await createUserCart({ cart_userId: userId, product });
        }

        // if cart exist but empty
        if (!userCart.cart_products?.length) {
            userCart.cart_products = [product];
            return await userCart.save();
        }

        // if cart exist and have this product -> update product quantity
        return await updateUserCart({
            cart_userId: userId,
            product,
        });
    }
    // Update cart
    /*
        shop_order_ids: [
            shopId,
            item_products: [
                {
                    quantity,
                    price,
                    shopId,
                    old_quantity,
                    productId
                }
            ],
            version
        ]
    */
    static async addToCartV2({ userId, shop_order_ids = [] }) {
        const { productId, quantity, old_quantity } =
            shop_order_ids[0]?.item_products[0];

        // check product exist
        const foundProduct = await findOneProduct({ product_id: productId });

        if (!foundProduct) throw new NotFoundError('Product not found!');
        // compare
        if (foundProduct.product_shop?.toString() !== shop_order_ids[0]?.shopId)
            throw new NotFoundError('Shop Not Found!');

        if (quantity === 0) {
            // deleted
        }

        return await updateUserCart({
            cart_userId: userId,
            product: {
                productId,
                quantity: quantity - old_quantity,
            },
        });
    }

    static async deleteProductItemUserCart({ userId, productId }) {
        const query = { cart_userId: userId, cart_state: 'active' };
        const updateSet = {
            $pull: {
                cart_products: {
                    productId,
                },
            },
        };
        const deleteCart = await cartModel.updateOne(query, updateSet);

        return deleteCart;
    }

    static async getListUserCart({ userId }) {
        console.log('user id', userId);
        return await cartModel
            .findOne({
                cart_userId: +userId,
            })
            .lean();
    }
}

module.exports = CartService;
