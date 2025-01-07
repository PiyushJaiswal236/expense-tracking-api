const Joi = require("joi");
const {objectId, emptyString} = require("./custom.validation");

const getPersons = {
    query: Joi.object().keys({
        name:Joi.string(),
        itemIds: Joi.string(),
        period:Joi.string(),
        amount: Joi.string(),
        type: Joi.string(),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};
const createPerson = {
    body: Joi.object().keys({
        name: Joi.string().custom(emptyString).required(),
        phoneNumber: Joi.string().custom(emptyString).required(),
        shopNo: Joi.string(),
        email: Joi.string().email(),
        totalOverdue: Joi.number().integer().min(0),
        type: Joi.string().valid("customer", "supplier").required(),
        orders: Joi.array().items(Joi.custom(objectId)),
        pendingAmount: Joi.number().positive(),
    })
}
const updatePerson = {
    params: Joi.object().keys({
        personId: Joi.custom(objectId)
    }),
    body: Joi.object().keys({
        totalOverdue:Joi.forbidden(),
    })
}
const deletePerson = {
    params: Joi.object().keys({
        personId: Joi.custom(objectId)
    })
}

module.exports = {
    getPersons,
    createPerson,
    updatePerson,
    deletePerson,
}
