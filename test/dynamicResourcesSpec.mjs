import jasmine from './jasmine';
import { execute, setResource } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;

describe('dynamic resources', () => {
	describe('execute', () => {
		it('must accept dynamic resources', async (done) => {
			await execute({}, true, 'apple', Symbol(), 1, false, null, 5, '#', 2, true);
			done();
		});
		it('must supply a single dynamic resource to a plan', async (done) => {
			await execute({
				execute: (arg) => {
					expect(arg).toBe(true);
				}
			}, true);
			done();
		});
		it('must supply multiple dynamic resources to a plan', async (done) => {
			await execute({
				execute: (arg1, arg2) => {
					expect(arg1).toBe(true);
					expect(arg2).toBe('apple');
				}
			}, true, 'apple');
			done();
		});
		it('must supply a dynamic resource to multiple plans', async (done) => {
			await execute({
				execute: (arg) => {
					expect(arg).toBe(true);
				},
				plans: [
					{
						execute: (arg) => {
							expect(arg).toBe(true);
						}
					},
					{
						execute: (arg) => {
							expect(arg).toBe(true);
						}
					}
				]
			}, true);
			done();
		});
		it('must supply a dynamic resource after a static resource', async (done) => {
			setResource('static', 1);
			await execute({
				include: ['static'],
				execute: (sarg, darg) => {
					expect(sarg).toBe(1);
					expect(darg).toBe(2);
				}
			}, 2);
			done();
		});
	});
});
