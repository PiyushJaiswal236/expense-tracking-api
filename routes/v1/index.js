var express = require("express");
var usersRouter = require("./users.route");
var authRouter = require("./auth.route");
var router = express.Router();

// heath check route
router.get("/health", (req, res) => {
  res.send("The API is working");
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/users", usersRouter);
router.use("/auth", authRouter);

module.exports = router;
