const express = require("express");
const {ordersController} = require("../../controllers");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const {orderService} = require("../../services");
const {orderValidation} = require("../../object_validations");
const router = express.Router();

router.get("/",
    auth("getSelf"),
    validate(orderValidation.getOrders),
    ordersController.getAllOrders
);

router.get("/grouped",
    auth("getSelf"),
    ordersController.getOrderByGroup
);

router.post("/",
    auth("manageSelf"),
    validate(orderValidation.createOrder),
    ordersController.createOrder
);

router.patch("/:orderId",
    auth("manageSelf"),
    validate(orderValidation.updateOrder),
    ordersController.updateOrder
);

router.delete("/:orderId",
    auth("manageSelf"),
    validate(orderValidation.deleteOrder),
    ordersController.deleteOrder
);

router.get("/report", auth("manageSelf"), ordersController.getReport,);


module.exports = router;

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with various filters
 *     description: Logged-in users can fetch a list of orders using different filters and sorting options.
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: personId
 *         schema:
 *           type: string
 *         description: Filter orders by person ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter orders by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter orders by type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort orders by field and order (e.g., createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Current page number
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders created after this date (inclusive)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter orders created before this date (inclusive)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Filter orders with a total amount greater than or equal to this value
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Filter orders with a total amount less than or equal to this value
 *     responses:
 *       '200':
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *             example:
 *               userId: "5f50c31b96db9c5b0027bf9d"
 *               status: "pending"
 *               type: "purchase"
 *               sortBy: "createdAt:desc"
 *               limit: 5
 *               page: 1
 *               startDate: "2023-01-01T00:00:00.000Z"
 *               endDate: "2023-12-31T23:59:59.999Z"
 *               minAmount: 500
 *               maxAmount: 1500
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */


/**
 * @swagger
 * /orders/report:
 *   get:
 *     summary: Get report
 *     description: Logged-in users can fetch a report based on various filters.
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: personId
 *         required: false
 *         schema:
 *           type: string
 *           example: 5f8f8c44b54764421b7156e8
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           example: completed
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - sale
 *             - purchase
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
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2023-01-01T00:00:00Z
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2023-12-31T23:59:59Z
 *       - in: query
 *         name: minAmount
 *         required: false
 *         schema:
 *           type: number
 *           example: 100.00
 *       - in: query
 *         name: maxAmount
 *         required: false
 *         schema:
 *           type: number
 *           example: 1000.00
 *     responses:
 *       '200':
 *         description: Report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 1
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalResults:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /orders/grouped:
 *   get:
 *     summary: Get grouped
 *     description: Logged-in users can fetch a report based on various filters.
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: query
 *         name: personId
 *         required: false
 *         schema:
 *           type: string
 *           example: 5f8f8c44b54764421b7156e8
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           example: completed
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - supplier
 *             - customer
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
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2023-01-01T00:00:00Z
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2023-12-31T23:59:59Z
 *       - in: query
 *         name: minAmount
 *         required: false
 *         schema:
 *           type: number
 *           example: 100.00
 *       - in: query
 *         name: maxAmount
 *         required: false
 *         schema:
 *           type: number
 *           example: 1000.00
 *     responses:
 *       '200':
 *         description: Report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 1
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalResults:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order
 *     description: Create a new order with specified items and person details.
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - person
 *               - purchaseItemList
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [sale, purchase]
 *               person:
 *                 type: string
 *                 description: Reference to the person related to the order
 *               purchaseItemList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - quantity
 *                     - price
 *                   properties:
 *                     item:
 *                       type: string
 *                       description: Reference to the item in the order
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                     price:
 *                       type: number
 *                       minimum: 1
 *                     unit:
 *                       type: string
 *                       enum: [kilogram, gram,number]
 *               amountPaid:
 *                 type: number
 *                 minimum: 0
 *                 description: Amount paid by the customer
 *             example:
 *               type: sale
 *               person: "6779e93dfb6af38602467d80"
 *               purchaseItemList:
 *                 - item: "6779ea56fb6af38602467d98"
 *                   quantity: 10
 *                   price: 20
 *                   unit: "kilogram"
 *                 - item: "6779eaa7fb6af38602467da7"
 *                   quantity: 10
 *                   price: 30
 *                   unit: "kilogram"
 *               amountPaid: 400
 *     responses:
 *       "201":
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 personId:
 *                   type: string
 *                 purchaseItemList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: string
 *                         description: Reference to the item in the order
 *                       quantity:
 *                         type: number
 *                         minimum: 1
 *                       price:
 *                         type: number
 *                         minimum: 1
 *                 amountPaid:
 *                   type: number
 *                   minimum: 0
 *                   description: Amount paid by the customer
 *               example:
 *                 type: sale
 *                 personId: "605c72efc25e4a23d8c59b6e"
 *                 purchaseItemList:
 *                   - itemId: "605c72efc25e4a23d8c59b6f"
 *                     quantity: 10
 *                     price: 20
 *                   - itemId: "4jh5j435j45jb545jb345jjb"
 *                     quantity: 10
 *                     price: 30
 *                 amountPaid: 400
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */


/**
 * @swagger
 * /orders/{orderId}:
 *   patch:
 *     summary: Update an order
 *     description: Update order details
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrder'
 *     responses:
 *       200:
 *         description: Successful update of the order
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateOrderResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * components:
 *   schemas:
 *     UpdateOrder:
 *       type: object
 *       required:
 *         - personId
 *         - purchaseItemList
 *         - amountPaid
 *       properties:
 *         type:
 *           type: string
 *           enum: ["sale", "purchase"]
 *           description: Type of the order (sale or purchase)
 *           example: "sale"
 *         personId:
 *           type: string
 *           format: objectId
 *           description: ID of the person related to the order
 *           example: "5ebac534954b54139806c112"
 *         purchaseItemList:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - itemId
 *               - quantity
 *               - price
 *             properties:
 *               itemId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of the item being purchased
 *                 example: "5ebac534954b54139806c113"
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity of the item
 *                 example: 10
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Price of the item
 *                 example: 100.50
 *           description: List of items being purchased
 *         amountPaid:
 *           type: number
 *           minimum: 0
 *           description: Amount paid for the order
 *           example: 500.00
 *   responses:
 *     UpdateOrderResponse:
 *       description: Successful update of the order
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/UpdateOrder'
 *           example:
 *             success: true
 *             data:
 *               type: "sale"
 *               personId: "5ebac534954b54139806c112"
 *               purchaseItemList:
 *                 - itemId: "5ebac534954b54139806c113"
 *                   quantity: 10
 *                   price: 100.50
 *               amountPaid: 500.00
 */


/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     description: Delete an order by its ID.
 *     tags: [Orders]
 *     security:
 *       - jwtAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to delete
 *     responses:
 *       "200":
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order deleted successfully
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No Order with id {orderId} found
 */
