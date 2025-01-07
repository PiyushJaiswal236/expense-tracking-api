const Joi = require("joi");
const {objectId, emptyString} = require("./custom.validation");

const addItem = {
    body: Joi.object().keys({
        itemData: Joi.object().keys({
            name: Joi.string().custom(emptyString).required(),
            category: Joi.string(),
            description: Joi.string(),
            unit:Joi.string().valid("kilogram","gram","number"),
        })
    })
}
const updateItem = {
    params: Joi.object().keys({
        itemId: Joi.custom(objectId),
    }),
    body: Joi.object().keys({
        itemData: Joi.object().keys({
            name: Joi.string(),
            category: Joi.string().valid("Fresh Vegetables", "Fresh Fruits", "Seasonal",'Leafy & Herbs',"Frozen Veg"),
            description: Joi.string(),
        })
    })
}
const deleteItem ={
    params: Joi.object().keys({
        itemId: Joi.custom(objectId),
    })
}
module.exports = {
    addItem,
    updateItem,
    deleteItem
};