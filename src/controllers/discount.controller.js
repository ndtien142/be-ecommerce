'use strict';

const { CREATED, SuccessResponse } = require('../core/success.response');
const DiscountService = require('../services/discount.service');

class DiscountController {
    createDiscount = async (req, res, next) => {
        new CREATED({
            message: 'Create new discount success!',
            metadata: await DiscountService.createDiscount({
                ...req.body,
                shopId: req.userId,
            }),
        }).send(res);
    };
    getAllDiscountCodeOfShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list discount code of shop success!',
            metadata: await DiscountService.getAllDiscountOfShop({
                ...req.query,
                shopId: req.userId,
            }),
        }).send(res);
    };
    getAllDiscountWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get List discount with product success!',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            }),
        }).send(res);
    };
    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get discount amount success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
                userId: req.userId,
            }),
        }).send(res);
    };
    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cancel discount code success!',
            metadata: await DiscountService.cancelDiscountCode({
                ...req.body,
                userId: req.userId,
            }),
        }).send(res);
    };
}

module.exports = new DiscountController();
