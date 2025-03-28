const { version } = require("../package.json");
const config = require("../config/config");

const swaggerDef = {
  openapi: "3.0.0",
  info: {
    title: "Expense Tracking API documentation",
    version,
    license: {
      name: "MIT",
      url: "https://github.com/PiyushJaiswal236/expense-tracking-api/",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
    { url: `https://expense-track.duckdns.org/v1`, description: "Vps Server" },
  ],
};

module.exports = swaggerDef;
