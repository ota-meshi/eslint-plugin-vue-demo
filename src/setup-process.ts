// Some bundled packages access `process` at module evaluation time,
// so this shim must be imported before anything else.
// Note that another tool may have already defined a partial
// `window.process`, so fill in only the missing pieces.
if (typeof window !== "undefined") {
  const global = window as any
  if (typeof global.process === "undefined") {
    global.process = {}
  }
  if (typeof global.process.env === "undefined") {
    global.process.env = {}
  }
  if (typeof global.process.cwd !== "function") {
    global.process.cwd = () => "/"
  }
}
