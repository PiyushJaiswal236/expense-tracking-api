const catchAsync = require("../utils/CatchAsync");
const { orderService } = require("../services");
const httpStatus = require("http-status");
const pick = require("../utils/pick");

const getAllOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "type"]);
  filter.user = req.user.id;
  const query = req.query;
  if (query.startDate) {
    filter.createdAt = { $gte: new Date(query.startDate) };
  }
  if (query.endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(query.endDate);
  }
  if (query.minAmount) {
    filter.totalAmount = { $gte: query.minAmount };
  }
  if (query.maxAmount) {
    filter.totalAmount = filter.totalAmount || {};
    filter.totalAmount.$lte = query.maxAmount;
  }
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  options.populate = "person  purchaseItemList";
  const orders = await orderService.getAllOrders(filter, options);
  orders.orders = orders.results;
  delete orders.results;
  res.status(httpStatus.OK).json({ ...orders, status: 1, message: "success" });
});

const getReport = catchAsync(async (req, res) => {
  const result = await orderService.getReportOrder(req.user.id,req.query);
  res.status(httpStatus.OK).send(result);
});

const getOrderByGroup = catchAsync(async (req, res) => {
  const result = await orderService.getOrderGroupedByDateAndPerson(req.user.id,req.query);
  res.status(httpStatus.OK).send(result);
});



const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(httpStatus.CREATED).send(order);
});

const updateOrder = catchAsync(async (req, res) => {
  const orderBody = req.body;
  const order = await orderService.updateOrder(
    req.user,
    req.params.orderId,
    orderBody
  );
  res.status(httpStatus.OK).send(order);
});

const deleteOrder = catchAsync(async (req, res) => {
  const order = await orderService.deleteOrder(req.user, req.params.orderId);
  res.status(httpStatus.OK).send(order);
});
module.exports = {
  getAllOrders,
  getOrderByGroup,
  getReport,
  createOrder,
  updateOrder,
  deleteOrder,
};
