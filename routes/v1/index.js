const express = require("express");
const docsRouter = require("./docs.route");
const usersRouter = require("./users.route");
const authRouter = require("./auth.route");
const inventoryRouter = require("./inventory.route");
const personsRouter = require("./persons.route");
const ordersRouter = require("./orders.route");
const collectionsRouter = require("./collections.route");
const router = express.Router();

// heath check route
router.get("/health", (req, res) => {
  res.send("The API is working");
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/docs", docsRouter);
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/inventory", inventoryRouter);
router.use("/persons", personsRouter);
router.use("/orders", ordersRouter);
router.use("/collections", collectionsRouter);

module.exports = router;
