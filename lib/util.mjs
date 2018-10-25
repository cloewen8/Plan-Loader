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
 */
export async function executeSerial(plans) {
	for (const plan of plans)
		await execute(plan);
}

/**
 * Executes plans in parallel.
 * @param {Plan[]} plans An iterable of plans.
 */
export function executeParallel(plans) {
	const promises = [];
	for (const plan of plans)
		promises.push(execute(plan));
	return Promise.all(promises);
}
