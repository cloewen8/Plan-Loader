import eslint from "@eslint/js"
import globals from "globals"
import jsonPlugin from "eslint-plugin-json"
import promisePlugin from "eslint-plugin-promise"
import jsdocPlugin from "eslint-plugin-jsdoc"
import markdownPlugin from "@eslint/markdown"

const exampleRules = {
	"no-unused-labels": "off",
	"semi": "off",
	"no-var": "off"
}

export default [
	{ // shared
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
			jsdoc: jsdocPlugin
		}
	},
	{ // tutorials (markdown)
		files: ["**/*.md"],
		plugins: {
            markdown: markdownPlugin
        },
        language: "markdown/gfm",
		processor: 'markdown/markdown',
		rules: {
			...exampleRules,
		}
	},
	{ // examples
		files: ["examples/**/*.mjs"],
		rules: {
			...exampleRules
		}
	},
	{ // source
		...eslint.configs.recommended,
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
