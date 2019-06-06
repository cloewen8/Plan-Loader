import jasmine, { getRandString } from './jasmine.mjs';
import { execute, setResource } from '../lib/index.mjs';
import { connectEvent } from '../lib/events.mjs';

const { describe, it, expect } = jasmine.env;

describe('events', () => {
	describe('connectEvent', () => {
		it('calls an emitter\'s once function', (done) => {
			let eventName = getRandString(1, 5);
			connectEvent({
				event: eventName,
				emitter: { on: () => {
					done.fail();
				}, once: (eventName) => {
					expect(eventName).toBe(eventName);
					done();
				} }
			});
		});
		it('calls an emitter\'s on function', (done) => {
			let eventName = getRandString(1, 5);
			connectEvent({
				event: eventName,
				repeats: true,
				emitter: { on: (eventName) => {
					expect(eventName).toBe(eventName);
					done();
				}, once: () => {
					done.fail();
				} }
			});
		});
		it('allows emitters to execute a plan', (done) => {
			let isDone = false;
			connectEvent({
				event: 'event',
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
				event: 'event',
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
			let value = getRandString(2, 10);
			connectEvent({
				event: 'event',
				emitter: {
					once: async (_, action) => {
						await action(value);
						if (!isDone)
							done.fail();
					}
				},
				plans: [
					{
						execute: (value) => {
							expect(value).toBe(value);
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
			let eventName = getRandString(1, 5);
			execute({
				event: eventName,
				emitter: { on: () => {
					done.fail();
				}, once: (eventName) => {
					expect(eventName).toBe(eventName);
					done();
				} },
				plans: []
			});
		});
		it('connects the event on.', (done) => {
			let eventName = getRandString(1, 5);
			execute({
				event: eventName,
				repeats: true,
				emitter: { on: (eventName) => {
					expect(eventName).toBe(eventName);
					done();
				}, once: () => {
					done.fail();
				} },
				plans: []
			});
		});
	});
});
