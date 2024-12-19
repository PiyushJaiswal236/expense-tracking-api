const express = require("express");
const validate = require("../../middlewares/validate");
const authValidation = require("../../object_validations/auth.validation");
const authController = require("../../controllers/auth.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("auth route working");
});

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);
router.post("/login", validate(authValidation.login), authController.login);
router.post("/logout", validate(authValidation.logout), authController.logout);
router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);
router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);

module.exports = router;
