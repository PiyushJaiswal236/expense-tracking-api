const Joi = require("joi");
const {objectId, emptyString} = require("./custom.validation");
const {isObjectIdOrHexString} = require("mongoose");

const getOrders = {
    query: Joi.object().keys({
        person: Joi.custom(objectId),
        status: Joi.string().valid("pending", "completed"),
        type: Joi.string().valid("sale", "purchase"),
        sortBy: Joi.string(),
        limit: Joi.number().integer().min(0),
        page: Joi.number().integer().min(0),
        startDate: Joi.date().iso(),
        endDate: Joi.date().iso(),
        minAmount: Joi.number().min(0),
        maxAmount: Joi.number().min(0),
    }),
}

const createOrder = {
    body: Joi.object().keys({
        type: Joi.string().valid("sale", "purchase").required(),
        status: Joi.forbidden(),
        person: Joi.custom(objectId).required(),
        purchaseItemList: Joi.array().items(Joi.object().keys({
            item: Joi.custom(objectId).required(),
            quantity: Joi.number().required().min(1),
            price: Joi.number().required().min(0),
            unit:Joi.string().valid("kilogram", "gram","number").required(),
        })).min(1).required(),
        amountPaid: Joi.number().min(0).required(),
        personName: Joi.string(),
        shopNumber: Joi.string().custom(emptyString),
        totalAmount: Joi.forbidden(),
    })
}

const updateOrder = {
    params: Joi.object().keys({
        orderId: Joi.custom(objectId),
    }),
    body: Joi.object().keys({
        type: Joi.string().valid("sale", "purchase"),
        status: Joi.forbidden(),
        personId: Joi.custom(objectId).required(),
        purchaseItemList: Joi.array().items(Joi.object().keys({
            itemId: Joi.custom(objectId).required(),
            quantity: Joi.number().required().min(1),
            price: Joi.number().required().min(0),
            unit:Joi.string().valid("kilogram", "gram","number"),
        })).min(1).required(),
        amountPaid: Joi.number().min(0).required(),
        amountPending: Joi.forbidden(),
        totalAmount: Joi.forbidden(),
    })
}

const deleteOrder = {
    params: Joi.object().keys({
        orderId: Joi.custom(objectId).required(),
    })
}

module.exports = {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder
}