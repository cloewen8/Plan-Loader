import eslint from "@eslint/js"
import globals from "globals"
import jsonPlugin from "eslint-plugin-json"
import promisePlugin from "eslint-plugin-promise"
import jsdocPlugin from "eslint-plugin-jsdoc"
import { getJsdocProcessorPlugin } from 'eslint-plugin-jsdoc/getJsdocProcessorPlugin.js'

// plugins: json, promise, jsdoc
export default [
	eslint.configs.recommended,
	{
		files: ["*.mjs", "*.jsdoc", "*.md", "test-*.mjs", "examples/**/*"],
		rules: {
			"no-unused-labels": "off",
			"semi": "off",
			"no-var": "off"
		}
	},
	{
		languageOptions : {
			ecmaVersion: 6,
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
				_: true
			}
		},
		plugins: {
			json: jsonPlugin,
			promise: promisePlugin,
			jsdoc: jsdocPlugin,
			examples: getJsdocProcessorPlugin({})
		},
		processor: 'examples/examples',
		rules: {
			"max-len": ["error", { "code": 200 }],
			"line-comment-position": ["error", "above"],
			"indent": ["error", "tab", { "SwitchCase": 1 }],
			"no-trailing-spaces": "error",
			"space-before-blocks": "error",
			"keyword-spacing": "error",
			"arrow-spacing": "error",
			"comma-spacing": "error",
			"quotes": ["error", "single"],
			"semi": ["error", "always"],
			"arrow-parens": ["error", "always"],
			"promise/no-return-wrap": "error",
			"promise/param-names": "error",
			"promise/catch-or-return": "off",
			"promise/no-promise-in-callback": "error",
			"promise/no-new-statics": "error",
			"promise/no-return-in-finally": "error",
			"jsdoc/check-param-names": "error",
			"jsdoc/check-tag-names": "error",
			"jsdoc/check-types": "error",
			"jsdoc/require-param-name": "error",
			"jsdoc/require-param-type": "error",
			"jsdoc/require-param": "warn",
			"jsdoc/require-returns-type": "error",
			"jsdoc/require-returns-check": "error",
			"no-lonely-if": "error",
			"no-console": "off",
			"no-var": "error"
		}
	}
]
