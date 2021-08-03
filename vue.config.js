const path = require("path")
process.env.VUE_APP_BUILD_AT = new Date().toLocaleString(undefined, {
  timeZoneName: "short",
})

// check for versions
console.log(
  [
    require("eslint-plugin-vue/package.json"),
    require("vue-eslint-parser/package.json"),
    require("eslint4b/package.json"),
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
          eslint$: path.resolve("./shim/eslint/index.js"),
          eslint: path.resolve("./shim/eslint"),
          globby: path.resolve("./shim/empty"),
        },
      },
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
