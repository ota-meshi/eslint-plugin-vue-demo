import { createRequire } from "node:module"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import eslint4b from "vite-plugin-eslint4b"

const require = createRequire(import.meta.url)

// check for versions
console.log(
  (
    [
      require("eslint-plugin-vue/package.json"),
      require("vue-eslint-parser/package.json"),
      require("eslint/package.json"),
      require("@typescript-eslint/parser/package.json"),
      require("typescript/package.json"),
      require("eslint-plugin-vuejs-accessibility/package.json"),
    ] as { name: string; version: string }[]
  )
    .map((pkg) => `${pkg.name}@${pkg.version}`)
    .join("\n"),
)

/**
 * Resolve a path relative to this config file.
 */
function resolvePath(path: string): string {
  return fileURLToPath(new URL(path, import.meta.url))
}

export default defineConfig({
  base: "/eslint-plugin-vue-demo/",
  plugins: [vue(), eslint4b()],
  define: {
    __BUILD_AT__: JSON.stringify(
      new Date().toLocaleString(undefined, {
        timeZoneName: "short",
      }),
    ),
  },
  resolve: {
    alias: [
      // The CJS-distributed ESLint plugins/parsers `require("eslint")`,
      // which must resolve to vite-plugin-eslint4b's virtual modules.
      // The dep optimizer cannot do that, so they are pre-bundled into
      // plain ESM by scripts/prebundle.mjs. The `$`-anchored patterns
      // must not catch subpath imports like `eslint-plugin-vue/package.json`.
      {
        find: /^eslint-plugin-vue$/u,
        replacement: resolvePath("./prebundled/eslint-plugin-vue.mjs"),
      },
      {
        find: /^vue-eslint-parser$/u,
        replacement: resolvePath("./prebundled/vue-eslint-parser.mjs"),
      },
      {
        find: /^eslint-plugin-vuejs-accessibility$/u,
        replacement: resolvePath(
          "./prebundled/eslint-plugin-vuejs-accessibility.mjs",
        ),
      },
      // vue-eslint-parser and eslint-plugin-vue use `createRequire` to
      // resolve parsers and plugins at runtime.
      { find: /^module$/u, replacement: resolvePath("./shim/module.js") },
      {
        find: /^(node:)?(os|util|module)$/u,
        replacement: resolvePath("./shim/empty-object.js"),
      },
      {
        find: /^(globby|fast-glob|tinyglobby)$/u,
        replacement: resolvePath("./shim/empty-object.js"),
      },
      // The ESM build of esquery does not interop well with the CJS
      // `require("esquery").parse()` usage inside eslint; use the UMD build.
      {
        find: /^esquery$/u,
        replacement: resolvePath("./node_modules/esquery/dist/esquery.min.js"),
      },
      // Node built-in polyfills. Absolute paths so that `node:`-prefixed
      // specifiers also resolve to the npm packages.
      // `path` and `fs` use string `find`s so that vite-plugin-eslint4b
      // detects them and does not add its own shims over them.
      {
        find: "path",
        replacement: resolvePath("./node_modules/path-browserify/index.js"),
      },
      {
        find: "node:path",
        replacement: resolvePath("./node_modules/path-browserify/index.js"),
      },
      { find: "fs", replacement: resolvePath("./shim/empty-object.js") },
      { find: "node:fs", replacement: resolvePath("./shim/empty-object.js") },
      {
        find: /^(node:)?assert$/u,
        replacement: resolvePath("./node_modules/assert/build/assert.js"),
      },
      {
        find: /^(node:)?events$/u,
        replacement: resolvePath("./node_modules/events/events.js"),
      },
    ],
  },
  optimizeDeps: {
    // Distributed as a raw `.vue` file.
    exclude: ["@ota-meshi/site-kit-eslint-editor-vue"],
    include: [
      // Loaded lazily via dynamic import; pre-bundle to avoid a full reload.
      "@typescript-eslint/parser",
      "typescript",
      "globals",
      "pako",
    ],
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 10000,
  },
})
