import jasmine, { addExtraReport } from './jasmine';
import { readdirSync, writeSync, createReadStream } from 'fs';
import { createInterface as createLineReader } from 'readline';
import tmp from 'tmp';
import { exec } from 'child_process';
import ESLint from 'eslint';

/**
 * If lint results are being reported.
 * @ignore
 */
let reportingLint = false;
/**
 * Results from linting tests.
 * @ignore
 */
let lintResults;

/**
 * @typedef {object} Example
 * @property {string} name A name to identify the example.
 * @property {string} code The code portion.
 * @property {string} output The expected output.
 * @todo Add a line offset for linting results.
 * @ignore
 */

/**
 * @typedef {object} File
 * @property {string} name The name of the file.
 * @property {string} path A full path to the file.
 * @property {Example[]} examples All examples.
 * @ignore
 */

/**
 * A list of files to test.
 * @type {File[]}
 * @ignore
 */
let files = [];

const tmpFile = tmp.fileSync;
const { describe, it, beforeAll, beforeEach, afterEach, expect, fail, xit } = jasmine.env;
const { Linter, CLIEngine } = ESLint;

/**
 * Matches an md file name (with only numbers and letters).
 * @ignore
 */
const FILE_NAME = /([a-zA-Z0-9]+?)\.md$/;

/**
 * Gathers examples from files.
 *
 * @param {string} folder The path to files containing examples.
 * @todo Collect examples without output.
 * @ignore
 */
export async function gather(folder) {
	for (let filename of readdirSync(folder)) {
		if (filename.endsWith('.md')) {
			/** @type {Tutorial} */
			let file = {
				name: filename.match(FILE_NAME)[1],
				path: `${folder}/${filename}`,
				examples: []
			};
			let collecting = [false, false];
			/** @type {Example} */
			let example = {};
			for await (let line of createLineReader(createReadStream(folder + filename))) {
				// Collect code.
				if (collecting[0]) {
					if (line.endsWith('```')) {
						collecting[0] = false;
					} else {
						example.code += line + '\n';
					}
				// Collect output.
				} else if (collecting[1]) {
					if (line.endsWith('```')) {
						collecting[1] = false;
						// Store the example.
						example.output = example.output.substring(0, example.output.length - 1);
						example.name = `Example ${file.examples.length + 1}`;
						file.examples.push(example);
						example = {};
					} else {
						example.output += line + '\n';
					}
				// Start collecting code.
				} else if (line.startsWith('```js')) {
					collecting[0] = true;
					example.code = '';
				// Start collecting output (if code was collected).
				} else if (example.code !== undefined && !collecting[0] && line.startsWith('```text')) {
					collecting[1] = true;
					example.output = '';
				}
			}
			files.push(file);
		}
	}
	if (!reportingLint) {
		reportingLint = true;
		addExtraReport(() => {
			if (lintResults.length > 0) {
				console.log('Linting failed!');
				console.log(new CLIEngine().getFormatter()(lintResults));
			}
		});
	}
}

export function define() {
	describe('documentation', () => {
		let linter;
		beforeAll(() => {
			linter = new Linter();
			lintResults = [];
		});

		for (let file of files) {
			describe(`${file.name} File`, () => {
				for (let example of file.examples) {
					describe(example.name, () => {
						let tmp;
						beforeEach(() => {
							tmp = tmpFile({ dir: process.cwd(), prefix: 'test-', postfix: '.mjs' });
							writeSync(tmp.fd, example.code);
						});

						it('is linted', () => {
							let status = linter.verify(example.code, null, {
								filename: `${file.name}.${example.name}`
							});
							if (status.some((result) => result.severity == 2)) {
								let errors = status.filter((result) => result.severity == 2);
								let warnings = status.filter((result) => result.severity == 1);
								lintResults.push({
									filePath: `${file.path}: ${example.name}`,
									messages: status,
									errorCount: errors.length,
									warningCount: warnings.length,
									fixableErrorCount: errors.filter((value) => value.fix != null),
									fixableWarningCount: warnings.filter((value) => value.fix != null)
								});
								fail();
							}
						});

						xit('does not throw', (done) => {
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

						xit('outputs the expected result', (done) => {
							let child = exec(`node --experimental-modules ${tmp.name}`);
							let result = '';
							child.on('close', () => {
								expect(result).toBe(example.output);
								done();
							});
							child.stdout.on('data', (line) => {
								result += line + '\n';
							});
						});

						afterEach(() => {
							tmp.removeCallback();
						});
					});
				}
			});
		}
	});
}

