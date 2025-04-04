const httpStatus = require("http-status");
const {User} = require("../models");
const ApiError = require("../utils/ApiError");
const Inventory = require("../models/inventory.model");
const imageService = require("./image.service");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const {getBucket} = require("../config/database");

/**
 * Create a user
 * @param {Object} userBody
 * @param file
 * @returns {Promise<User>}
 */
const createUser = async (userBody, file) => {
    if (file !== undefined) {
        userBody.image = file.id;
    }
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    const inventory = await Inventory.create({userId: null, items: []});
    userBody = {...userBody, inventory: inventory.id};
    const user = await User.create(userBody);
    inventory.userId = user.id;
    inventory.save();
    return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc),
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
    const users = await User.paginate(filter, options);
    return users;
};

/**
 * Get user by id with optional fields selection
 * @param {string} id - The id of the user
 * @param {string|null} fieldsToSelect - A string of space-separated field names to select (optional)
 * @returns {Promise<User>} - A promise that resolves to the user document or selected fields of the user document
 */
const getUserById = async (id, fieldsToSelect = null) => {
    if (fieldsToSelect) {
        return User.findById(id).select(fieldsToSelect);
    }
    return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
    return  User.findOne({email});
};


const getUserWithPopulatedFields = async (email) => {
    try {
        const user = await User.findOne({email})
            .populate({
                path: 'inventory', // Populate the inventory field
                populate: {
                    path: 'items', // Populate the items inside the inventory
                    select: 'name description', // Select specific fields to include from the Item model
                },
            })
            .populate({
                path: 'persons', // Populate the persons array
                // populate: {
                //     path: 'orders', // Populate the orders inside persons
                //     select: 'status totalAmount', // Select specific fields to include from Order model
                //     populate: {
                //         path: 'person', // Populate person field inside orders (if needed)
                //         select: 'name type shopNumber', // Select specific fields to include from Person model
                //     },
                // },
            })
        // .populate({
        //     path: 'orders', // Populate the orders array
        //     populate: [
        //         {
        //             path: 'person', // Populate the person reference inside orders
        //             select: 'name phoneNumber', // Select specific fields from Person model
        //         },
        //         {
        //             path: 'user', // Populate the user reference inside orders
        //             select: 'name email', // Select specific fields from User model
        //         },
        //         {
        //             path: 'purchaseItemList.item', // Populate the items inside purchaseItemList in orders
        //             select: 'name price unit', // Select specific fields from Item model
        //         },
        //     ],
        // });

        if (!user) {
            return new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
        return user;
    } catch (error) {
        console.error(error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error populating user data');
    }
};


/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @param file
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, updateBody, file) => {
    console.log("+6+6+6+6+6+6")
    console.log(file)
    console.log("+6+6++6+6+6+66")
    let user = await getUserById(userId);
    console.log(!(updateBody.confirmPassword === undefined))
    console.log(updateBody.confirmPassword !== undefined)
    if (updateBody.confirmPassword !== undefined) {
        const res = await user.isPasswordMatch(updateBody.changePassword);
        if (res === false) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "User Passwords do not match with original password");
        }
        updateBody.password = await bcrypt.hash(updateBody.confirmPassword, 8);
    }
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }

    console.log("update Body");
    console.log(updateBody)
    user = await User.findByIdAndUpdate(userId, updateBody, {new: true});

    if (file !== undefined) {
        console.log("akfkfsjlfjlksjfljlfjslfjldsjflsjflsdjflsjflsdjf")
        console.log(file)
        console.log("akfkfsjlfjlksjfljlfjslfjldsjflsjflsdjflsjflsdjf")
        const oldimg = user.image;
        const bucket = getBucket();
        const OldimgInStorage = await bucket.find({_id: new mongoose.Types.ObjectId(oldimg)}).toArray();
        if (OldimgInStorage.length !== 0) {
            await imageService.deleteImage(oldimg);
        }

        console.log("image id"+file.id);

        console.log(file);
        user.image = file.id;
        await user.save();
    }

    return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    await User.deleteOne({_id: userId});
    return user;
};

module.exports = {
    createUser,
    queryUsers,
    getUserById,
    getUserByEmail,
    getUserWithPopulatedFields,
    updateUserById,
    deleteUserById,
};
