import jasmine, { getRandInt, getRandString } from './jasmine.mjs';
import { setResource, execute } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;

describe('static resources', () => {
	describe('setResource', () => {
		it('sets a resource', () => {
			setResource(getRandString(1, 10), true);
		});
	});
	it('does not include inexistant resources', async (done) => {
		await execute({
			include: [getRandString(1, 10)],
			execute: (inexistant) => {
				expect(inexistant).toBe(undefined);
			}
		});
		done();
	});
	it('includes a single resource', async (done) => {

		setResource('one', 1);
		setResource('two', 2);
		await execute({
			include: ['one'],
			execute: (one, two) => {
				expect(one).toBe(1);
				expect(two).toBe(undefined);
			}
		});
		done();
	});
	it('includes multiple resources', async (done) => {
		let one = getRandInt();
		let two;
		do {
			two = getRandInt();
		} while (two === one);
		setResource('one', one);
		setResource('two', two);
		await execute({
			include: ['one', 'two'],
			execute: (one, two) => {
				expect(one).toBe(one);
				expect(two).toBe(two);
			}
		});
		done();
	});
	it('includes changed resources', async (done) => {
		let one = getRandInt();
		let two;
		let three;
		do {
			two = getRandInt();
		} while (two === one);
		do {
			three = getRandInt();
		} while (three === two || three === one);
		setResource('one', one);
		setResource('two', two);
		setResource('two', three);
		await execute({
			include: ['one', 'two'],
			execute: (one, two) => {
				expect(one).toBe(one);
				expect(two).toBe(three);
			}
		});
		done();
	});
});
