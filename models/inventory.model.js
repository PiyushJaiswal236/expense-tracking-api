const mongoose = require('mongoose');
const {toJSON} = require("./plugins");

const inventorySchema=  mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        items:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            }
        ]
    }
)

inventorySchema.plugin(toJSON);

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;