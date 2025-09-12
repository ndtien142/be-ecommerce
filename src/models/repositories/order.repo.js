'use strict';

const { unSelectData, convertToObjectMongodb } = require('../../utils');
const orderModel = require('../order.model');

const createNewOrder = async ({
    order_userId,
    order_checkout,
    order_payment,
    order_products,
    order_shipping,
}) => {
    return await orderModel.create({
        order_userId,
        order_checkout,
        order_payment,
        order_products,
        order_shipping,
    });
};

const getAllOrdersOfUser = async ({
    userId,
    page,
    limit,
    unSelect = [],
    sort = 'ctime',
}) => {
    const transFormUnSelect = unSelectData(unSelect);
    const skip = page - 1 + limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
    const query = {
        order_userId: convertToObjectMongodb(userId),
    };
    return await orderModel
        .find(query)
        .skip(skip)
        .sort(sortBy)
        .limit(limit)
        .select(transFormUnSelect)
        .lean();
};

const findOrder = async ({ order_id, userId }) => {
    return await orderModel
        .findOne({
            _id: order_id,
            order_userId: userId,
        })
        .lean();
};

module.exports = {
    getAllOrdersOfUser,
    findOrder,
    createNewOrder,
};
