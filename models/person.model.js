const mongoose = require('mongoose');
const {toJSON, paginate} = require("./plugins");

const personSchema = mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        image:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"uploads.files",
        },
        name: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        shopNumber: {
            type: String,
        },
        email: {
            type: String,
        },
        type: {
            type: String,
            enum: ["customer", "supplier"],
            required: true,
        },
        orders:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Order"
        }],
        totalOverdue:{
            type: Number,
            default: 0,
            min: 0,
        }
    },
    {
        timestamps: true,
    }
)
personSchema.plugin(toJSON);
personSchema.plugin(paginate)

personSchema.statics.isPersonExistById = async function (id) {
    const person = await this.findById(id);
    return person;
};

personSchema.statics.isPersonExistByName = async function (name) {
    const person = await this.findOne({ name });
    return !!person;
};

const Person = mongoose.model('Person', personSchema);
module.exports = Person;
