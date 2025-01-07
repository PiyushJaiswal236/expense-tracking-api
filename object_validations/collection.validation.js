const Joi = require('joi');
const {emptyString} = require("./custom.validation");


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


module.exports = {
    getCollection,
    createCollection,

}
