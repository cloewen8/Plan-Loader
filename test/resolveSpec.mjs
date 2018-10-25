import jasmine from "./jasmine";
import { resolve, expandPath } from "../lib/index.mjs";

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
		expect((await resolve(expandPath(import.meta.url, "externalPlan.mjs"))).external).toBe(true);
	});
	it("must add the mjs extension if an extension is not present", async () => {
		expect((await resolve(expandPath(import.meta.url, "externalPlan"))).external).toBe(true);
	});
	it("throws for invalid plans property", (done) => {
		resolve({ plans: Symbol() }).then(() => done.fail(), () => done());
	});
	it("throws for invalid execute property", (done) => {
		resolve({ execute: Symbol() }).then(() => done.fail(), () => done());
	});
	it("throws for invalid serial property", (done) => {
		resolve({ serial: Symbol() }).then(() => done.fail(), () => done());
	});
});
