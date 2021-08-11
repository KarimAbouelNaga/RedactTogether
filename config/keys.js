const devKeys = require("./dev.js");
const prodKeys = require("./prod.js");
const localKeys = require("./local.js");

switch (process.env.NODE_ENV) {
  case "production ":
    module.exports = prodKeys;
    break;
  case "development ":
    module.exports = localKeys;
    break;
  default:
    module.exports = devKeys;
    break;
}
