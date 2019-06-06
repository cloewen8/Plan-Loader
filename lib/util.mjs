/**
 * @module Util
 */

import { dirname, join } from 'path';
import { execute } from './executor.mjs';

/**
 * Expands a relative path based on a module's url.
 *
 * @param {string} base An absolute file path retrieved using `import.meta.url`
 * @param {string} path The relative path.
 * @returns {string} The absolute path.
 */
export function expandPath(base, path) {
	return join(dirname(base), path);
}

/**
 * @callback PredicateCallback
 * @param {any} data
 * @returns {boolean}
 */

/**
 * Iterates through all valid plans.
 *
 * @param {Plan} plan The plan containing plans and metadata.
 * @param {PredicateCallback} predicate Checks if the plan is acceptable.
 */
export function* filterPlans(plan, predicate) {
	if (plan.plans[Symbol.iterator] == null)
		throw new Error('The plan is missing plans.');
	if (plan.meta[Symbol.iterator] == null)
		throw new Error('The plan is missing metadata.');
	let index = 0;
	for (let data of plan.meta) {
		if (predicate(data))
			yield plan.plans[index];
		index++;
	}
}

/**
 * Executes plans serially.
 *
 * @param {Plan[]} plans An iterable of plans.
 * @param {...any} dres Dynamic resources to pass to the plans.
 * @package
 * @ignore
 */
export async function executeSerial(plans, ...dres) {
	for (const plan of plans)
		await execute(plan, ...dres);
}

/**
 * Executes plans in parallel.
 *
 * @param {Plan[]} plans An iterable of plans.
 * @param {...any} dres Dynamic resources to pass to the plans.
 * @package
 * @ignore
 */
export function executeParallel(plans, ...dres) {
	const promises = [];
	for (const plan of plans)
		promises.push(execute(plan, ...dres));
	return Promise.all(promises);
}

/**
 * Handles or propogates an error.
 *
 * @param {Plan} plan The plan to handle the error.
 * @param {Error|any} error An error that has occured.
 */
export function handleError(plan, error) {
	let promise;
	if (plan.handleError != null) {
		try {
			promise = plan.handleError.bind(plan)(error);
			if (!(promise instanceof Promise))
				promise = Promise.resolve();
		} catch (err) {
			promise = Promise.reject(err);
		}
	} else
		promise = Promise.reject(error);
	return promise;
}

/**
 * Creates and throws an error.
 *
 * @param {string} message The error message.
 * @param {string} code The error code.
 * @throws Throws the error.
 * @package
 * @ignore
 */
export function throwError(message, code) {
	let err = new Error(message);
	err.code = code;
	Error.captureStackTrace(err, throwError);
	throw err;
}
