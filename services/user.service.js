const httpStatus = require("http-status");
const {User} = require("../models");
const ApiError = require("../utils/ApiError");
const Inventory = require("../models/inventory.model");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
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
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
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
    return User.findOne({email});
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
                populate: {
                    path: 'orders', // Populate the orders inside persons
                    select: 'status totalAmount', // Select specific fields to include from Order model
                    populate: {
                        path: 'person', // Populate person field inside orders (if needed)
                        select: 'name type', // Select specific fields to include from Person model
                    },
                },
            })
            .populate({
                path: 'orders', // Populate the orders array
                populate: [
                    {
                        path: 'person', // Populate the person reference inside orders
                        select: 'name phoneNumber', // Select specific fields from Person model
                    },
                    {
                        path: 'user', // Populate the user reference inside orders
                        select: 'name email', // Select specific fields from User model
                    },
                    {
                        path: 'purchaseItemList.item', // Populate the items inside purchaseItemList in orders
                        select: 'name price unit', // Select specific fields from Item model
                    },
                ],
            });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
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
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, updateBody) => {
    let user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
    user = await User.findByIdAndUpdate(userId, updateBody,{new: true});
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
