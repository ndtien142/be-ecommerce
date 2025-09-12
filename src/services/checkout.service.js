'use strict';

const { NotFoundError, BadRequestError } = require('../core/error.response');
const {
    findCartById,
    updateCartState,
} = require('../models/repositories/cart.repo');
const { checkProductByServer } = require('../models/repositories/product.repo');
const { getDiscountAmount } = require('./discount.service');
const { acquireLock, releaseLock } = require('./redis.service');
const {
    getAllOrdersOfUser,
    createNewOrder,
    findOrder,
} = require('../models/repositories/order.repo');

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

    // Order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const { shop_order_ids_new, checkout_order } =
            await CheckoutService.checkoutReview({
                cartId,
                shop_order_ids,
                userId,
            });
        // Check again inventory available
        // Get new array Products
        const products = shop_order_ids_new.flatMap((shop) => {
            return shop.item_products;
        });

        console.log('array product[1]:: ', products);
        const acquireProduct = [];

        for (let i = 1; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // check any product wrong
        if (acquireProduct.includes(false))
            throw new BadRequestError('Something were wrong in cart!');

        const newOrder = await createNewOrder({
            order_checkout: checkout_order,
            order_payment: user_payment,
            order_products: products,
            order_userId: userId,
            order_shipping: user_address,
        });

        // if create success -> remove product in cart
        if (newOrder) {
            await updateCartState({ cartId, state: 'pending' });
        }

        return newOrder;
    }

    // Get all orders [User]
    static async getAllOrder({ page, limit, userId }) {
        return await getAllOrdersOfUser({
            limit,
            page,
            userId,
            unSelect: ['__v'],
        });
    }

    // Get one order [User]
    static async getOneOrder({ order_id, userId }) {
        return await findOrder({ order_id, userId });
    }

    // Cancel order [User]
    static async cancelOrderByUser({}) {}

    // Update Order Status [Admin | Shop]
    static async updateOrderStatusByShop() {}
}

module.exports = CheckoutService;
