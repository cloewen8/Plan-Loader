/**
 * @typedef {Object} Plan
 *
 * @property {?ExecuteCallback} execute The action to execute.
 * @property {?string|Plan[]} plans Associated plans.
 * @property {?Mode} mode How to execute plans.
 *
 * @property {?EventEmitter|string} emitter An emitter for the event.
 * @property {?string} event The name of the event in the emitter.
 * @property {?boolean} repeats If the plan may be executed more then once due to an event.
 *
 * @property {?string[]} include Static resources to provide to `execute`.
 * @property {?any[]} meta Stores data about associated plans.
 *
 * @property {?HandleErrorCallback} handleError Handles propogated errors.
 *
 * @callback ExecuteCallback
 * @param {...any} var_args Any number of static and dynamic resources.
 *
 * @callback HandleErrorCallback
 * @param {Error} err
 * @returns {?Promise}
 *
 * @tutorial GettingStarted
 */

export { expandPath, filterPlans, handleError } from './util';
export { resolve } from './resolver';
export { execute, executePlans, mode } from './executor';
export { setResource } from './resources';
