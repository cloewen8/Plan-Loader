import jasmine from "./jasmine";
import { execute, handleError } from "../lib/index.mjs";
import { EventEmitter } from "events";

const { describe, it } = jasmine.env;

describe("error handling", () => {
	describe("handleError", () => {
		it("does not throw handled errors", (done) => {
			handleError({ handleError: () => {} }, new Error())
				.then(done, done.fail);
		});
		it("throws unhandled errors", (done) => {
			handleError({ handleError: (err) => {
				throw err;
			} }, new Error())
				.then(done.fail, () => done());
		});
	});
	describe("execute", () => {
		it("handles a plan's errors", (done) => {
			let isDone = false;
			execute({
				execute: () => { throw new Error(); },
				handleError: () => {
					isDone = true;
					done();
				}
			}).then(() => {
				if (!isDone)
					done.fail();
			});
		});
		it("handles associated plan errors", (done) => {
			let isDone = false;
			execute({
				plans: [
					{ execute: () => { throw new Error(); } }
				],
				handleError: () => {
					isDone = true;
					done();
				}
			}).catch(() => {
				if (!isDone)
					done.fail();
			});
		});
		it("handles event errors", (done) => {
			const emitter = new EventEmitter();
			execute({
				event: "name",
				emitter: emitter,
				mode: "Serial",
				plans: [
					{ execute: () => { throw new Error(); } },
					{ execute: () => { done.fail(); } }
				],
				handleError: () => {
					done();
				}
			}).then(() => emitter.emit("name"));
		});
	});
});
