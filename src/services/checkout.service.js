'use strict';

const { NotFoundError, BadRequestError } = require('../core/error.response');
const { findCartById } = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');

class CheckoutService {
    /*
    Key features
    - create new order [user]
    - query orders [user]
    - query order using it's ID [user]
    - cancel order [user]
    - update order status [admin]
    */

    /*
        Payload of checkout    
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discounts: [
                    {
                        shopId,
                        discount_id
                        code
                    }
                ],
                item_products: [
                    price,
                    quantity,
                    productId
                ]
            }
            {
                shopId,
                shop_discounts: [],
                item_products: [
                    price,
                    quantity,
                    productId
                ]
            }
        
        ]
    }
    */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        // found cart
        const foundCart = await findCartById({ cartId });

        if (!foundCart) throw new NotFoundError('Cart not found!');

        const checkout_order = {
            totalPrice: 0, // Total amount
            feeShip: 0, // total fee shipping
            totalDiscount: 0, // total discount amount
            totalCheckout: 0, // total amount payable
        };

        const shop_order_ids_new = [];

        // calculate total price of product
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];

            // Check product available
            const checkProductServer =
                await checkProductByServer(item_products);

            if (!checkProductServer[0])
                throw new BadRequestError('Order wrong!');

            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            // total price before process
            checkout_order.totalPrice += checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // amount before apply discount
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };
            // if shop_discounts > 0, will check the valid discount
            if (shop_discounts.length > 0) {
                const {
                    discount = 0,
                    totalOrder = 0,
                    totalPrice = 0,
                } = await getDiscountAmount({
                    userId,
                    shopId,
                    code: shop_discounts[0]?.code,
                    products: checkProductServer,
                });
                // total discount apply
                checkout_order.totalDiscount += discount;

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            // final total order
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }
}

module.exports = CheckoutService;
