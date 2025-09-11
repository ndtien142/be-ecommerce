'use strict';

const {
    convertToObjectMongodb,
    unSelectData,
    getSelectData,
} = require('../../utils');
const discountModel = require('../discount.model');
const discountSchema = require('../discount.model');

const createDiscount = async ({
    discount_name,
    discount_description,
    discount_type,
    discount_value,
    discount_code,
    discount_start_date,
    discount_max_value,
    discount_end_date,
    discount_max_uses,
    discount_uses_count,
    discount_users_used,
    discount_max_uses_per_user,
    discount_min_order_value,
    discount_shopId,
    discount_is_active,
    discount_applies_to,

    discount_product_ids,
}) => {
    const newDiscount = await discountSchema.create({
        discount_name,
        discount_description,
        discount_type,
        discount_value,
        discount_code,
        discount_start_date,
        discount_end_date,
        discount_max_uses,
        discount_uses_count,
        discount_users_used,
        discount_max_uses_per_user,
        discount_min_order_value,
        discount_max_value,
        discount_shopId,
        discount_is_active,
        discount_applies_to,
        discount_product_ids,
    });
    return newDiscount;
};

const findDiscountByCode = async ({ code, shopId }) => {
    return await discountModel
        .findOne({
            discount_code: code,
            discount_shopId: convertToObjectMongodb(shopId),
        })
        .lean();
};

const findAllDiscountCodeUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const transformUnselect = unSelectData(unSelect);
    const discounts = await discountSchema
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(transformUnselect)
        .lean();
    return discounts;
};

const findAllDiscountCodeSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    select,
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const selectData = getSelectData(select);
    const discounts = await discountSchema
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(selectData)
        .lean();
    return discounts;
};

module.exports = {
    createDiscount,
    findDiscountByCode,
    findAllDiscountCodeUnSelect,
    findAllDiscountCodeSelect,
};
