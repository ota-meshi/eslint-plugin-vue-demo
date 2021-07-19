/* globals loadedParsers -- shim */
module.exports = function (nm) {
  if (typeof loadedParsers !== "undefined") {
    return loadedParsers.parsers[nm]
  }
  // eslint-disable-next-line node/no-extraneous-require -- ignore
  return require("espree")
}
