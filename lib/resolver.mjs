import { builtinModules } from 'module';
import { mode } from './executor';
import { res } from './resources';
import { throwError } from './util';

/**
 * Imports and validates a plan.
 * @param {string|Plan} input The string or object plan.
 * @return {Promise<Plan>} The plan object.
 * @throws If the plan is a built-in module (BUILTIN_NOT_PLAN).
 * @throws If the plan can not be imported (INVALID_PROPERTY).
 * @throws If the plan's `execute` property is not a function (INVALID_PROPERTY).
 * @throws If the plan's `plans` property is not iterable (INVALID_PROPERTY).
 * @throws If the plan's `mode` property is not a valid mode (INVALID_PROPERTY).
 * @throws If the plan's `include` property is not iterable (INVALID_PROPERTY).
 * @throws If the plan's `meta` property is not iterable (INVALID_PROPERTY).
 * @throws If the plan's `handleError` property is not a function (INVALID_PROPERTY).
 * @throws If the plan's `event` property is not a string (INVALID_PROPERTY).
 * @throws If the plan has an event but no plans (MISSING_PROPERTY).
 * @throws If the plan's `repeats` property is not a boolean (INVALID_PROPERTY).
 * @throws If the plan's `emitter` property is a string, but not a valid static resource (MISSING_PROPERTY).
 * @throws If the plan is set to repeat, but the emitter does not have an `on` function (MISSING_PROPERTY).
 * @throws If the plan is not set to repeat, and the emitter does not have a `once` function (MISSING_PROPERTY).
 * @tutorial Resolver
 */
export async function resolve(input) {
	if (typeof input === 'string') {
		// Import the plan.
		if (builtinModules.includes(input))
			throwError('A builtin module can not be resolved as a plan.', 'BUILTIN_NOT_PLAN');
		if (!/\.\w+$/.test(input))
			input += '.mjs';
		// const relative = join(dirname(callerFile), input);
		// !/^[A-Za-z]{3,9}:/.test(input) || exists(relative) ? relative : input
		input = (await import(input)).default;
	}
	// Validate the plan.
	if (input.execute != null && typeof input.execute !== 'function')
		throwError('The plan\'s execute property must be a function.', 'INVALID_PROPERTY');
	if (input.plans != null && typeof input.plans[Symbol.iterator] !== 'function')
		throwError('The plan\'s associated plans must be iterable.', 'INVALID_PROPERTY');
	if (input.mode != null && !mode.isDefined(input.mode))
		throwError('The plan\'s mode must be a valid mode enum item.', 'INVALID_PROPERTY');
	if (input.include != null && typeof input.include[Symbol.iterator] !== 'function')
		throwError('The plan\'s include property must be iterable.', 'INVALID_PROPERTY');
	if (input.meta != null && typeof input.meta[Symbol.iterator] !== 'function')
		throwError('The plan\'s meta property must be iterable.', 'INVALID_PROPERTY');
	if (input.handleError != null && typeof input.handleError !== 'function')
		throwError('The planb\'s handleError property must be a function.', 'INVALID_PROPERTY');
	if (input.event != null) {
		if (typeof input.event !== 'string')
			throwError('The plan\'s event must be a string.', 'INVALID_PROPERTY');
		if (input.plans == null)
			throwError('Plan\'s with an event must also have associated plans.', 'MISSING_PROPERTY');
		if (input.repeats != null && typeof input.repeats !== 'boolean')
			throwError('The plan\'s repeats property must be a boolean.', 'INVALID_PROPERTY');
		let emitter = input.emitter;
		if (typeof emitter === 'string')
			emitter = res[emitter];
		if (emitter == null)
			throwError('An emitter must exist if an event is used.', 'MISSING_PROPERTY');
		else if (input.repeats && typeof emitter.on !== 'function')
			throwError('The emitter must have an on function.', 'MISSING_PROPERTY');
		else if (!input.repeats && typeof emitter.once !== 'function')
			throwError('The emitter must have a once function.', 'MISSING_PROPERTY');
	}
	return input;
}
