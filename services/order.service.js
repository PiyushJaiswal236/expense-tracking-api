const {Order, Item, Person, User} = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const getAllOrders = async (filter, options) => {

    try {
        const orders = await Order.paginate(filter, options);
        return orders;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
    }
}

const createOrder = async (user, orderBody) => {

    const person = await Person.isPersonExistById(orderBody.person)

    if (!person) {
        throw new ApiError(httpStatus.NOT_FOUND, `Person with id ${orderBody.person} not found`);
    }
    if ((orderBody.type === "sale" && person.type !== "customer") || (orderBody.type === "purchase" && person.type !== "supplier")) {
        let errorMessage = orderBody.type === "sale"
            ? 'A Sales order cannot be placed for Supplier'
            : 'A Purchase order cannot be placed for Customer';
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    const {inventory} = await User.findById(user.id).select("inventory").populate('inventory');
    for (const item of orderBody.purchaseItemList) {
        if (!inventory.items.includes(item.item)) {
            throw new ApiError(httpStatus.NOT_FOUND, `Item with id ${item.item} not found`);
        }
    }
    console.log("logggggg")
    console.log(
        orderBody
    )
    orderBody = {
        ...orderBody,
        user: user.id
    }
    console.log(orderBody)
    const order = await Order.create(orderBody);
    user.orders.push(order.id);
    if (order.type === "sale") {
        user.pendingReceivable = order.amountPending + user.pendingReceivable;
    } else {
        user.pendingPayable = order.amountPending + user.pendingPayable;
    }
    await user.save();

    person.orders.push(order.id);
    person.totalOverdue = person.totalOverdue + order.amountPending;
    await person.save();

    return order;
}

const updateOrder = async (user, orderId, orderBody) => {
    const previousOrder = await Order.findById(orderId);
    const newOrder = await Order.findByIdAndUpdate(orderId, orderBody, {new: true});
    await newOrder.save();
    if (!previousOrder) {
        throw new ApiError(httpStatus.NOT_FOUND, `Order with id ${orderId} not found`);
    }

    console.log(user.orders.includes(orderId))
    if (!user.orders.includes(orderId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Not allowed to update this order");
    }
    if (!previousOrder.person === orderBody.person) {

        //Assuming that the order type and customer type remains same
        const previousPerson = await Person.findById(previousOrder.person);
        const newPerson = await Person.findById(orderBody.person);

        previousPerson.orders.pull(order.id);
        newPerson.orders.push(orderBody.id);

        previousPerson.totalOverdue = previousPerson.totalOverdue - previousOrder.amountPending;

        if ((orderBody.type === "sale" && newPerson.type !== "customer") || (orderBody.type === "purchase" && newPerson.type !== "supplier")) {
            let errorMessage = orderBody.type === "sale"
                ? 'A Sales order cannot be placed for Supplier'
                : 'A Purchase order cannot be placed for Customer';
            throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
        }

        //saving for calculating pending amount
        newPerson.totalOverdue = newPerson.totalOverdue + newOrder.amountPending;
        await previousPerson.save();
        await newPerson.save();
    }

    //deducting old pending amount
    if (previousOrder.type === "sale") {
        user.pendingReceivable = user.pendingReceivable - previousOrder.amountPending;
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
}

const deleteOrder = async (user, orderId,) => {

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, `Order with id ${orderId} not found`);
    }
    if (!user.persons.contains(orderId)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Not allowed to update this order");
    }
    console.log("order")
    console.log(order)

    const person = await Person.findById(order.person)
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
}


module.exports = {
    createOrder,
    getAllOrders,
    updateOrder,
    deleteOrder,
}


