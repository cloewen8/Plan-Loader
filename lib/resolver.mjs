import { builtinModules } from 'module';
import { mode } from './executor';
import { res } from './resources';

/**
 * Imports and validates a plan.
 * @param {string|Plan} input The string or object plan.
 * @return {Promise<Plan>} The plan object.
 * @throws If the plan is a built-in module.
 * @throws If the plan can not be imported.
 * @throws If the plan's `execute` property is not a function.
 * @throws If the plan's `plans` property is not iterable.
 * @throws If the plan's `mode` property is not a valid mode.
 * @throws If the plan's `include` property is not iterable.
 * @throws If the plan's `meta` property is not iterable.
 * @throws If the plan's `handleError` property is not a function.
 * @throws If the plan's `event` property is not a string.
 * @throws If the plan has an event but no plans.
 * @throws If the plan's `repeats` property is not a boolean.
 * @throws If the plan's `emitter` property is a string, but not a valid static resource.
 * @throws If the plan is set to repeat, but the emitter does not have an `on` function.
 * @throws If the plan is not set to repeat, and the emitter does not have a `once` function.
 * @see `manual/The Resolver.md`
 */
export async function resolve(input) {
	if (typeof input === 'string') {
		// Import the plan.
		if (builtinModules.includes(input))
			throw new Error('A builtin module can not be resolved as a plan.');
		if (!/\.\w+$/.test(input))
			input += '.mjs';
		// const relative = join(dirname(callerFile), input);
		// !/^[A-Za-z]{3,9}:/.test(input) || exists(relative) ? relative : input
		input = (await import(input)).default;
	}
	// Validate the plan.
	if (input.execute != null && typeof input.execute !== 'function')
		throw new Error('The plan\'s execute property must be a function.');
	if (input.plans != null && typeof input.plans[Symbol.iterator] !== 'function')
		throw new Error('The plan\'s associated plans must be iterable.');
	if (input.mode != null && !mode.isDefined(input.mode))
		throw new Error('The plan\'s mode must be a valid mode enum item.');
	if (input.include != null && typeof input.include[Symbol.iterator] !== 'function')
		throw new Error('The plan\'s include property must be iterable.');
	if (input.meta != null && typeof input.meta[Symbol.iterator] !== 'function')
		throw new Error('The plan\'s meta property must be iterable.');
	if (input.handleError != null && typeof input.handleError !== 'function')
		throw new Error('The planb\'s handleError property must be a function.');
	if (input.event != null) {
		if (typeof input.event !== 'string')
			throw new Error('The plan\'s event must be a string.');
		if (input.plans == null)
			throw new Error('Plan\'s with an event must also have associated plans.');
		if (input.repeats != null && typeof input.repeats !== 'boolean')
			throw new Error('The plan\'s repeats property must be a boolean.');
		let emitter = input.emitter;
		if (typeof emitter === 'string')
			emitter = res[emitter];
		if (emitter == null)
			throw new Error('An emitter must exist if an event is used.');
		else if (input.repeats && typeof emitter.on !== 'function')
			throw new Error('The emitter must have an on function.');
		else if (!input.repeats && typeof emitter.once !== 'function')
			throw new Error('The emitter must have a once function.');
	}
	return input;
}
