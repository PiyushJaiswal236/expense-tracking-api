const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const {roleRights} = require("../config/roles");
const config = require("../config/config");
const {User} = require("../models");
const {authService, userService} = require("../services");
const {TokenExpiredError} = require("jsonwebtoken");

const verifyToken = (token, secret, next) => {

};
// todo give better error response with statusCode and description
const auth =
    (...requiredRights) =>
        async (req, res, next) => {
            if (!req.headers.authorization) {
                return next(new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"));
            }
            const token = req.headers.authorization;
            let payload;
            try {
                payload = jwt.verify(token, config.jwt.secret);
            } catch (err) {
                if (err instanceof TokenExpiredError) {
                    return next(new ApiError(httpStatus.UNAUTHORIZED, "Please Refresh Token"));
                }
            }
            if(payload===undefined){
                return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid Token"));
            }
            req.user = await userService.getUserById(payload.sub);

            if (!req.user) {
                return next(
                    new ApiError(
                        httpStatus.NOT_FOUND,
                        "No user with corresponding token exists"
                    )
                );
            }

            if (requiredRights.length) {
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
