// Mimics webpack's `externals: { "...": "{}" }`: any property access
// returns `undefined` instead of throwing like Vite's default
// browser-external stub.
export default {}
