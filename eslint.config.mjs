// eslint.config.mts / eslint.config.mjs

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
	{
		ignores: ["**/dist", "**/build", ".turbo", "coverage", "**/node_modules"],
	},

	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2021,
			sourceType: "module",
		},
		rules: {
			"no-console": "warn",
			"no-debugger": "error",
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},

	{
		files: ["apps/core/**/*.ts"],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			"no-console": "off",
		},
	},

	{
		files: ["apps/web/**/*.{ts,tsx}"],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		},
	},
);
