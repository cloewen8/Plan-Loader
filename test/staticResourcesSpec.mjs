import jasmine from './jasmine';
import { setResource, execute } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;

describe('static resources', () => {
	describe('setResource', () => {
		it('sets a resource', () => {
			setResource('setTest', true);
		});
	});
	it('does not include inexistant resources', async (done) => {
		await execute({
			include: ['inexistant'],
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
		setResource('one', 1);
		setResource('two', 2);
		await execute({
			include: ['one', 'two'],
			execute: (one, two) => {
				expect(one).toBe(1);
				expect(two).toBe(2);
			}
		});
		done();
	});
	it('includes changed resources', async (done) => {
		setResource('one', 1);
		setResource('two', 2);
		setResource('two', 3);
		await execute({
			include: ['one', 'two'],
			execute: (one, two) => {
				expect(one).toBe(1);
				expect(two).toBe(3);
			}
		});
		done();
	});
});
