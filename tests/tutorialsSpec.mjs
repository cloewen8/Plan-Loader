import jasmine from './jasmine';
import { readdirSync, writeSync, createReadStream } from 'fs';
import { createInterface as createLineReader } from 'readline';
import tmp from 'tmp';
import { exec } from 'child_process';
let tutorials = [];

const tmpFile = tmp.fileSync;
const { describe, it, xit } = jasmine.env;

const TUTORIALS = `${process.cwd()}/tutorials/`;
/**
 * Matches an md file name (with only numbers and letters).
 * @ignore
 */
const FILE_NAME = /([a-zA-Z0-9]+?)\.md$/;

export async function setup() {
	for (let file of readdirSync(TUTORIALS)) {
		if (file.endsWith('.md')) {
			let tutorial = {
				name: file.match(FILE_NAME)[1],
				examples: []
			};
			let collecting = [false, false];
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
						// Test the example.
						example.name = `Example ${tutorial.examples.length}`;
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
		for (let tutorial of tutorials) {
			describe(`${tutorial.name} File`, () => {
				for (let example of tutorial.examples) {
					describe(example.name, () => {
						it('does not throw', (done) => {
							let file = tmpFile({ postfix: '.mjs' });
							writeSync(file.fd, example.code);
							let child = exec(`node --experimental-modules ${file.name}`);
							child.on('close', () => {
								file.removeCallback();
								done();
							});
							child.stderr.on('data', (err) => {
								if (!err.includes('ExperimentalWarning')) {
									child.stderr.removeAllListeners('data');
									file.removeCallback();
									done.fail(err);
								}
							});
						});

						xit('outputs the expected result');
					});
				}
			});
		}
	});
}

