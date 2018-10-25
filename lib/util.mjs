import { dirname, join } from "path";
import { execute } from "./executor";

/**
 * Expands a relative path based on a module's url.
 * @param {string} base An absolute file path retrieved using `import.meta.url`
 * @param {string} path The relative path.
 * @return {string} The absolute path.
 */
export function expandPath(base, path) {
	return join(dirname(base), path);
}

/**
 * Executes plans serially.
 * @param {Plan[]} plans An iterable of plans.
 * @param {...any} dres Dynamic resources to pass to the plans.
 */
export async function executeSerial(plans, ...dres) {
	for (const plan of plans)
		await execute(plan, ...dres);
}

/**
 * Executes plans in parallel.
 * @param {Plan[]} plans An iterable of plans.
 * @param {...any} dres Dynamic resources to pass to the plans.
 */
export function executeParallel(plans, ...dres) {
	const promises = [];
	for (const plan of plans)
		promises.push(execute(plan, ...dres));
	return Promise.all(promises);
}