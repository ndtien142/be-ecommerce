'use strict';

const { getSelectData, unSelectData } = require('../../utils');
const {
    product,
    clothing,
    electronics,
    furniture,
} = require('../product.model');
const { Types } = require('mongoose');

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate('product_shop', 'name email -_id')
        .sort({ update: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
};

const publishProductShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundProduct) null;

    const { modifiedCount } = await product.findOneAndUpdate(
        {
            product_shop: new Types.ObjectId(product_shop),
            _id: new Types.ObjectId(product_id),
        },
        {
            isDraft: false,
            isPublish: true,
        },
        {
            upsert: false,
            new: true,
        },
    );

    return modifiedCount;
};

const unpublishProductShop = async ({ product_shop, product_id }) => {
    const foundProduct = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id),
    });

    if (!foundProduct) null;

    const { modifiedCount } = await product.findOneAndUpdate(
        {
            product_shop: new Types.ObjectId(product_shop),
            _id: new Types.ObjectId(product_id),
        },
        {
            isDraft: true,
            isPublish: false,
        },
        {
            upsert: false,
            new: true,
        },
    );

    return modifiedCount;
};

const searchProductByUser = async ({ searchText }) => {
    const regexSearch = new RegExp(searchText);
    const result = await product
        .find(
            {
                isPublish: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .lean();
    return result;
};

const findAllProductByUser = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const selectData = getSelectData(select);
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(selectData)
        .lean();
    return products;
};

const findOneProduct = async ({ product_id, unSelect }) => {
    const foundProduct = await product
        .findById(product_id)
        .select(unSelectData(unSelect));
    if (foundProduct?.isDraft === true) return null;
    return foundProduct;
};

module.exports = {
    queryProduct,
    publishProductShop,
    unpublishProductShop,
    searchProductByUser,
    findAllProductByUser,
    findOneProduct,
};
