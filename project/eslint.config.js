import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";

export default [
	{
		ignores: [
			"dist",
			"node_modules",
			"*.config.js",
			"*.config.ts",
			"vite.config.ts",
		],
	},
	js.configs.recommended,
	{
		files: ["**/*.{ts,tsx,js,jsx}"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: ["./tsconfig.app.json"],
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				window: "readonly",
				document: "readonly",
				console: "readonly",
				localStorage: "readonly",
				sessionStorage: "readonly",
				setTimeout: "readonly",
				clearTimeout: "readonly",
				setInterval: "readonly",
				clearInterval: "readonly",
				setRecentReflections: "readonly",
				setWelcomeRecommendations: "readonly",
				process: "readonly",
				Buffer: "readonly",
				global: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": typescript,
			react: react,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
			import: importPlugin,
			"unused-imports": unusedImports,
			prettier: prettier,
		},
		settings: {
			react: {
				version: "detect",
			},
			"import/resolver": {
				typescript: true,
				node: true,
			},
		},
		rules: {
			// React rules
			...react.configs.recommended.rules,
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",

			// React Hooks rules
			...reactHooks.configs.recommended.rules,
			"react-hooks/exhaustive-deps": "warn",

			// TypeScript rules
			...typescript.configs.recommended.rules,
			"@typescript-eslint/no-explicit-any": [
				"warn",
				{
					fixToUnknown: false,
					ignoreRestArgs: true,
				},
			],
			"@typescript-eslint/no-unused-vars": "off", // handled by unused-imports

			// Unused imports - kill the noise automatically
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true,
				},
			],

			// Import order
			"import/order": [
				"warn",
				{
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
					},
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index",
					],
				},
			],

			// React Refresh
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],

			// Prettier - formatting is a lint error so CI fails when style drifts
			"prettier/prettier": "error",

			// Disable conflicting rules
			...prettierConfig.rules,
		},
	},
];
