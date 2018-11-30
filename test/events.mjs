import jasmine from './jasmine';
import { execute, setResource } from '../lib/index.mjs';
import { connectEvent } from '../lib/events';

const { describe, it, expect } = jasmine.env;

describe('events', () => {
	describe('connectEvent', () => {
		it('calls an emitter\'s once function', (done) => {
			connectEvent({
				event: 'name',
				emitter: { on: () => {
					done.fail();
				}, once: (eventName) => {
					expect(eventName).toBe('name');
					done();
				} }
			});
		});
		it('calls an emitter\'s on function', (done) => {
			connectEvent({
				event: 'name',
				repeats: true,
				emitter: { on: (eventName) => {
					expect(eventName).toBe('name');
					done();
				}, once: () => {
					done.fail();
				} }
			});
		});
		it('allows emitters to execute a plan', (done) => {
			let isDone = false;
			connectEvent({
				event: 'name',
				emitter: {
					once: async (_, action) => {
						await action();
						if (!isDone)
							done.fail();
					}
				},
				plans: [
					{
						execute: () => {
							isDone = true;
							done();
						}
					}
				]
			});
		});
		it('connects to a static emitter', (done) => {
			let isDone = false;
			setResource('staticEmitter', {
				once: async (_, action) => {
					await action();
					if (!isDone)
						done.fail();
				}
			});
			connectEvent({
				event: 'name',
				emitter: 'staticEmitter',
				plans: [
					{
						execute: () => {
							isDone = true;
							done();
						}
					}
				]
			});
		});
		it('allows emitters to pass arguments to a plan', (done) => {
			let isDone = false;
			connectEvent({
				event: 'name',
				emitter: {
					once: async (_, action) => {
						await action('apple');
						if (!isDone)
							done.fail();
					}
				},
				plans: [
					{
						execute: (value) => {
							expect(value).toBe('apple');
							isDone = true;
							done();
						}
					}
				]
			});
		});
	});
	describe('execute', () => {
		it('connects the event once.', (done) => {
			execute({
				event: 'name',
				emitter: { on: () => {
					done.fail();
				}, once: (eventName) => {
					expect(eventName).toBe('name');
					done();
				} },
				plans: []
			});
		});
		it('connects the event on.', (done) => {
			execute({
				event: 'name',
				repeats: true,
				emitter: { on: (eventName) => {
					expect(eventName).toBe('name');
					done();
				}, once: () => {
					done.fail();
				} },
				plans: []
			});
		});
	});
});
