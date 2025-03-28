const httpStatus = require("http-status");
const catchAsync = require("../utils/CatchAsync");
const {
  authService,
  userService,
  tokenService,
  emailService,
  smsService,
} = require("../services");
const {User} = require("../models");
const bcrypt = require("bcryptjs");
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken,req.body.accessToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

// TODO : implement pheone no otp generation
const forgotPassword = catchAsync(async (req, res) => {
  // // const resetPasswordToken = await tokenService.generateResetPasswordToken(
  // //   req.body.email
  // // );
  // await smsService.sendOtpSms("7499582803");
  // // await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  const user = await userService.getUserByEmail(req.body.email);
  user.password =  req.body.password;
  await  user.save();
  res.status(httpStatus.OK).send({message: "Password changed successfully.",status: "1"});
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(
    req.user
  );
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
