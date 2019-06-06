/**
 * @typedef {object|string|number} EnumItem
 * Represents an Item of an Enum.
 * @global
 * @see https://www.npmjs.com/package/enum
 * @license MIT
 */

/**
 * @typedef {Object} Plan
 *
 * @property {?ExecuteCallback} execute The action to execute.
 * @property {?string|Plan[]} plans Associated plans.
 * @property {?Mode} mode How to execute plans.
 *
 * @property {?EventEmitter|ResourceIdentifier} emitter An emitter for the event.
 * @property {?string} event The name of the event in the emitter.
 * @property {?boolean} repeats If the plan may be executed more then once due to an event.
 *
 * @property {?ResourceIdentifier[]} include Static resources to provide to `execute`.
 * @property {?any[]} meta Stores data about associated plans.
 *
 * @property {?HandleErrorCallback} handleError Handles propogated errors.
 *
 * @tutorial GettingStarted
 */

/**
 * @callback ExecuteCallback
 * @param {...any} var_args Any number of static and dynamic resources.
 */

/**
 * @callback HandleErrorCallback
 * @param {Error} err
 * @returns {?Promise}
 */

export { expandPath, filterPlans, handleError } from './util.mjs';
export { resolve } from './resolver.mjs';
export { execute, executePlans, mode } from './executor.mjs';
export { setResource } from './resources.mjs';
