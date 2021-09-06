import pako from "pako"

/**
 * Deserialize a given serialized string then update this object.
 * @param {string} serializedString A serialized string.
 * @returns {object} The deserialized state.
 */
export function deserializeState(serializedString: string): {
  code?: string
  rules?: Record<string, "error" | "off">
  parser?: string | Record<string, string>
} {
  const state: {
    code?: string
    rules?: Record<string, "error" | "off">
    parser?: string | Record<string, string>
  } = {
    code: undefined,
    rules: undefined,
    parser: undefined,
  }

  if (serializedString === "") {
    return state
  }

  try {
    const compressedString = window.atob(serializedString)
    const uint8Arr = pako.inflate(
      Uint8Array.from(compressedString, (c) => c.charCodeAt(0)),
    )
    const jsonText = new TextDecoder().decode(uint8Arr)
    const json = JSON.parse(jsonText)

    if (typeof json === "object" && json != null) {
      if (typeof json.code === "string") {
        state.code = json.code
      }
      if (typeof json.parser === "string" || typeof json.parser === "object") {
        state.parser = json.parser
      }
      if (typeof json.rules === "object" && json.rules != null) {
        state.rules = {}
        for (const id of Object.keys(json.rules)) {
          state.rules[id] = json.rules[id] === 2 ? "error" : "off"
        }
      }
    }
  } catch (error) {
    console.error(error)
  }

  return state
}
