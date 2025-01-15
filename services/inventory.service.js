const Inventory = require('../models/inventory.model')
const Item = require("../models/item.model");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const imageService = require("../services/image.service");
const mongoose = require("mongoose");

const getInventory = async (inventoryId) => {
    const inventory = await Inventory.findById(inventoryId).populate("items");
    return inventory;
}

const getCategories = async (inventoryId) => {
    const categories = await Inventory.findById(inventoryId).select("items").populate({
        path: "items",
        select: "category _id"
    });
    const uniqueCategories = [...new Set(categories.items.map(item => item.category).filter(category => category))];
    return uniqueCategories;
}

const getItemsByCategory = async (inventoryId) => {
    try {
        // Fetch the inventory and populate the items
        const result = await Inventory.aggregate([
            {$match: {_id: new mongoose.Types.ObjectId(inventoryId)}}, // Match the inventory by ID
            {
                $lookup: {
                    from: "items", // The collection name for `Item`
                    localField: "items",
                    foreignField: "_id",
                    as: "items",
                },
            },
            {$unwind: "$items"}, // Deconstruct the array of items
            {
                $addFields: {
                    normalizedCategory: {$toLower: "$items.category"}, // Normalize category to lowercase
                },
            },
            {
                $group: {
                    _id: "$normalizedCategory", // Group by normalized category
                    items: {$push: "$items"}, // Collect items into an array
                },
            },
            {
                $project: {
                    category: "$_id",
                    items: 1,
                    _id: 0,
                },
            },
        ]);

        // Convert the result into the desired format
        const formatedResult = result.reduce((acc, {category, items}) => {
            acc[category] = items;
            return acc;
        }, {});

        return formatedResult;
    } catch (error) {
        console.error("Error fetching items by category:", error);
        throw error;
    }
};


const addItemToInventory = async (inventoryId, itemData, file) => {
    const item = await Item.create(itemData);
    if (file !== undefined) {
        item.image = file.id;
        await item.save();
    }
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
    }
    inventory.items.push(item.id);
    await inventory.save();
    return inventory;
}

const updateItemFromInventory = async (itemId, itemData, file) => {
    console.log(itemData)
    const item = await Item.findByIdAndUpdate(itemId, itemData,{new: true});
    console.log(item);

    if (file !== undefined) {
        const oldimg = item.image;

        if (oldimg !== undefined) {
            await imageService.deleteImage(oldimg);
        }
        item.image = file.id;
        await item.save();
    }

    if (!item) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
    console.log(item);
    return item;
}

const deleteItemFromInventory = async (inventoryId, itemId) => {
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
    }
    await inventory.items.pull(itemId);
    await inventory.save();
    return inventory;
}

module.exports = {
    getInventory,
    getItemsByCategory,
    addItemToInventory,
    updateItemFromInventory,
    deleteItemFromInventory,
    getCategories,
}