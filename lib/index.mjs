import { dirname, join } from "path";
import { builtinModules } from "module";

const res = {};

export function expandPath(base, path) {
	return join(base, dirname(path));
}

export async function resolve(input) {
	if (typeof input === "string") {
		// Import the plan.
		if (builtinModules.includes(input))
			throw new Error("A builtin module can not be resolved as a plan.");
		if (!/\.\w+$/.test(input))
			input += ".mjs";
		// const relative = join(dirname(callerFile), input);
		// !/^[A-Za-z]{3,9}:/.test(input) || exists(relative) ? relative : input
		input = (await import(input)).default;
	}
	// Validate the plan.
	if (input.execute != null && typeof input.execute !== "function")
		throw new Error("The plan's execute property must be a function.");
	if (input.plans != null && typeof input.plans[Symbol.iterator] !== "function")
		throw new Error("The plan's associated plans must be iterable.");
	if (input.serial != null && input.serial != true && input.serial != false)
		throw new Error("The plan's serial toggle must be a boolean.");
	if (input.include != null && typeof input.include[Symbol.iterator] !== "function")
		throw new Error("The plan's include property must be iterable.");
	return input;
}

async function executeSerial(plans) {
	for (const plan of plans)
		await execute(plan);
}

function executeParallel(plans) {
	const promises = [];
	for (const plan of plans)
		promises.push(execute(plan));
	return Promise.all(promises);
}

export async function execute(plan) {
	plan = await resolve(plan);
	if (plan.execute != null) {
		let args = [];
		// Apply static resources.
		if (plan.include != null)
			for (let key of plan.include)
				args.push(res[key]);

		// Execute the plan.
		const executePromise = plan.execute.apply(plan, args);
		if (executePromise != null)
			await executePromise;
	}
	if (plan.plans) {
		if (plan.serial)
			await executeSerial(plan.plans);
		else
			await executeParallel(plan.plans);
	}
}

export function setResource(key, value) {
	if (value === undefined)
		console.warn("setResource should be called with static resources that" +
			"exist for the entire duration of the application. Consider using" +
			"dynamic resources.");
	res[key] = value;
}
