/* globals loadedParsers -- shim */
// eslint-disable-next-line n/no-extraneous-import -- ignore
import * as espree from "espree"

/**
 * Resolve the parser module for the given name.
 */
export default function requireParser(nm) {
  if (nm === "espree") {
    return espree
  }
  if (typeof loadedParsers !== "undefined" && loadedParsers.parsers[nm]) {
    return loadedParsers.parsers[nm]
  }

  throw new Error(`Parser "${nm}" not loaded`)
}
