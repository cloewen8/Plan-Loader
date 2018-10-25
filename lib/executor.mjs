import { resolve } from "./resolver";
import { res } from "./resources";
import { executeSerial, executeParallel } from "./util";

/**
 * Resolves and executes a plan.
 * @param {Plan|string} plan The plan to execute.
 * @see resolve
 * @see `manual/Resources.md`
 */
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
