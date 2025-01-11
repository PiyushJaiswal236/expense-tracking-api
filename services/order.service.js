const {Order, Item, Person, User} = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const {ObjectId} = require("mongodb");

const getAllOrders = async (filter, options) => {
    try {
        const orders = await Order.paginate(filter, options);
        return orders;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
};
const getReportOrder = async (userId, query) => {
    console.log("Received query parameters:", query);

    const {
        personId,
        status,
        type,
        sortBy = "createdAt:desc",
        limit = 10,
        page = 1,
        startDate,
        endDate,
        minAmount,
        maxAmount,
    } = query;

    console.log("Parsed parameters:");
    console.log("personId:", personId);
    console.log("status:", status);
    console.log("type:", type);
    console.log("sortBy:", sortBy);
    console.log("limit:", limit);
    console.log("page:", page);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("minAmount:", minAmount);
    console.log("maxAmount:", maxAmount);

    // Initialize filters
    const match = {};

    // Apply filters based on query parameters
    match.user = new mongoose.Types.ObjectId(userId);
    if (personId) match.person = personId;
    if (status) match.status = status;
    if (type) match.type = type;
    if (startDate)
        match.createdAt = { ...match.createdAt, $gte: new Date(startDate) };
    if (endDate)
        match.createdAt = { ...match.createdAt, $lte: new Date(endDate) };
    if (minAmount)
        match.totalAmount = { ...match.totalAmount, $gte: parseFloat(minAmount) };
    if (maxAmount)
        match.totalAmount = { ...match.totalAmount, $lte: parseFloat(maxAmount) };

    console.log("Constructed match filter:", match);

    // Parse sortBy parameter
    const [sortField, sortOrder] = sortBy.split(":");
    const sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };
    console.log("Sorting criteria:", sort);

    // Pagination parameters
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit, 10);
    console.log("Pagination - skip:", skip, "limit:", limitNum);

    // Aggregation pipeline
    const pipeline = [
        { "$match": { "user": new ObjectId('677d75fab2913ca0b3f234c3') } },  // Match on user field
        { "$lookup": {
                "from": "people",
                "localField": "person",
                "foreignField": "_id",
                "as": "personDetails"
            }},
        { "$unwind": { "path": "$personDetails", "preserveNullAndEmptyArrays": true }},  // Unwind person details
        { "$group": {
                "_id": "$person",
                "personDetails": { "$first": "$personDetails" },
                "orders": {
                    "$push": {
                        "_id": "$_id",
                        "type": "$type",
                        "status": "$status",
                        "purchaseItemList": "$purchaseItemList",
                        "amountPaid": "$amountPaid",
                        "amountPending": "$amountPending",
                        "totalAmount": "$totalAmount",
                        "createdAt": "$createdAt"
                    }
                },
                "totalAmountPaid": { "$sum": "$amountPaid" }
            }},
        { "$sort": { "createdAt": -1 }},  // Sort by creation date
        { "$facet": {
                "metadata": [
                    { "$count": "total" },
                    { "$addFields": { "page": 1 }}
                ],
                "data": [
                    { "$skip": 0 },
                    { "$limit": 10 }
                ]
            }},
        { "$unwind": "$results" },
        { "$replaceRoot": { "newRoot": "$results" }},
        { "$group": {
                "_id": null,
                "totalAmountPaid": { "$sum": "$totalAmountPaid" },
                "results": { "$push": "$$ROOT" }
            }},
        { "$unwind": "$results" },
        { "$replaceRoot": { "newRoot": "$results" }}
    ];

    console.log("Constructed aggregation pipeline:", JSON.stringify(pipeline, null, 2));

    try {
        const result = await Order.aggregate(pipeline).explain();
        console.log("Aggregation result:", JSON.stringify(result, null, 2));

        // Extract data and metadata
        const data = result[0]?.data || [];
        const metadata = result[0]?.metadata[0] || { total: 0, page: parseInt(page) };
        const totalPages = Math.ceil(metadata.total / limitNum);

        // const totalAmount = data.reduce(
        //     (sum, person) => sum + (person.totalAmountPaid || 0),
        //     0
        // );

        const response = {
            statusCode: 1,
            results: data,
            totalResults: metadata.total,
            total: metadata.total,
            page: metadata.page,
            totalPages,
            limit: limitNum,
        };

        console.log("-----------------------Report - Response--------------------------");
        console.log(response);
        console.log("-----------------------Report - Response--------------------------");

        return response;
    } catch (error) {
        console.error("Error during aggregation:", error);
        throw new Error("Failed to generate the report. Please try again.");
    }
};


const createOrder = async (user, orderBody) => {
    const person = await Person.isPersonExistById(orderBody.person);

    if (!person) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `Person with id ${orderBody.person} not found`
        );
    }

    if (
        (orderBody.type === "sale" && person.type !== "customer") ||
        (orderBody.type === "purchase" && person.type !== "supplier")
    ) {
        let errorMessage =
            orderBody.type === "sale"
                ? "A Sales order cannot be placed for Supplier"
                : "A Purchase order cannot be placed for Customer";
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    const {inventory} = await User.findById(user.id)
        .select("inventory")
        .populate("inventory");
    for (const item of orderBody.purchaseItemList) {
        if (!inventory.items.includes(item.item)) {
            throw new ApiError(
                httpStatus.NOT_FOUND,
                `Item with id ${item.item} not found`
            );
        }
    }
    console.log("logggggg");
    console.log(orderBody);
    orderBody = {
        ...orderBody,
        user: user.id,
    };
    console.log("person",person)
    const order = await Order.create(orderBody);
    user.orders.push(order.id);
    if (order.type === "sale") {
        user.pendingReceivable = order.amountPending + user.pendingReceivable;
    } else {
        user.pendingPayable = order.amountPending + user.pendingPayable;
    }
    await user.save();
    person.user= user.id;
    person.orders.push(order.id);
    person.totalOverdue = person.totalOverdue + order.amountPending;
    await person.save();

    return order;
};

const updateOrder = async (user, orderId, orderBody) => {
    const previousOrder = await Order.findById(orderId);
    const newOrder = await Order.findByIdAndUpdate(orderId, orderBody, {
        new: true,
    });
    await newOrder.save();
    if (!previousOrder) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `Order with id ${orderId} not found`
        );
    }

    console.log(user.orders.includes(orderId));
    if (!user.orders.includes(orderId)) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Not allowed to update this order"
        );
    }
    if (!previousOrder.person === orderBody.person) {
        //Assuming that the order type and customer type remains same
        const previousPerson = await Person.findById(previousOrder.person);
        const newPerson = await Person.findById(orderBody.person);

        previousPerson.orders.pull(order.id);
        newPerson.orders.push(orderBody.id);

        previousPerson.totalOverdue =
            previousPerson.totalOverdue - previousOrder.amountPending;

        if (
            (orderBody.type === "sale" && newPerson.type !== "customer") ||
            (orderBody.type === "purchase" && newPerson.type !== "supplier")
        ) {
            let errorMessage =
                orderBody.type === "sale"
                    ? "A Sales order cannot be placed for Supplier"
                    : "A Purchase order cannot be placed for Customer";
            throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
        }

        //saving for calculating pending amount
        newPerson.totalOverdue = newPerson.totalOverdue + newOrder.amountPending;
        await previousPerson.save();
        await newPerson.save();
    }

    //deducting old pending amount
    if (previousOrder.type === "sale") {
        user.pendingReceivable =
            user.pendingReceivable - previousOrder.amountPending;
    } else {
        user.pendingPayable = user.pendingPayable - previousOrder.amountPending;
    }
    //adding new pending amount
    if (newOrder.type === "sale") {
        user.pendingReceivable = user.pendingReceivable + newOrder.amountPending;
    } else {
        user.pendingPayable = user.pendingPayable + newOrder.amountPending;
    }

    await user.save();

    return newOrder;
};

const deleteOrder = async (user, orderId) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            `Order with id ${orderId} not found`
        );
    }
    if (!user.persons.contains(orderId)) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Not allowed to update this order"
        );
    }
    console.log("order");
    console.log(order);

    const person = await Person.findById(order.person);
    person.orders.pull(order.id);
    person.totalOverdue = person.totalOverdue - order.amountPending;
    await person.save();

    user.orders.pull(order.id);
    if (order.type === "sale") {
        user.pendingReceivable = user.pendingReceivable - order.amountPending;
    } else {
        user.pendingPayable = user.pendingPayable - order.amountPending;
    }
    await user.save();

    await Order.findByIdAndDelete(orderId);
    return order;
};

module.exports = {
    createOrder,
    getAllOrders,
    getReportOrder,
    updateOrder,
    deleteOrder,
};
