var express = require("express");
const validate = require("../../middlewares/validate");
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth");
const { userValidation } = require("../../object_validations");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("user route working");
});

router
  .route("/")
  .post(
    auth("manageUsers"),
    validate(userValidation.createUser),
    userController.createUser
  )
  .get(
    auth("getUsers"),
    validate(userValidation.getUsers),
    userController.getUsers
  );

router
  .route("/:userId")
  .get(
    auth("getUsers"),
    validate(userValidation.getUser),
    userController.getUser
  )
  .patch(
    auth("manageUsers"),
    validate(userValidation.updateUser),
    userController.updateUser
  )
  .delete(
    auth("manageUsers"),
    validate(userValidation.deleteUser),
    userController.deleteUser
  );

module.exports = router;
