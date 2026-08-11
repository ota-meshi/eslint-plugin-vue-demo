import fs from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

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

const REQUIRE_RESOLVE_TARGET =
  /node_modules\/eslint-plugin-vue(?:js-accessibility)?\/.*\.js$/u

/**
 * Replace `require.resolve(...)` with a dummy function call, as it cannot
 * work on the browser. (Only reached from the legacy config definitions.)
 */
function replaceRequireResolve(code: string): string {
  return code.replaceAll("require.resolve", "(function(){return 0})")
}

export default defineConfig({
  base: "/eslint-plugin-vue-demo/",
  plugins: [
    vue(),
    {
      name: "replace-require-resolve",
      enforce: "pre",
      transform(code, id) {
        if (
          REQUIRE_RESOLVE_TARGET.test(id) &&
          code.includes("require.resolve")
        ) {
          return { code: replaceRequireResolve(code), map: null }
        }
        return undefined
      },
    },
  ],
  define: {
    __BUILD_AT__: JSON.stringify(
      new Date().toLocaleString(undefined, {
        timeZoneName: "short",
      }),
    ),
    "process.env.NODE_DEBUG": "false",
  },
  resolve: {
    alias: [
      // Run the ESLint Linter on the browser. The `$`-anchored patterns
      // must not catch subpath imports like `eslint/package.json`.
      { find: /^eslint$/u, replacement: resolvePath("./shim/eslint/index.js") },
      {
        find: /^eslint\/use-at-your-own-risk$/u,
        replacement: resolvePath("./shim/eslint/use-at-your-own-risk.js"),
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
      {
        find: /^(node:)?path$/u,
        replacement: resolvePath("./node_modules/path-browserify/index.js"),
      },
      {
        find: /^(node:)?assert$/u,
        replacement: resolvePath("./node_modules/assert/build/assert.js"),
      },
      {
        find: /^(node:)?events$/u,
        replacement: resolvePath("./node_modules/events/events.js"),
      },
      {
        find: /^(node:)?fs$/u,
        replacement: resolvePath("./shim/empty-object.js"),
      },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          // The dep optimizer does not apply Vite plugin transforms,
          // so the same `require.resolve` replacement is needed here.
          name: "replace-require-resolve",
          setup(build) {
            build.onLoad(
              { filter: /eslint-plugin-vue(js-accessibility)?[/\\].*\.js$/ },
              (args) => ({
                contents: replaceRequireResolve(
                  fs.readFileSync(args.path, "utf8"),
                ),
                loader: "js",
              }),
            )
          },
        },
      ],
    },
    // Distributed as a raw `.vue` file.
    exclude: ["@ota-meshi/site-kit-eslint-editor-vue"],
    include: [
      // Aliased to local shim files, which the dependency scanner does not
      // treat as dependencies; force pre-bundling of their CJS internals.
      "eslint",
      "eslint/use-at-your-own-risk",
      "vue-eslint-parser",
      "eslint-plugin-vue",
      "eslint-plugin-vuejs-accessibility",
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
