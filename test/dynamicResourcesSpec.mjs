import jasmine, { getRandInt, getRandString } from './jasmine';
import { execute, setResource } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;

describe('dynamic resources', () => {
	describe('execute', () => {
		it('must accept dynamic resources', async (done) => {
			await execute({},
				Math.random() > 0.5,
				getRandString(2, 10, 'az'),
				Symbol(),
				getRandInt(),
				Math.random() > 0.5,
				null,
				getRandInt(),
				getRandString(),
				getRandInt(),
				Math.random() > 0.5);
			done();
		});
		it('must supply a single dynamic resource to a plan', async (done) => {
			let value = Symbol();
			await execute({
				execute: (arg) => {
					expect(arg).toBe(value);
				}
			}, value);
			done();
		});
		it('must supply multiple dynamic resources to a plan', async (done) => {
			let value1 = Symbol();
			let value2 = Symbol();
			await execute({
				execute: (arg1, arg2) => {
					expect(arg1).toBe(value1);
					expect(arg2).toBe(value2);
				}
			}, value1, value2);
			done();
		});
		it('must supply a dynamic resource to multiple plans', async (done) => {
			let value = Symbol();
			await execute({
				execute: (arg) => {
					expect(arg).toBe(value);
				},
				plans: [
					{
						execute: (arg) => {
							expect(arg).toBe(value);
						}
					},
					{
						execute: (arg) => {
							expect(arg).toBe(value);
						}
					}
				]
			}, value);
			done();
		});
		it('must supply a dynamic resource after a static resource', async (done) => {
			let st = Symbol();
			let dy = Symbol();
			setResource('static', st);
			await execute({
				include: ['static'],
				execute: (sarg, darg) => {
					expect(sarg).toBe(st);
					expect(darg).toBe(dy);
				}
			}, dy);
			done();
		});
	});
});
