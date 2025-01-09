const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const Collection = require("../models/collection.model");
const {Order} = require("../models");


const getAllCollections = async (filter, options) => {
    try {
        const collections = await Collection.paginate(filter, options);
        if (!collections) {
            logger.debug('No collections found for user:', userId);
            return new ApiError(httpStatus.BAD_REQUEST, 'No collections found for this user');
        }
        console.log(collections)
        logger.debug('Collections found for user:', collections);
        return collections;
    } catch (error) {
        return ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
}


//todo check img is coming or not
const getCollectionsForUser = async (userId) => {
    try {
        const collections = await Collection.find({user: userId}).populate('user').populate('image');
        if (!collections.length) {
            logger.debug('No collections found for user:', userId);
            return new ApiError(httpStatus.BAD_REQUEST, 'No collections found for this user');
        }
        logger.debug('Collections retrieved successfully for user:', userId);
        return collections;
    } catch (error) {
        logger.error('Error getting collections for user:', error);
        throw ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error getting collections for user: ${error}`);
    }
};

const getTransactionHistory = async (collectionId) => {
    try {
        const collection = await Collection.findById(collectionId);
        if (!collection) {
            return ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Collection not found ${error}`);
        }
        return collection.transactionHistory;
    } catch (error) {
        logger.error('Error getting transaction history:', error);
        throw ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error getting transaction history: ${error}`);
    }
};

const createCollectionForUser = async (userId, file, collectionData) => {
    try {
        console.log(file)
        console.log(userId)
        collectionData.user = userId;
        if (file !== undefined) {
            collectionData.image = file.id;
        }
        const collection = Collection.create(collectionData);
        logger.debug('Collection created successfully for user:', userId)
        return collection;
    } catch (error) {
        logger.error('Error creating collection for user:', error);
        throw error;
    }
};

const addAmountToCollectionForUser = async (userId, collectionId, amountToAdd) => {
    try {
        const collection = await Collection.findOne({_id: collectionId, user: userId});
        if (!collection) {
            logger.debug('Collection not found for user:', userId);
            return new ApiError(httpStatus.BAD_REQUEST, 'Collection not found for this user');
        }
        collection.amount += amountToAdd;
        const transaction = {
            transaction: {
                amount: amountToAdd,
                time: new Date()
            }
        };
        collection.transactionHistory.push(transaction);
        await collection.save();
        logger.debug('Amount added successfully to collection for user:', userId);
        return collection;
    } catch (error) {
        logger.error('Error adding amount to collection for user:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error adding amount to collection for user: ${error}`);
    }
};



const updateCollectionForUser = async (userId, collectionId, updateData) => {
    try {
        const updatedCollection = await Collection.findOneAndReplace({
            _id: collectionId,
            user: userId
        }, updateData, {new: true});
        if (!updatedCollection) {
            logger.debug('Collection not found for user:', userId);
            throw new ApiError(httpStatus.BAD_REQUEST, 'Collection not found for this user');
        }
        logger.debug('Collection updated successfully for user:', userId);
        return updatedCollection;
    } catch (error) {
        logger.error('Error updating collection for user:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error updating collection for user: ${error}`);
    }
};

const deleteCollectionForUser = async (userId, collectionId) => {
    try {
        const deletedCollection = await Collection.findOneAndDelete({_id: collectionId, user: userId});
        if (!deletedCollection) {
            logger.debug('Collection not found for user:', userId);
            throw new ApiError(httpStatus.BAD_REQUEST, 'Collection not found for this user');
        }
        logger.debug('Collection deleted successfully for user:', userId);
        return deletedCollection;
    } catch (error) {
        logger.error('Error deleting collection for user:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error deleting collection for user: ${error}`);
    }
};

module.exports = {
    getAllCollections,
    getTransactionHistory,
    createCollectionForUser,
    getCollectionsForUser,
    addAmountToCollectionForUser,
    updateCollectionForUser,
    deleteCollectionForUser,
}