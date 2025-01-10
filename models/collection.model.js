const mongoose = require('mongoose');
const {toJSON, paginate} = require("./plugins");

const collectionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        bankName: {
            type: String,
            required: true,
        },
        image: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'uploads.files',
        },
        amount: {
            type: Number,
            default: 0,
        },
        agentName: {
            type: String,
            required: true
        },
        agentPhoneNumber: {
            type: String,
            required: true
        },
        transactionHistory: [{
            transaction: {
                amount: {
                    type: Number,
                },
                time: {
                    type: Date
                }
            }
        }],
    },
    {
        timestamps: true,
    }
)
collectionSchema.plugin(toJSON);
collectionSchema.plugin(paginate);

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;