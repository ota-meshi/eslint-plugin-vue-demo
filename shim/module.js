const requireParser = require("./require-parser")
module.exports = {
  createRequire: () => requireParser,
}
