'use strict';

const { BadRequestError, NotFoundError } = require('../core/error.response');
const discountModel = require('../models/discount.model');
const {
    createDiscount,
    findDiscountByCode,
    findAllDiscountCodeUnSelect,
} = require('../models/repositories/discount.repo');
const { findAllProductByUser } = require('../models/repositories/product.repo');
const { convertToObjectMongodb } = require('../utils');

class DiscountService {
    // [Shop | Admin]
    static async createDiscount({
        code,
        start_date,
        end_date,
        is_active,
        shopId,
        min_order_value,
        product_ids,
        applies_to,
        name,
        description,
        type,
        value,
        users_used,
        max_value,
        max_uses,
        uses_count,
        max_uses_per_user,
    }) {
        if (
            new Date() < new Date(start_date) ||
            new Date() > new Date(end_date) ||
            new Date(start_date) >= new Date(end_date)
        )
            throw new BadRequestError('Discount code has expired');

        const foundDiscount = findDiscountByCode({ code, shopId });

        if (foundDiscount && foundDiscount.discount_is_active)
            throw new BadRequestError('Discount existed');

        const newDiscount = await createDiscount({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_max_value: max_value,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids,
        });

        return newDiscount;
    }

    // [Admin | shop]
    static async updateProduct() {}

    // [User]
    static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }) {
        // create index for discount code
        const foundDiscount = await findDiscountByCode({ code, shopId });
        if (!foundDiscount || !foundDiscount.discount_is_active)
            throw new NotFoundError('Discount not exists!');

        const { discount_applies_to, discount_product_ids } = foundDiscount;

        let products;

        if (discount_applies_to === 'all') {
            // get all product
            products = await findAllProductByUser({
                filter: {
                    product_shop: convertToObjectMongodb(shopId),
                    isPublish: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            });
        }

        if (discount_applies_to === 'specific') {
            // get product from list discount product ids
            products = await findAllProductByUser({
                filter: {
                    _id: { $in: discount_product_ids },
                    product_shop: convertToObjectMongodb(shopId),
                    isPublish: true,
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name'],
            });
        }

        return products;
    }

    // [Admin | Shop]
    static async getAllDiscountOfShop({ shopId, limit, page }) {
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ['__v', 'discount_shopId'],
        });
        return discounts;
    }

    // [User]
    /**
     * Apply discount code
     * products = [
     *  {
     *      productId,
     *      shopId,
     *      quantity,
     *      produce,
     *      name
     *  },
     * {
     *      productId,
     *      shopId,
     *      quantity,
     *      produce,
     *      name
     *  }
     *
     * ]
     */
    static async getDiscountAmount({ code, userId, shopId, products }) {
        const foundDiscount = await findDiscountByCode({ code, shopId });

        if (!foundDiscount) throw new NotFoundError('Discount not found!');

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_value,
            discount_type,
        } = foundDiscount;

        if (!discount_is_active) throw new BadRequestError('Discount inactive');
        if (!discount_max_uses) throw new BadRequestError('Discount max uses');

        if (
            new Date() < new Date(discount_start_date) ||
            new Date() > new Date(discount_end_date)
        ) {
            throw new BadRequestError('Discount has expired');
        }
        // check min order
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + product.price * product.quantity;
            }, 0);

            if (totalOrder < discount_min_order_value)
                throw new BadRequestError(
                    `Discount requires a minimum order of value ${discount_min_order_value}`,
                );
        }

        if (discount_max_uses_per_user > 0) {
            const usesUserDiscount = discount_users_used.find(
                (user) => user.userId === userId,
            );
            if (
                usesUserDiscount &&
                usesUserDiscount >= discount_max_uses_per_user
            )
                throw BadRequestError('User limit');
        }

        const amount =
            discount_type === 'fixed_amount'
                ? discount_value
                : totalOrder * (discount_value / 100);
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    // [Admin | shop]
    static async deleteDiscountCode() {}

    // [User]
    static async cancelDiscountCode({ code, shopId, userId }) {
        const foundDiscount = await findDiscountByCode({ code, shopId });

        if (!foundDiscount) throw new NotFoundError('Discount not found!');

        const result = await discountModel.findByIdAndUpdate(
            foundDiscount._id,
            {
                $pull: {
                    discount_users_used: userId,
                },
                $inc: {
                    discount_max_uses: 1,
                    discount_uses_count: -1,
                },
            },
        );

        return result;
    }
}

module.exports = DiscountService;
