import jasmine, { addExtraReport } from './jasmine.mjs';
import { readdirSync, writeSync, chmodSync, constants as FS_MODES } from 'fs';
import { join as joinPath } from 'path';
import codeBlocks from 'code-blocks';
import tmp from 'tmp';
import { exec, execSync } from 'child_process';
import ESLintModule from 'eslint';

const tmpFile = tmp.fileSync;
const { describe, it, beforeAll, afterAll, expect, fail } = jasmine.env;
const { ESLint } = ESLintModule;

let esLint = new ESLint();
/**
 * If lint results are being reported.
 *
 * @ignore
 */
let reportingLint = false;
/**
 * Results from linting tests.
 *
 * @ignore
 */
let lintResults;

/**
 * @typedef {object} MarkdownFile
 * @property {string} name The name of the file.
 * @property {string} path A full path to the file.
 * @property {Example[]} examples All examples.
 * @ignore
 */

/**
 * @typedef {object} Example
 * @property {string} name A name to identify the example.
 * @property {string} code The code portion.
 * @property {number} codeStart The line that the code starts on.
 * @property {string} output The expected output.
 * @todo Add a line offset for linting results.
 * @ignore
 */

/**
 * A list of files to test.
 *
 * @type {MarkdownFile[]}
 * @ignore
 */
let files = [];

/**
 * Matches an md file name (with only numbers and letters).
 *
 * @ignore
 */
const FILE_NAME = /([a-zA-Z0-9]+?)\.md$/;

/**
 * Gets all examples from markdown.
 *
 * @param {string} file The file containing the markdown.
 * @returns {Example[]}
 * @ignore
 */
async function getExamples(file) {
	let examples = [];
	let example = null;
	let codeEnd;
	// Each code block is only considered an example if:
	// - It is javascript.
	// - There is no `ignore=true` info string.
	//   Example:
	//   ```js ignore=true
	//   ```
	// - Is immediately followed by a text code block.
	// - And both code blocks are at the start of the line.
	const blocks = await codeBlocks.fromFile(file);
	for (let { value, lang, position, source, info } of blocks) {
		if (position.start.column === 1) {
			// Get example code (start the object)
			if (lang === 'js' && info.ignore !== 'true') {
				example = {
					name: 'Example ' + (examples.length + 1),
					code: value,
					codeStart: source.line,
					output: null
				};
				codeEnd = position.end.line;
			// Get example output (finish object and push)
			} else if (example !== null) {
				// Only add it if it is valid
				if (lang === 'text' && position.start.line === codeEnd + 1) {
					example.output = value;
					examples.push(example);
				}
				example = null;
			}
		}
	}
	return examples;
}

/**
 * Gathers examples from files.
 *
 * @param {string} folder The path to files containing examples.
 * @todo Collect examples without output.
 * @ignore
 */
export async function gather(folder) {
	let path;

	for (let filename of readdirSync(folder)) {
		if (filename.endsWith('.md')) {
			path = joinPath(folder, filename);
			files.push({
				name: filename.match(FILE_NAME)[1],
				path: path,
				examples: await getExamples(folder + filename, path)
			});
		}
	}
	if (!reportingLint) {
		reportingLint = true;
		const formatter = await esLint.loadFormatter();
		addExtraReport(() => {
			if (lintResults.length > 0) {
				console.log('Linting failed!');
				console.log(formatter.format(lintResults));
			}
		});
	}
}

export function define() {
	describe('documentation', () => {
		beforeAll(() => lintResults = []);

		for (let file of files) {
			describe(`${file.name} file`, () => {
				for (let example of file.examples) {
					describe(example.name, () => {
						let tmp;
						beforeAll(() => {
							tmp = tmpFile({ dir: process.cwd(), prefix: 'test-', postfix: '.mjs' });
							// Append the file path and example name.
							let code = `// ${file.path}: ${example.name}\n\n`;
							if (!/import.+from\s*['"]plan-loader['"]/.test(example.code)) {
								// Append the plan-loader.
								code += '// eslint-disable-next-line no-unused-vars\n';
								// eslint-disable-next-line quotes
								code += "import { expandPath, filterPlans, handleError, resolve, execute, executePlans, mode, setResource } from 'plan-loader'\n\n"
							}
							// Append the example code.
							code += example.code;
							// Write the file.
							writeSync(tmp.fd, code);
							if (FS_MODES.S_IRUSR !== undefined) {
								// Prevent tests from modifying the file.
								chmodSync(joinPath(process.cwd(), tmp.name),
									FS_MODES.S_IRUSR);
							}
						});

						it('is linted', () => {
							let output = esLint.lintFiles(tmp.name);
							if (output.errorCount > 0) {
								for (let result of output.results) {
									// Include the example number for more context.
									result.filePath = `${file.path}: ${example.name}`;
									result.messages = result.messages.map((message) => {
										message.line = message.line + example.codeStart;
										// Not sure if I can exclude this.
										message.fix = null;
										return message;
									});
									result.fixableErrorCount = 0;
									result.fixableWarningCount = 0;
									lintResults.push(result);
								}
								fail();
							}
						});

						it('does not throw', (done) => {
							let child = exec(`node --experimental-modules ${tmp.name}`);
							child.on('close', () => {
								done();
							});
							child.stderr.on('data', (err) => {
								if (!err.includes('ExperimentalWarning')) {
									child.stderr.removeAllListeners('data');
									done.fail(err);
								}
							});
						});

						if (example.output != null) {
							it('outputs the expected result', (done) => {
								let result = execSync(`node --experimental-modules --no-warnings ${tmp.name}`);
								if (result instanceof Buffer)
									result = result.toString('utf8');
								result = result.trim();
								expect(result).toBe(example.output);
								done();
							});
						}

						afterAll(() => tmp.removeCallback());
					});
				}
			});
		}
	});
}

