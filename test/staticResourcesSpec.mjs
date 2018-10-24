import jasmine from "./jasmine";
import { setResource, execute } from "../lib/index.mjs";

const { describe, it, pending } = jasmine.env;

describe("static resources", () => {
	describe("setResource", () => {
		it("sets a resource", () => {
			pending("unfinished test");
		});
	});
	it("does not include inexistant resources", () => {
		pending("unfinished test");
	});
	it("includes a single resource", () => {
		pending("unfinished test");
	});
	it("includes multiple resources", () => {
		pending("unfinished test");
	});
	it("includes changed resources", () => {
		pending("unfinished test");
	})
});
