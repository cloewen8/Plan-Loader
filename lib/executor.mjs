import { resolve } from "./resolver";
import { res as sres } from "./resources";
import { executeSerial, executeParallel } from "./util";
import Enum from "enum";

/**
 * An enum which describes how to execute associated plans.
 * @property {EnumItem} Serial Each plan is executed in order.
 * @property {EnumItem} Parallel Each plan is executed at the same time.
 * @property {EnumItem} Custom Plans are not executed automatically.
 */
export const mode = new Enum({"Serial": 0, "Parallel": 1, "Custom": 2},
	{ ignoreCase: true });

/**
 * Resolves and executes a plan.
 * @param {Plan|string} plan The plan to execute.
 * @param {...any} dres Dynamic resources to pass to the plan.
 * @see resolve
 * @see `manual/Resources.md`
 */
export async function execute(plan, ...dres) {
	plan = await resolve(plan);
	if (plan.execute != null) {
		let args = [];
		// Apply static resources.
		if (plan.include != null)
			for (let key of plan.include)
				args.push(sres[key]);
		args.push(...dres);

		// Execute the plan.
		const executePromise = plan.execute.apply(plan, args);
		if (executePromise != null)
			await executePromise;
	}
	if (plan.plans != null) {
		if (plan.mode == null || mode.Parallel.is(plan.mode))
			await executeParallel(plan.plans, ...dres);
		else if (mode.Serial.is(plan.mode))
			await executeSerial(plan.plans, ...dres);
	}
}