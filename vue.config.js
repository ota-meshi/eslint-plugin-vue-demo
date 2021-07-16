const path = require("path")
module.exports = {
    publicPath: "/eslint-plugin-vue-demo/",
    configureWebpack(_config, _isServer) {
        return {
            resolve: {
                alias: {
                    module: path.resolve("./shim/module.js"),
                    eslint$: path.resolve("./shim/eslint/index.js"),
                    eslint: path.resolve("./shim/eslint"),
                },
            },
            module: {
                rules: [
                    //   {
                    //     test: /node_modules\/eslint-plugin-svelte3\/index\.js$/u,
                    //     loader: "string-replace-loader",
                    //     options: {
                    //       search: "require\\(linter_path\\)",
                    //       replace: (original) =>
                    //         `require(${JSON.stringify(
                    //           require.resolve("./shim/eslint/lib/linter/linter")
                    //         )}) // ${original}`,
                    //       flags: "",
                    //     },
                    //   },
                    //   {
                    //     test: /node_modules\/eslint-plugin-svelte3\/index\.js$/u,
                    //     loader: "string-replace-loader",
                    //     options: {
                    //       search:
                    //         "throw new Error\\('Could not find ESLint Linter in require cache'\\);",
                    //       replace: (original) => ` // ${original}`,
                    //       flags: "",
                    //     },
                    //   },
                ],
            },
        }
    },
}
