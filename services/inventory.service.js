const Inventory = require('../models/inventory.model')
const Item = require("../models/item.model");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const imageService = require("../services/image.service");

const getInventory = async (inventoryId) => {
    const inventory = await Inventory.findById(inventoryId).populate("items");
    return inventory;
}

const getCategories = async (inventoryId) => {
    const categories = await Inventory.findById(inventoryId).select("items") .populate({ path: "items", select: "category _id"});
    const uniqueCategories = [...new Set(categories.items.map(item => item.category).filter(category => category))];
    return uniqueCategories;
}

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

const updateItemFromInventory = async (itemId, itemData,file) => {

    const item = await Item.findByIdAndUpdate(itemId, itemData, );
    console.log("oldimg id")
    console.log("img"+item.image)

    const oldimg = item.image;
    await imageService.deleteImage(oldimg);

    if (file !== undefined) {
        item.image = file.id;
        await item.save();
    }
    console.log("new id")
    console.log(item.image)

    if (!item) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
    }
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
    addItemToInventory,
    updateItemFromInventory,
    deleteItemFromInventory,
    getCategories,
}