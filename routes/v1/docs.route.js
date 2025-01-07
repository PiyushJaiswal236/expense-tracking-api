const express = require("express");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = require("../../docs/swaggerDef");

const router = express.Router();

const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: [
    path.resolve(__dirname, "../../docs/*.yaml"),
    path.resolve(__dirname, "../v1/*.js"),
  ],
});

router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

module.exports = router;
