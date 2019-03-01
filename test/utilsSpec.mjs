import jasmine from './jasmine';
import { filterPlans } from '../lib/index.mjs';
import { throwError } from '../lib/util.mjs';

const { describe, it, expect } = jasmine.env;

describe('utility', () => {
	describe('filterPlans', () => {
		it('throws for missing plans', (done) => {
			try {
				filterPlans({ meta: [] }, () => true).next();
				done.fail();
			} catch {
				done();
			}
		});
		it('throws for missing meta data', (done) => {
			try {
				filterPlans({ plans: [] }, () => true).next();
				done.fail();
			} catch {
				done();
			}
		});
		it('calls the predicate function', (done) => {
			let isDone = false;
			filterPlans({ plans: [{ execute: () => {} }], meta: [{  }] }, () => {
				done();
				isDone = true;
				return true;
			}).next();
			if (!isDone)
				done.fail();
		});
		it('returns a plan if the predicate passes', () => {
			const plan = { execute: () => {} };
			expect(filterPlans({ plans: [plan], meta: [{  }] }, () => true ).next().value)
				.toBe(plan);
		});
		it('does not return a plan if the predicate fails', () => {
			expect(filterPlans({ plans: [
				{ execute: () => {} }
			], meta: [{  }] }, () => false ).next().value == null)
				.toBe(true);
		});
	});
	describe('throwError', () => {
		it('throws an error with the expected message and code', () => {
			try {
				throwError('some message', 'some code');
			} catch (err) {
				expect(err.message).toBe('some message');
				expect(err.code).toBe('some code');
			}
		});
		it('does not include the throwError function in its stacktrace', () => {
			try {
				throwError('some message', 'some code');
			} catch (err) {
				expect(err.stack).not.toContain('throwError');
			}
		});
	});
});
