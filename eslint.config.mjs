import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser,
    parser: "@typescript-eslint/parser"
   }},
   {
    ignores: [
      "**/temp.js", // Example pattern
      "config/*",
      "node_modules/*",
    ],
  },
  {
    rules: {
      "@typescript-eslint/explicit-member-accessibility": 0,
      "@typescript-eslint/explicit-function-return-type": 0,
      "@typescript-eslint/no-parameter-properties": 0,
      "@typescript-eslint/interface-name-prefix": 0,
      "@typescript-eslint/explicit-module-boundary-types": 0,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-var-requires": "error",
      "no-duplicate-imports": "error",
      "no-console": "warn",
      "prettier/prettier":0
     
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];