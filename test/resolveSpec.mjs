import jasmine from "./jasmine";
import { resolve } from "../lib/index.mjs";

const { describe, it, expect } = jasmine.env;

describe("resolve", () => {
	it("does not mutate valid plans", async () => {
		let plan = { execute: () => {}, plans: [] };
		expect(await resolve(plan)).toBe(plan);
	});
	it("does not resolve builtin modules", async (done) => {
		resolve("path").then(() => done.fail(), () => done());
	});
	it("imports external plans", async () => {
		expect((await resolve("./externalPlan.mjs")).external).toBe(true);
	});
	it("must add the mjs extension if an extension is not present", async () => {
		expect((await resolve("./externalPlan")).external).toBe(true);
	});
	it("throws for invalid plans", (done) => {
		resolve({ plans: Symbol() }).then(() => done.fail(), () => done());
	});
	it("throws for invalid actions", (done) => {
		resolve({ execute: Symbol() }).then(() => done.fail(), () => done());
	});
});
