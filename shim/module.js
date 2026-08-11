import requireParser from "./require-parser.js"

/**
 * Shim for `module.createRequire`.
 */
export function createRequire() {
  return requireParser
}
export default { createRequire }
