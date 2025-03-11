/* globals loadedParsers -- shim */
module.exports = function (nm) {
  if (nm === "espree") {
    // eslint-disable-next-line n/no-extraneous-require -- ignore
    return require("espree")
  }
  if (typeof loadedParsers !== "undefined" && loadedParsers.parsers[nm]) {
    return loadedParsers.parsers[nm]
  }

  throw new Error(`Parser "${nm}" not loaded`)
}
