const mongoose = require("mongoose");
const {Mongoose} = require("mongoose");
const {toJSON, paginate} = require("./plugins");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const {string} = require("joi");

const orderSchema = mongoose.Schema(
    {
        user :{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            trim: true,
        },
        person: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Person"
        },
        type: {
            type: String,
            required: true,
            enum: ["purchase", "sale"],
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["completed", "pending"],
            trim: true,
        },
        purchaseItemList: [
            {
                item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Item",
                    required: true,
                },
                quantity: {
                    type: Number,
                    min: 1,
                    required: true,
                },
                price: {
                    type: Number,
                    min: 0,
                    required: true,
                },
                unit:{
                    type: String,
                    required: true,
                    enum: ["kilogram", "gram","number"],
                    trim: true,
                }
            }
        ],
        amountPaid: {
            type: Number,
            required: true,
            min: 0
        },
        amountPending: {
            type: Number,
            required: true,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true,
        strictPopulated: false,
    }
)
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * Check if order exists by a specific property
 * @param {Object} query - The query object to find the order
 * @returns {Promise<boolean>}
 */
orderSchema.statics.isOrderExistByProperty = async function (query) {
    const order = await this.findOne(query);
    return !!order;
};

/**
 * Check if order exists by ObjectId
 * @param {ObjectId} id - The ObjectId of the order
 * @returns {Promise<boolean>}
 */
orderSchema.statics.isOrderExistById = async function (id) {
    const order = await this.findById(id);
    return !!order;
};

orderSchema.methods.calculateTotalAmountAndPendingAmount = async function () {
    let totalAmount = 0;
    let amountPending = 0;
    for (const item of this.purchaseItemList) {
        totalAmount += item.price * item.quantity;
    }
    this.totalAmount = totalAmount;
    amountPending = totalAmount-this.amountPaid;
    this.amountPending = amountPending;
}

orderSchema.pre('validate', async function (next) {
    await this.calculateTotalAmountAndPendingAmount();
    if(this.amountPaid>this.totalAmount){
        throw new ApiError(httpStatus.BAD_REQUEST,"Paid Amount cannot be greater than Total Amount")
    }
    this.status = this.amountPaid >= this.totalAmount ? 'completed' : 'pending';
    next();
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;