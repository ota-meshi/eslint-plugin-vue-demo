/* eslint no-unused-vars: 2 -- js */
import globals from "globals"
import * as tsParser from "typescript-eslint-parser-for-extra-files"
import parser from "vue-eslint-parser"
import myPlugin from "@ota-meshi/eslint-plugin"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: ["node_modules", "dist", "!.vscode", "!.github", "!.devcontainer"],
  },
  ...myPlugin.config({
    vue3: true,
    node: true,
    ts: true,
    json: true,
    yaml: true,
    prettier: true,
  }),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly",
      },
      sourceType: "module",
    },

    rules: {
      "no-console": "off",
      "no-debugger": "off",
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
  },
  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tsParser,
      sourceType: "module",

      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },
  ...tseslint.config({
    files: ["**/*.vue"],
    extends: [tseslint.configs.disableTypeChecked],
  }),
  {
    files: ["**/*.vue"],

    languageOptions: {
      parser,
      sourceType: "module",

      parserOptions: {
        parser: {
          ts: "typescript-eslint-parser-for-extra-files",
          js: "typescript-eslint-parser-for-extra-files",
        },

        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/array-type": "error",

      "@typescript-eslint/explicit-module-boundary-types": [
        "error",
        {
          allowArgumentsExplicitlyTypedAsAny: true,
        },
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
        {
          allowDestructuring: true,
        },
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

      "@typescript-eslint/unbound-method": [
        "off",
        {
          ignoreStatic: true,
        },
      ],

      "@typescript-eslint/unified-signatures": "error",
      camelcase: "off",
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "error",
      "no-useless-constructor": "off",
      "@typescript-eslint/no-useless-constructor": "error",
      "require-await": "off",
      "@typescript-eslint/require-await": "error",
      "no-use-before-define": "off",

      "@typescript-eslint/no-use-before-define": [
        "error",
        {
          functions: false,
          classes: true,
          variables: true,
          ignoreTypeReferences: true,
        },
      ],

      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-unsafe-assignment": "off",

      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
    },
  },
]
