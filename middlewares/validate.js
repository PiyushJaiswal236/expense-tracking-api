const Joi = require("joi");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

//
const validate = (schema) => (req, res, next) => {
  // taking only the necessary fields from where data might come for comparing with received data
  const validSchema = Joi.object({
    params: schema.params || Joi.object(),
    query: schema.query || Joi.object(),
    body: schema.body || Joi.object(),
  });

  // extracting received data into a obj for comparing the format using joe package
  const object = {
    params: req.params,
    query: req.query,
    body: req.body,
  };

  // Validate the request
  const { value, error } = Joi.compile(validSchema).validate(object, {
    abortEarly: false,
    errors: { label: "key" },
  });

  // Handle validation errors
  if (error) {
    const errorMessage = error.details
      .map((detail) => detail.message)
      .join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Assign the validated values back to the request object
  Object.assign(req, value);
  next();
};

module.exports = validate;
