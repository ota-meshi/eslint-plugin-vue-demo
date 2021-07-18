const path = require("path")
process.env.VUE_APP_BUILD_AT = `${new Date().toLocaleString()}`
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
