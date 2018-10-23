import jasmine from "./jasmine";
import { execute } from "../lib/index.mjs";

const { describe, it, expect } = jasmine.env;

describe("execute", () => {
	it("should do nothing for empty plans", (done) => {
		execute({}).then(done, done.fail);
	});
	it("must execute and await the plan", (done) => {
		let running = true;
		execute({ execute: () => {
			return Promise.resolve().then(() => running = false);
		} }).then(() => {
			expect(running).toBe(false);
			done();
		});
		expect(running).toBe(true);
	});
	it("must execute plans serially", () => {
		pending("unfinished test");
	});
	it("must execute plans in parallel", () => {
		pending("unfinished test");
	});
	it("must execute the plan first then associated plans", () => {
		pending("unfinished test");
	});
});
