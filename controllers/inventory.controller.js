const catchAsync = require("../utils/CatchAsync");
const {inventoryService, imageService} = require("../services");
const httpStatus = require("http-status");

const getInventory = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const items = await inventoryService.getInventory(inventoryId);
    return res.status(200).json(items);
});

const getCategories = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const items = await inventoryService.getCategories(inventoryId);
    return res.status(200).json(items);
});

const addItemToInventory = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const itemData = req.body
    console.log(req)
    const updatedInventory = await inventoryService.addItemToInventory(inventoryId, itemData,req.file);
    res.status(httpStatus.CREATED).json({message: 'Item added to inventory', inventory: updatedInventory,statusCode:1});
})

const updateItemFromInventory = catchAsync(async (req, res) => {
    const itemId = req.params.itemId;
    const itemData = req.body.itemData;
    const item = await inventoryService.updateItemFromInventory(itemId, itemData,req.file);
    res.status(httpStatus.CREATED).json({message: 'Item updated', inventory: item});
})

const deleteItemFromInventory = catchAsync(async (req, res) => {
    const itemId = req.params.itemId;
    const inventoryId = req.user.inventory;
    const inventory = await inventoryService.deleteItemFromInventory(inventoryId, itemId);
    res.status(httpStatus.OK).json({message: 'Item deleted', inventory: inventory});
})

module.exports = {
    getInventory,
    addItemToInventory,
    updateItemFromInventory,
    deleteItemFromInventory,
    getCategories,
}