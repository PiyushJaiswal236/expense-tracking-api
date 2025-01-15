const catchAsync = require("../utils/CatchAsync");
const {inventoryService, imageService} = require("../services");
const httpStatus = require("http-status");

const getInventory = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const items = await inventoryService.getInventory(inventoryId);
    return res.status(200).json({items,statusCode:1});
});

const getCategories = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const items = await inventoryService.getItemsByCategory(inventoryId);
    return res.status(200).json({statusCode:1,message:"Successful",items});
});

const addItemToInventory = catchAsync(async (req, res) => {
    const inventoryId = req.user.inventory;
    const itemData = req.body
    const updatedInventory = await inventoryService.addItemToInventory(inventoryId, itemData,req.file);
    res.status(httpStatus.CREATED).json({message: 'Item added to inventory', inventory: updatedInventory,statusCode:1});
})

const updateItemFromInventory = catchAsync(async (req, res) => {
    const itemId = req.params.itemId;
    const itemData = req.body.itemData;
    // console.log("incont"+itemData)
    console.log(req)
    const item = await inventoryService.updateItemFromInventory(itemId, itemData,req.file);
    res.status(httpStatus.CREATED).json({message: 'Item updated', inventory: item,statusCode:1});
})

const deleteItemFromInventory = catchAsync(async (req, res) => {
    const itemId = req.params.itemId;
    const inventoryId = req.user.inventory;
    const inventory = await inventoryService.deleteItemFromInventory(inventoryId, itemId);
    res.status(httpStatus.OK).json({message: 'Item deleted', inventory: inventory,statusCode:1});
})

module.exports = {
    getInventory,
    addItemToInventory,
    updateItemFromInventory,
    deleteItemFromInventory,
    getCategories,
}