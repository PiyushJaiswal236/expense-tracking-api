const mongoose = require('mongoose');
const {toJSON, paginate} = require("./plugins");

const collectionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            trim: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
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
            required: true,
            trim: true,
        },
        agentPhoneNumber: {
            type: String,
            required: true,
            trim: true,
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