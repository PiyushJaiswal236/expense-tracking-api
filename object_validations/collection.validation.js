const Joi = require('joi');
const {emptyString, objectId} = require("./custom.validation");


const  getCollection = Joi.object().keys({
        query: Joi.object().keys({
            sortBy: Joi.string(),
            limit: Joi.number().integer().min(0),
            page: Joi.number().integer().min(0),
        }),
})
const createCollection = {
    body: Joi.object().keys({
            bankName: Joi.string().custom(emptyString).required(),
            agentName: Joi.string().custom(emptyString).required(),
            agentPhoneNumber: Joi.string().custom(emptyString).required(),
            branchName: Joi.string().custom(emptyString).required(),
        }
    ),
}
const addAmountToCollectionForUser = {
    body: Joi.object().keys({
            collectionId: Joi.custom(objectId).required(),
            amount: Joi.number().integer().min(0),
        }
    ),
}


module.exports = {
    getCollection,
    createCollection,
    addAmountToCollectionForUser

}
