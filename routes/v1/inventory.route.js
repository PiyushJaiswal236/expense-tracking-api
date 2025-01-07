const express = require("express");
const auth = require("../../middlewares/auth");
const {inventoryController} = require("../../controllers");
const {inventoryValidation} = require("../../object_validations");
const validate = require("../../middlewares/validate");
const upload = require("../../middlewares/upload");
const httpStatus = require("http-status");
const {imageService} = require("../../services");
const mongoose = require("mongoose");
const {getbucket} = require("../../config/database");
const router = express.Router();

router.get('/',
    auth('getSelf'),
    inventoryController.getInventory,
);
router.get('/categories',
    auth('getSelf'),
    inventoryController.getCategories
);
router.post('/items',
    auth('manageSelf'),
    validate(inventoryValidation.addItem),
    upload.single('file'),
    inventoryController.addItemToInventory,
);
router.patch('/items/:itemId',
    auth('manageSelf'),
    validate(inventoryValidation.updateItem),
    upload.single('file'),
    inventoryController.updateItemFromInventory
)

router.delete('/items/:itemId',
    auth('manageSelf'),
    validate(inventoryValidation.deleteItem),
    inventoryController.deleteItemFromInventory
)

// router.get('/items/:itemId',
//     auth('manageSelf'),
//     async (req, res) => {
//         const itemId = req.params.itemId;
//         await imageService.getImage(itemId,res);
//         res.status(httpStatus.FOUND).json(itemId)
//     }
// );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management and item operations
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     summary: Get user inventory
 *     description: Logged-in users can retrieve their inventory.
 *     tags: [Inventory]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /inventory/categories:
 *   get:
 *     summary: Get categories in user inventory
 *     description: Logged-in users can retrieve categories in their inventory.
 *     tags: [Inventory]
 *     security:
 *       - jwtAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /inventory/items:
 *   post:
 *     summary: Add an item to the inventory
 *     description: Logged-in users can add items to their inventory.
 *     tags: [Inventory]
 *     security:
 *       - jwtAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image of the item
 *               name:
 *                 type: string
 *                 description: Name of the item.
 *                 example: Broccoli
 *                 required: true
 *               category:
 *                 type: string
 *                 description: Category of the item.
 *                 enum: [Fresh Vegetables, Fresh Fruits, Seasonal, Leafy & Herbs, Frozen Veg]
 *                 example: Fresh Vegetables
 *                 required: true
 *               description:
 *                 type: string
 *                 description: Description of the item.
 *                 example: Freshly harvested broccoli rich in nutrients.
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /inventory/items/{itemId}:
 *   patch:
 *     summary: Update an item in the inventory
 *     description: Logged-in users can update specific items in their inventory.
 *     tags: [Inventory]
 *     security:
 *       - jwtAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image of the item
 *               name:
 *                 type: string
 *                 description: Name of the item.
 *                 example: Broccoli
 *                 required: true
 *               category:
 *                 type: string
 *                 description: Category of the item.
 *                 enum: [Fresh Vegetables, Fresh Fruits, Seasonal, Leafy & Herbs, Frozen Veg]
 *                 example: Fresh Vegetables
 *                 required: true
 *               description:
 *                 type: string
 *                 description: Description of the item.
 *                 example: Freshly harvested broccoli rich in nutrients.
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /inventory/items/{itemId}:
 *   delete:
 *     summary: Delete an item from the inventory
 *     description: Logged-in users can delete specific items from their inventory.
 *     tags: [Inventory]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       "204":
 *         description: No content
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */