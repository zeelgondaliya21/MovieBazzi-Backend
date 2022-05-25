const compression = require("compression");
const helmet = require("helmet");

module.exports = function producton(app) {
  app.use(helmet());
  app.use(compression());
};
