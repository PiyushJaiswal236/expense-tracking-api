const express = require('express');
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {personController} = require("../../controllers");
const {personValidation} = require("../../object_validations");

const {saveToGridFS, upload} = require("../../middlewares/files");

const router = express.Router();

router.get('/',
    auth("getSelf"),
    validate(personValidation.getPersons),
    personController.getPersons
);

router.post('/',
    auth("manageSelf"),
    upload.single('upload'),
    saveToGridFS,
    validate(personValidation.createPerson),
    personController.createPerson
);
router.patch(
    '/:personId',
    auth("manageSelf"),
    saveToGridFS,
    validate(personValidation.updatePerson),
    personController.updatePerson
);
router.delete(
    '/:personId',
    auth("manageSelf"),
    validate(personValidation.deletePerson),
    personController.deletePerson
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Persons
 *   description: Person management and retrieval
 */

/**
 * @swagger
 * /persons:
 *   get:
 *     summary: Get all persons for the logged-in user
 *     description: Logged-in users can fetch a list of their persons (customers or suppliers).
 *     tags: [Persons]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *           example: John Doe
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - customer
 *             - supplier
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *         example: createdAt:desc
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       '200':
 *         description: List of persons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 persons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */
/**
 * @swagger
 * /persons:
 *   post:
 *     summary: Create a new person
 *     description: Logged-in users can create a new person (customer or supplier).
 *     tags: [Persons]
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
 *                 description: Name of the person.
 *                 example: Arthur Morgen
 *                 required: true
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of person
 *                 example: +417556687799
 *                 required: true
 *               shopNo:
 *                 type: string
 *                 description: Shop number of person
 *                 example: A457
 *                 required: true
 *               email:
 *                 type: string
 *                 description: Email of the person
 *                 example: arthur@example.com
 *                 required: true
 *               type:
 *                 type: string
 *                 enum:
 *                   - customer
 *                   - supplier
 *                 description: Type of the person
 *                 required: true
 *     responses:
 *       '201':
 *         description: Person created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */


/**
 * @swagger
 * /persons/{personId}:
 *   patch:
 *     summary: Update an existing personId
 *     description: Logged-in users can update a specific person
 *          **Note:** Updating overdue information is forbidden. To change overdue, modify the particular order.
 *     tags: [Persons]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the person to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personData:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   shopNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *                   pendingAmount:
 *                     type: number
 *                   type:
 *                     type: string
 *                     enum:
 *                       - customer
 *                       - supplier
 *     responses:
 *       '200':
 *         description: Person updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Person'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /persons/{personId}:
 *   delete:
 *     summary: Delete a person
 *     description: Logged-in users can delete a specific person
 *     tags: [Persons]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the person to delete
 *     responses:
 *       '204':
 *         description: No content (successfully deleted)
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 */