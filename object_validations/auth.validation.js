const Joi = require("joi");
const { password, emptyString} = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    email: Joi.string().custom(emptyString).required().email(),
    password: Joi.string().custom(emptyString).required().custom(password),
    name: Joi.string().custom(emptyString).required(),
    phoneNumber : Joi.string().custom(emptyString).required(),
    city : Joi.string().custom(emptyString).required(),
    address : Joi.string().custom(emptyString).required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().custom(emptyString).required(),
    password: Joi.string().custom(emptyString).required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().custom(emptyString).required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().custom(emptyString).required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().custom(emptyString).required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().custom(emptyString).required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().custom(emptyString).required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
