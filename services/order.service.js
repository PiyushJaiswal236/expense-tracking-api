const {Order, Item, Person, User, Inventory} = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const {ObjectId} = require("mongodb");
const {inventoryService} = require("./index");

const getAllOrders = async (filter, options) => {
    try {
        const orders = await Order.paginate(filter, options);
        return orders;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
};
const getOrder = async (filter, options) => {
    try {
        let sort = "";
        if (options.sortBy) {
            const sortingCriteria = [];
            options.sortBy.split(",").forEach((sortOption) => {
                const [key, order] = sortOption.split(":");
                sortingCriteria.push((order === "desc" ? "-" : "") + key);
            });
            sort = sortingCriteria.join(" ");
        } else {
            sort = "createdAt";
        }
        // Default values for pagination
        const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
        const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
        const skip = (page - 1) * limit;

        // Build the query directly in Mongoose
        const query = Order.find(filter)
            .populate({
                path: "person", // Populate 'person' field
            })
            .populate({
                path: "purchaseItemList.item", // Populate 'item' within 'purchaseItemList'
                select: "name description price unit category", // Select specific fields
            })
            .sort(sort) // Apply sorting directly
            .skip(skip) // Skip records for pagination
            .limit(limit); // Limit the number of records

        // Execute the query and count documents simultaneously
        const [results, totalResults] = await Promise.all([
            query.exec(),
            Order.countDocuments(filter), // Get total count of matching documents
        ]);

        // Calculate total pages
        const totalPages = Math.ceil(totalResults / limit);

        // Return the result in the required format
        return {
            results,
            page,
            limit,
            totalPages,
            totalResults,
        };
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
        { $match: match }, // Filter orders by user and other filters
        {
            $lookup: {
                from: "people", // Reference to the 'persons' collection
                localField: "person",
                foreignField: "_id",
                as: "personDetails",
            },
        },
        { $unwind: { path: "$personDetails", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$person",
                personDetails: { $first: "$personDetails" },
                orders: {
                    $push: {
                        _id: "$_id",
                        type: "$type",
                        status: "$status",
                        purchaseItemList: "$purchaseItemList",
                        amountPaid: "$amountPaid",
                        amountPending: "$amountPending",
                        totalAmount: "$totalAmount",
                        createdAt: "$createdAt",
                    },
                },
                totalAmountPaid: { $sum: "$amountPaid" }, // Sum of all orders' amountPaid
            },
        },
        { $sort: sort }, // Sort orders
        {
            $facet: {
                metadata: [
                    { $count: "total" },
                    { $addFields: { page: parseInt(page) } },
                ],
                data: [{ $skip: skip }, { $limit: limitNum }],
            },
        },

    ];

    console.log("Constructed aggregation pipeline:", JSON.stringify(pipeline, null, 2));

    try {
        const result = await Order.aggregate(pipeline);
        console.log("Aggregation result:", JSON.stringify(result, null, 2));

        // Extract data and metadata
        const data = result[0]?.data || [];
        const metadata = result[0]?.metadata[0] || { total: 0, page: parseInt(page) };
        const totalPages = Math.ceil(metadata.total / limitNum);
        // Calculate the total amount separately
        const totalPipeline = [
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalAmountPaid: { $sum: "$amountPaid" },
                },
            },
        ];
        const totalResult = await Order.aggregate(totalPipeline);
        const totalAmountPaid = totalResult.length > 0 ? totalResult[0].totalAmountPaid : 0;



        // const totalAmount = data.reduce(
        //     (sum, person) => sum + (person.totalAmountPaid || 0),
        //     0
        // );

        const response = {
            statusCode: 1,
            results: data,
            totalResults: metadata.total,
            totalAmount: totalAmountPaid,
            page: metadata.page,
            totalPages,
            limit: limitNum,
        };

        return response;
    } catch (error) {
        console.error("Error during aggregation:", error);
        throw new Error("Failed to generate the report. Please try again.");
    }
};

const getOrderGroupedByDateAndPerson = async (userId, query) => {
    console.log("Received query parameters:", query);

    const {
        personId,
        type,
        startDate,
        endDate,
        sortBy = "createdAt:desc",
        limit = 10,
        page = 1,
    } = query;

    console.log("Parsed parameters:");
    console.log("personId:", personId);
    console.log("type:", type);
    console.log("sortBy:", sortBy);
    console.log("limit:", limit);
    console.log("page:", page);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);

    // Initialize filters
    const match = { user: new mongoose.Types.ObjectId(userId) };
    if (personId) match._id = new mongoose.Types.ObjectId(personId);
    if (type) match.type = type;
    if (startDate)
        match['orders.createdAt'] = { ...match['orders.createdAt'], $gte: new Date(startDate) };
    if (endDate)
        match['orders.createdAt'] = { ...match['orders.createdAt'], $lte: new Date(endDate) };

    console.log("Constructed match filter:", match);

    // Parse sortBy parameter
    const [sortField, sortOrder] = sortBy.split(":");
    const sort = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Pagination parameters
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit, 10);

    // Aggregation pipeline
    const pipeline = [
        { $match: match }, // Match persons based on filters
        {
            $lookup: {
                from: 'orders', // Lookup orders collection
                localField: '_id',
                foreignField: 'person',
                as: 'orders',
            },
        },
        { $unwind: '$orders' },
        {
            $addFields: {
                orderDate: { $dateToString: { format: '%Y-%m-%d', date: '$orders.createdAt' } },
            },
        },
        {
            $group: {
                _id: { orderDate: '$orderDate', personId: '$_id' },
                person: { $first: { $arrayToObject: { $filter: { input: { $objectToArray: '$$ROOT' }, as: 'field', cond: { $ne: ['$$field.k', 'orders'] } } } } }, // Include all fields except 'orders'
                orders: { $push: '$orders' },
                personPendingAmountSum: { $sum: '$orders.amountPending' },
            },
        },
        {
            $group: {
                _id: '$_id.orderDate',
                persons: {
                    $push: {
                        person: '$person',
                        orders: '$orders',
                        personPendingAmountSum: '$personPendingAmountSum',
                    },
                },
                totalPendingAmount: { $sum: '$personPendingAmountSum' },
            },
        },
        { $sort: { _id: -1 } }, // Sort by date descending
        {
            $facet: {
                metadata: [{ $count: 'total' }, { $addFields: { page: parseInt(page, 10) } }],
                data: [{ $skip: skip }, { $limit: limitNum }],
            },
        },
    ];

    try {
        const result = await Person.aggregate(pipeline);
        console.log("Aggregation result:", JSON.stringify(result, null, 2));

        // Extract data and metadata
        const data = result[0]?.data || [];
        const metadata = result[0]?.metadata[0] || { total: 0, page: parseInt(page, 10) };
        const totalPages = Math.ceil(metadata.total / limitNum);

        const response = {
            statusCode: 1,
            results: data,
            totalResults: metadata.total,
            page: metadata.page,
            totalPages,
            limit: limitNum,
        };

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
                if(orderBody.type === "sale") {
                    throw new ApiError(
                        httpStatus.NOT_FOUND,
                        `Item with id ${item.item} not found`
                    );
                }
                await inventoryService.addItemToInventory(inventory.id,item)
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
    person.shopNumber = orderBody.shopNumber;
    person.totalOverdue = person.totalOverdue + order.amountPending;
    await person.save();

    return order;
};

const updateOrder = async (user, orderId, orderBody) => {
    const previousOrder = await Order.findById(orderId);
    if(previousOrder===undefined||previousOrder===null){
        throw  new ApiError(httpStatus.BAD_REQUEST, `Order with id ${orderId} not found`);
    }
    if(orderBody.purchaseItemList!==undefined){
        for(let i = 0; i < orderBody.purchaseItemList.length; i++){

        orderBody.purchaseItemList[i].item = orderBody.purchaseItemList[i].itemId;
        delete orderBody.purchaseItemList[i].itemId;
        }
    }
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
    getOrder,
    getOrderGroupedByDateAndPerson,
    getReportOrder,
    updateOrder,
    deleteOrder,
};
