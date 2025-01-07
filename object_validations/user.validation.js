const Joi = require("joi");
const { password, objectId, emptyString} = require("./custom.validation");

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().custom(emptyString).required().email(),
    password: Joi.string().custom(emptyString).required().custom(password),
    name: Joi.string().custom(emptyString).required(),
    role: Joi.string().custom(emptyString).required().valid("user", "admin"),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};


//
// const updateUser = {
//   params: Joi.object().keys({
//     userId: Joi.required().custom(objectId),
//   }),
//   body: Joi.object()
//     .keys({
//       email: Joi.string().email(),
//       password: Joi.string().custom(password),
//       name: Joi.string(),
//     })
//     .min(1),
// };


const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().required().custom(objectId), // Validates the user ID as a valid MongoDB ObjectId
  }),
  body: Joi.object()
      .keys({
        name: Joi.string().trim(),
        email: Joi.string().email().trim().lowercase(),
        password: Joi.string().custom(password), // Custom validation for the password
        phoneNumber: Joi.string().trim(),
        address: Joi.string().trim(),
        city: Joi.string().trim(),
      })
      .min(1), // At least one field must be provided for update
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
