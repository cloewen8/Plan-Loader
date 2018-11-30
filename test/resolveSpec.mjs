import jasmine from './jasmine';
import { resolve, expandPath, setResource } from '../lib/index.mjs';

const { describe, it, expect } = jasmine.env;

describe('resolve', () => {
	it('does not mutate valid plans', async () => {
		let plan = { execute: () => {}, plans: [] };
		expect(await resolve(plan)).toBe(plan);
	});
	it('does not resolve builtin modules', async (done) => {
		resolve('path').then(() => done.fail(), () => done());
	});
	it('imports external plans', async () => {
		expect((await resolve(expandPath(import.meta.url, 'externalPlan.mjs'))).external).toBe(true);
	});
	it('must add the mjs extension if an extension is not present', async () => {
		expect((await resolve(expandPath(import.meta.url, 'externalPlan'))).external).toBe(true);
	});
	it('throws for invalid plans property', (done) => {
		resolve({ plans: Symbol() }).then(() => done.fail(), () => done());
	});
	it('throws for invalid execute property', (done) => {
		resolve({ execute: Symbol() }).then(() => done.fail(), () => done());
	});
	it('throws for invalid mode property', (done) => {
		resolve({ mode: Symbol() }).then(() => done.fail(), () => done());
	});
	it('throws for an invalid handleError function', (done) => {
		resolve({ handleError: Symbol() }).then(() => done.fail(), () => done());
	});
	it('throws for an invalid event property', (done) => {
		resolve({ event: Symbol(), plans: [] }).then(() => done.fail(), () => done());
	});
	it('throws for an invalid repeats property', (done) => {
		resolve({ event: 'event', plans: [], repeats: Symbol() }).then(() => done.fail(), () => done());
	});
	it('throws for an inexistant static emitter', (done) => {
		resolve({ event: 'event', plans: [], emitter: 'inexistant' }).then(() => done.fail(), () => done());
	});
	it('throws for an invalid static emitter', (done) => {
		setResource('staticEmitter', Symbol());
		resolve({ event: 'event', plans: [], emitter: 'staticEmitter' }).then(() => done.fail(), () => done());
	});
	it('throws for an emitter without a once function', (done) => {
		resolve({ event: 'event', plans: [], emitter: { on: () => {} } }).then(() => done.fail(), () => done());
	});
	it('throws for an emitter without an on function (when repeats is true)', (done) => {
		resolve({ event: 'event', plans: [], repeats: true, emitter: { once: () => {} } }).then(() => done.fail(), () => done());
	});
	it('throws for a plan with an event and no associated plans', (done) => {
		resolve({ event: 'event' }).then(() => done.fail(), () => done());
	});
});
