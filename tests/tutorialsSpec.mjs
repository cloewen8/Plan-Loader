import jasmine from './jasmine';
import { readdirSync, writeSync, createReadStream } from 'fs';
import { createInterface as createLineReader } from 'readline';
import tmp from 'tmp';
import { exec } from 'child_process';
import ESLint from 'eslint';

/**
 * @typedef {object} Example
 * @property {string} name A name to identify the example.
 * @property {string} code The code portion.
 * @property {string} output The expected output.
 * @ignore
 */

/**
 * @typedef {object} Tutorial
 * @property {string} name The name of the tutorial file.
 * @property {Example[]} examples All examples.
 * @ignore
 */

/**
 * A list of tutorials to test.
 * @type {Tutorial[]}
 * @ignore
 */
let tutorials = [];

const tmpFile = tmp.fileSync;
const { describe, it, beforeAll, beforeEach, afterEach, expect, fail } = jasmine.env;
const { Linter } = ESLint;

const TUTORIALS = `${process.cwd()}/tutorials/`;
/**
 * Matches an md file name (with only numbers and letters).
 * @ignore
 */
const FILE_NAME = /([a-zA-Z0-9]+?)\.md$/;

/** @todo Collect examples without output. */
export async function setup() {
	for (let file of readdirSync(TUTORIALS)) {
		if (file.endsWith('.md')) {
			/** @type {Tutorial} */
			let tutorial = {
				name: file.match(FILE_NAME)[1],
				examples: []
			};
			let collecting = [false, false];
			/** @type {Example} */
			let example = {};
			for await (let line of createLineReader(createReadStream(TUTORIALS + file))) {
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
						example.name = `Example ${tutorial.examples.length + 1}`;
						tutorial.examples.push(example);
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
			tutorials.push(tutorial);
		}
	}
}

export function define() {
	describe('tutorials', () => {
		let linter;
		beforeAll(() => {
			linter = new Linter();
		});

		for (let tutorial of tutorials) {
			describe(`${tutorial.name} File`, () => {
				for (let example of tutorial.examples) {
					describe(example.name, () => {
						let file;
						beforeEach(() => {
							file = tmpFile({ dir: process.cwd(), prefix: 'test-', postfix: '.mjs' });
							writeSync(file.fd, example.code);
						});

						it('is linted', () => {
							let status = linter.verifyAndFix(example.code, null, {
								filename: example.name
							});
							let errs = [];
							if (!status.fixed)
								for (let err of status.messages)
									if (err.fatal)
										errs.push(`${err.line}:${err.column}  ${err.severity === 1 ? 'warning' : 'error'}  ${err.message}  ${err.ruleId}`);
							if (errs.length > 0)
								fail(errs.join('\n'));
						});

						it('does not throw', (done) => {
							let child = exec(`node --experimental-modules ${file.name}`);
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

						it('outputs the expected result', (done) => {
							let child = exec(`node --experimental-modules ${file.name}`);
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
							file.removeCallback();
						});
					});
				}
			});
		}
	});
}

