export async function resolve(input) {
	if (typeof input === "string")
		input = await import(input);
	// todo: Validate the module.
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
