const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { roleRights } = require("../config/roles");
const config = require("../config/config");
const { User } = require("../models");
const { authService, userService } = require("../services");

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    if (!req.headers.authorization) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
    }

    const token = req.headers.authorization.split(" ")[1];
    const payload = verifyToken(token, config.jwt.secret);

    console.log(payload.sub);
    req.user = await userService.getUserById(payload.sub.toString());
    console.log(req.user);

    if (requiredRights.length) {
      console.log(req.user.role);
      const userRights = roleRights.get(req.user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== req.user.id) {
        return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    next();
  };

module.exports = auth;
