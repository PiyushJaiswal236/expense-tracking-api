const mongoose = require("mongoose");
const {toJSON, paginate} = require("./plugins");

const itemSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            // enum: ["Fresh Vegetables", "Fresh Fruits", "Seasonal", 'Leafy & Herbs', "Frozen Veg"],
            // required: true,
            trim: true,
        },
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "uploads.files",
        },
        description: {
            type: String,
            trim: true,
        }
    }
)
itemSchema.plugin(toJSON);
itemSchema.plugin(paginate);

/** Check if item exists by name
 *  @param {string} name - The name of the item
 *  @returns {Promise<boolean>} */

itemSchema.statics.isExist = async function (name) {
    const item = await this.findOne({name});
    return !!item;
}

/**
 * Check if item exists by ObjectId
 * @param {ObjectId} id - The ObjectId of the item
 * @returns {Promise<boolean>}
 */
itemSchema.statics.isExistById = async function (id) {
    const item = await this.findById(id);
    return !!item;
};


const Item = mongoose.model('Item', itemSchema);
module.exports = Item;


