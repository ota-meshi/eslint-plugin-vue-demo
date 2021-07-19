import pako from "pako"

/**
 * Get only enabled rules to make the serialized data smaller.
 * @param {object} allRules The rule settings.
 * @returns {object} The rule settings for the enabled rules.
 */
function getEnabledRules(
  allRules: Record<string, "error" | "off">,
): Record<string, 2> {
  return Object.keys(allRules).reduce((map, id) => {
    if (allRules[id] === "error") {
      map[id] = 2
    }
    return map
  }, {} as Record<string, 2>)
}

/**
 * Serialize a given state as a base64 string.
 * @param {State} state The state to serialize.
 * @returns {string} The serialized string.
 */
export function serializeState(state: {
  code?: string
  rules?: Record<string, "error" | "off">
  parser?: string
}): string {
  const saveData = {
    code: state.code,
    rules: state.rules ? getEnabledRules(state.rules) : undefined,
    parser: state.parser,
  }
  const jsonString = JSON.stringify(saveData)
  const uint8Arr = new TextEncoder().encode(jsonString)
  const compressedString = String.fromCharCode(...pako.deflate(uint8Arr))
  const base64 =
    (typeof window !== "undefined" && window.btoa(compressedString)) ||
    compressedString

  console.log(
    `The compress rate of serialized string: ${(
      (100 * base64.length) /
      jsonString.length
    ).toFixed(1)}% (${jsonString.length}B → ${base64.length}B)`,
  )

  return base64
}
