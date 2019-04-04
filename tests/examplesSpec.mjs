import jasmine, { addExtraReport } from './jasmine';
import { readdirSync, writeSync, chmodSync, constants as FS_MODES, createReadStream } from 'fs';
import { join as joinPath } from 'path';
import { createInterface as createLineReader } from 'readline';
import tmp from 'tmp';
import { exec } from 'child_process';
import ESLint from 'eslint';

const tmpFile = tmp.fileSync;
const { describe, it, beforeAll, afterAll, expect, fail, xit } = jasmine.env;
const { CLIEngine } = ESLint;

let lintCLI = new CLIEngine();
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
 * @typedef {object} File
 * @property {string} name The name of the file.
 * @property {string} path A full path to the file.
 * @property {Example[]} examples All examples.
 * @ignore
 */

/**
 * @typedef {object} Example
 * @property {string} name A name to identify the example.
 * @property {string} code The code portion.
 * @property {number} codeOffset The line that the code starts on.
 * @property {?string} output The expected output.
 * @property {?object} metadata 
 * @todo Add a line offset for linting results.
 * @ignore
 */

/**
 * A list of files to test.
 * @type {File[]}
 * @ignore
 */
let files = [];

/**
 * Matches an md file name (with only numbers and letters).
 * @ignore
 */
const FILE_NAME = /([a-zA-Z0-9]+?)\.md$/;
const METADATA = /<!--(.+)-->/;

/**
 * A generator that iterates through each line of a stream.
 *
 * If next returns `true`, the previous line will be yielded.
 *
 * @param {ReadStream} stream
 * @ignore
 */
async function* genLines(stream) {
	let getLast;
	let num = 0;
	let lastLine = '';
	for await (let line of createLineReader(stream)) {
		getLast = yield { line: line, num: ++num };
		if (getLast)
			yield lastLine;
		lastLine = line;
	}
}

async function getOutput(iter) {

}

/**
 * Gets an example.
 *
 * @param {string} name A name for the example.
 * @param {number} lineNumber The offset of the iterator.
 * @param {AsyncIterableIterator<string>} iter The iterator.
 * @ignore
 */
async function getExample(name, lineNumber, iter) {
	let example = { name: name, code: [], codeOffset: lineNumber, output: null, metadata: {} };
	let line;
	let end;

	let metadata = await iter.next(true);
	try {
		metadata = METADATA.exec(metadata.value);
		if (metadata != null)
			example.metadata = JSON.parse(metadata[1]);
	} catch (err) {
		console.warn('Ignoring invalid example metadata!');
		console.warn(err.stack);
	}

	do {
		line = await iter.next();
		if (line.done)
			throw new Error('Unable to locate the end of example!');
		end = line.value.line.endsWith('```');
		if (!end) {
			example.code.push(line.value.line);
		} else {
			// Collect output.
			try {
				line = await iter.next();
				//if (!line.done && line.value.line.startsWith('```text'))
				//	example.output = getOutput(iter);
			// eslint-disable-next-line no-empty
			} catch (err) {
				console.warn('Unable to get example output!');
				console.warn(err.stack);
			}
		}
	} while (!end);
	example.code = example.code.join('\n');
	return example;
}

/**
 * Gets all examples from markdown.
 *
 * @param {ReadStream} stream The stream containing markdown source.
 * @returns {File}
 * @ignore
 */
async function getExamples(stream) {
	let iter = genLines(stream);
	let examples = [];
	for await (let { line, num } of iter) {
		if (line.startsWith('```js')) {
			try {
				examples.push(await getExample(`Example ${examples.length + 1}`, num, iter));
			} catch (err) {
				console.warn('Ignoring invalid examples file.');
				console.warn(err.stack);
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
	for (let filename of readdirSync(folder)) {
		if (filename.endsWith('.md')) {
			files.push({
				name: filename.match(FILE_NAME)[1],
				path: joinPath(folder, filename),
				examples: await getExamples(createReadStream(folder + filename))
			});
		}
	}
	if (!reportingLint) {
		reportingLint = true;
		addExtraReport(() => {
			if (lintResults.length > 0) {
				console.log('Linting failed!');
				console.log(lintCLI.getFormatter()(lintResults));
			}
		});
	}
}

export function define() {
	describe('documentation', () => {
		beforeAll(async (done) => {
			lintResults = [];
			let fullName;
			for (let name of (await import('../.eslintrc.json')).default.plugins) {
				fullName = 'eslint-plugin-' + name;
				lintCLI.addPlugin(fullName, (await import(fullName)).default);
			}
			done();
		});

		for (let file of files) {
			describe(`${file.name} file`, () => {
				for (let example of file.examples) {
					describe(example.name, () => {
						let tmp;
						beforeAll(() => {
							tmp = tmpFile({ dir: process.cwd(), prefix: 'test-', postfix: '.mjs' });
							writeSync(tmp.fd, `// ${file.path}: ${example.name}\n\n${example.code}`);
							if (FS_MODES.S_IRUSR !== undefined) {
								// Prevent tests from modifying the file.
								chmodSync(joinPath(process.cwd(), tmp.name),
									FS_MODES.S_IRUSR);
							}
						});

						it('is linted', () => {
							let output = lintCLI.executeOnText(example.code, file.path);
							if (output.errorCount > 0) {
								for (let result of output.results) {
									// Include the example number for more context.
									result.filePath = `${file.path}: ${example.name}`;
									result.messages = result.messages.map((message) => {
										message.line = message.line + example.codeOffset;
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

						afterAll(() => {
							tmp.removeCallback();
						});
					});
				}
			});
		}
	});
}

