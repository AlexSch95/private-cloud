import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "*.min.js",
      "*.test.js",
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        bootstrap: "readonly",
        marked: "readonly"
      }
    },
    rules: {
      "indent": ["error", 2],
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
      "no-unused-vars": "error",
      "no-console": ["warn", { "allow": ["error", "warn", "info"] }]
    }
  },
  {
    files: ["*.config.js", "jest.setup.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node
    }
  }
];