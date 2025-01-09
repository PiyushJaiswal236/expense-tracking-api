const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {collectionsController} = require("../../controllers");
const {collectionValidation} = require("../../object_validations");
const {upload, saveToGridFS} = require("../../middlewares/files");


const router = express.Router();

router.get(
    "/",
    auth("manageSelf"),
    validate(collectionValidation.getCollection),
    collectionsController.getCollections
);

router.post(
    "/",
    auth("manageSelf"),
    upload.single("file"),
    saveToGridFS,
    validate(collectionValidation.createCollection),
    collectionsController.createCollection
);

router.post(
    "/add-amount",
    auth("manageSelf"),
    validate(collectionValidation.addAmountToCollectionForUser),
    collectionsController.addAmountToCollectionForUser
);

module.exports = router;

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a collection for a user
 *     description: This endpoint allows you to create a collection for a user.
 *     tags: [Collections]
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
 *                 description: File to upload
 *                 required: true
 *               bankName:
 *                 type: string
 *                 description: Name of the bank
 *                 example: Bank of India
 *                 required: true
 *               agentName:
 *                 type: string
 *                 description: Name of the agent
 *                 example: Agent Smith
 *                 required: true
 *               agentPhoneNumber:
 *                 type: string
 *                 description: Phone number of the agent
 *                 example: 1234567890
 *                 required: true
 *               branchName:
 *                 type: string
 *                 description: Name of the branch
 *                 example: Brand X
 *                 required: true
 *     responses:
 *       200:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 bankName:
 *                   type: string
 *                 image:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 agentName:
 *                   type: string
 *                 agentPhoneNumber:
 *                   type: string
 *                 transactionHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       amount:
 *                         type: number
 *                       time:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get collections for the logged-in user
 *     description: Logged-in users can fetch their collections.
 *     tags: [Collections]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by query in the format field:order (e.g., bankName:asc)
 *         example: bankName:asc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum number of collections per page
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number
 *         example: 1
 *     responses:
 *       201:
 *         description: Successfully fetched collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 collections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Collection'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
