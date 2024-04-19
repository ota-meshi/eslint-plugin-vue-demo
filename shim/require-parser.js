/* globals loadedParsers -- shim */
module.exports = function (nm) {
  if (nm === "espree") {
    // eslint-disable-next-line n/no-extraneous-require -- ignore
    return require("espree")
  }
  if (typeof loadedParsers !== "undefined") {
    return loadedParsers.parsers[nm]
  }
  // eslint-disable-next-line n/no-extraneous-require -- ignore
  return require("espree")
}
