module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:@ota-meshi/recommended",
    "plugin:@ota-meshi/+vue3",
    "plugin:@ota-meshi/+node",
    "plugin:@ota-meshi/+typescript",
    "plugin:@ota-meshi/+json",
    "plugin:@ota-meshi/+yaml",
    "plugin:@ota-meshi/+prettier",
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  globals: {
    process: "readonly",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-process-env": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
    "prettier/prettier": [
      "error",
      {},
      {
        usePrettierrc: true,
      },
    ],
  },
  overrides: [
    {
      files: ["*.ts"],
      parser: "typescript-eslint-parser-for-extra-files",
      parserOptions: {
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: {
          ts: "typescript-eslint-parser-for-extra-files",
          js: "typescript-eslint-parser-for-extra-files",
        },
        sourceType: "module",
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
      extends: [
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/array-type": "error",
        "@typescript-eslint/explicit-module-boundary-types": [
          "error",
          { allowArgumentsExplicitlyTypedAsAny: true },
        ],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "default",
            format: ["camelCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "typeLike",
            format: ["PascalCase"],
          },
          {
            selector: "memberLike",
            format: ["camelCase", "UPPER_CASE"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
          },
          {
            selector: "import",
            format: ["camelCase", "PascalCase", "UPPER_CASE"],
          },
          {
            selector: "property",
            format: null,
          },
          {
            selector: "method",
            format: null,
          },
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/explicit-member-accessibility": "error",
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/parameter-properties": "error",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-this-alias": [
          "error",
          { allowDestructuring: true },
        ],
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-arguments": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-var-requires": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/prefer-regexp-exec": "error",
        "@typescript-eslint/prefer-string-starts-ends-with": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        "@typescript-eslint/require-array-sort-compare": "error",
        "@typescript-eslint/triple-slash-reference": "error",
        "@typescript-eslint/unbound-method": ["error", { ignoreStatic: true }],
        "@typescript-eslint/unified-signatures": "error",
        // Replacements
        camelcase: "off",
        // "@typescript-eslint/camelcase": "error",
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "error",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "require-await": "off",
        "@typescript-eslint/require-await": "error",
        "no-use-before-define": "off",
        // eslint-disable-next-line json-schema-validator/no-invalid -- schema bug?
        "@typescript-eslint/no-use-before-define": [
          "error",
          {
            // eslint-disable-next-line json-schema-validator/no-invalid -- schema bug?
            functions: false,
            // eslint-disable-next-line json-schema-validator/no-invalid -- schema bug?
            classes: true,
            // eslint-disable-next-line json-schema-validator/no-invalid -- schema bug?
            variables: true,
            // eslint-disable-next-line json-schema-validator/no-invalid -- schema bug?
            ignoreTypeReferences: true,
          },
        ],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-unsafe-assignment": "off",
      },
    },
  ],
}
