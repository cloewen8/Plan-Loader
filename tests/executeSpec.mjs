import jasmine from './jasmine.mjs';
import { promisify } from 'util';
import { execute, mode } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;
const nextTick = promisify(process.nextTick);

describe('execute', () => {
	it('should do nothing for empty plans', (done) => {
		execute({}).then(done, done.fail);
	});
	it('must execute and await the plan', (done) => {
		let running = true;
		execute({ execute: () => {
			return Promise.resolve().then(() => running = false);
		} }).then(() => {
			expect(running).toBe(false);
			done();
		});
		expect(running).toBe(true);
	});
	it('must execute plans serially', (done) => {
		let running = 0;
		const plan = {
			mode: 'Serial',
			plans: []
		};
		for (let index = 0; index < 2; index++)
			plan.plans[index] = { execute: async () => {
				expect(running).toBe(0);
				running++;
				await nextTick();
				expect(running).toBe(1);
				running--;
			} };
		execute(plan).then(() => done(), (err) => done.fail(err));
	});
	it('must execute plans in parallel', (done) => {
		let running = 0;
		let surpassedQuota = false;
		const plan = {
			mode: 'Parallel',
			plans: []
		};
		for (let index = 0; index < 2; index++)
			plan.plans[index] = { execute: async () => {
				running++;
				expect(running).toBeGreaterThan(0);
				if (running > 1)
					surpassedQuota = true;
				await nextTick();
				running--;
			} };
		execute(plan).then(() => {
			expect(surpassedQuota).toBe(true);
			done();
		}, (err) => done.fail(err));
	});
	it('must execute the plan first then associated plans', (done) => {
		let executeRan = false;
		execute({ execute: () => {
			executeRan = true;
		}, plans: [ () => {
			if (!executeRan)
				done.fail();
			else
				done();
		} ] }).then(() => done(), (err) => done.fail(err));
	});
	describe('mode', () => {
		it('must be case-insensitive', () => {
			expect(mode.Serial.is('serial')).toBe(true);
			expect(mode.Serial.is('Serial')).toBe(true);
		});
	});
});
