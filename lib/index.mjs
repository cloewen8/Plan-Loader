import { dirname, join } from "path";
import { existsSync as exists } from "fs";
import { builtinModules } from "module"

// From: https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function/29581862#29581862
function getCallerFile() {
	var originalFunc = Error.prepareStackTrace;

	var callerfile;

	try {
		var err = new Error();
		var currentfile;

		Error.prepareStackTrace = function (_, stack) { return stack; };

		currentfile = err.stack.shift().getFileName();

		while (err.stack.length) {
			callerfile = err.stack.shift().getFileName();

			if(currentfile !== callerfile) break;
		}
	} catch {} finally {
		Error.prepareStackTrace = originalFunc;
	}

	return callerfile;
}

export async function resolve(input) {
	if (typeof input === "string") {
		if (builtinModules.includes(input))
			throw new Error("A builtin module can not be resolved as a plan.");
		const callerFile = getCallerFile();
		if (callerFile == null)
			throw new Error("Unable to trace caller path to import from.");
		if (!/\.\w+$/.test(input))
			input += ".mjs";
		const relative = join(dirname(callerFile), input);
		input = (await import(!/^[A-Za-z]{3,9}:/.test(input) || exists(relative) ? relative : input)).default;
	}
	if (input.execute != null && typeof input.execute !== "function")
		throw new Error("The plan's execute property must be a function.");
	if (input.plans != null && typeof input.plans[Symbol.iterator] !== "function")
		throw new Error("The plan's associated plans must be iterable.");
	if (input.serial != null && input.serial != true && input.serial != false)
		throw new Error("The plan's serial toggle must be a boolean.");
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
		const executePromise = plan.execute();
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
