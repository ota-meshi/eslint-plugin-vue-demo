// eslint-disable-next-line n/no-extraneous-require -- OK
const webpack = require("webpack")
const path = require("path")
process.env.VUE_APP_BUILD_AT = new Date().toLocaleString(undefined, {
  timeZoneName: "short",
})

// check for versions
console.log(
  [
    require("eslint-plugin-vue/package.json"),
    require("vue-eslint-parser/package.json"),
    require("eslint/package.json"),
    require("@typescript-eslint/parser/package.json"),
    require("typescript/package.json"),
    require("eslint-plugin-vuejs-accessibility/package.json"),
  ]
    .map((pkg) => `${pkg.name}@${pkg.version}`)
    .join("\n"),
)

module.exports = {
  publicPath: "/eslint-plugin-vue-demo/",
  configureWebpack(_config, _isServer) {
    return {
      resolve: {
        alias: {
          module: path.resolve("./shim/module.js"),
          globby: path.resolve("./shim/empty"),
          "fast-glob": path.resolve("./shim/empty"),
          eslint$: path.resolve("./shim/eslint/index.js"),
          "eslint/use-at-your-own-risk": path.resolve(
            "./shim/eslint//use-at-your-own-risk.js",
          ),
          esquery: path.resolve("./node_modules/esquery/dist/esquery.min.js"),
          "@eslint/eslintrc/universal": path.resolve(
            "./node_modules/@eslint/eslintrc/dist/eslintrc-universal.cjs",
          ),
        },
        fallback: {
          assert: require.resolve("assert/"),
          path: require.resolve("path-browserify"),
          fs: false,
        },
      },
      externals: { "node:os": "{}", "node:fs": "{}", "node:util": "{}" },
      plugins: [
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
          const mod = resource.request.replace(/^node:/, "")
          if (mod === "assert") {
            resource.request = "assert"
          } else if (mod === "path") {
            resource.request = "path-browserify"
          } else {
            // throw new Error(`Not found ${mod}`)
          }
        }),
      ],
      module: {
        rules: [
          {
            // Patch for `vue-eslint-parser`
            test: /node_modules\/vue-eslint-parser\/index\.js$/u,
            loader: "string-replace-loader",
            options: {
              search: "require\\(parser\\)",
              replace: (original) =>
                `require(${JSON.stringify(
                  require.resolve("./shim/require-parser.js"),
                )})(parser) // ${original}`,
              flags: "",
            },
          },
        ],
      },
    }
  },
}
