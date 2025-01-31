const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/CatchAsync");
const { userService } = require("../services");
const User = require("../models/user.model");

const createUser = catchAsync(async (req, res,file) => {
  if (file !== undefined) {
    req.body.image = file.id;
  }
  const user = await userService.createUser(req.body,req.file);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user);
});

const getUserShortSummery = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id,"pendingPayable pendingReceivable");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.json({user,statusCode:1,message:"Successfully fetched"});
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body,req.file);
  console.log("-----------------");
  console.log(user);
  res.status(httpStatus.OK).json({message: "User updated successfully.",statusCode:1,user});
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserShortSummery,
  updateUser,
  deleteUser,
};
