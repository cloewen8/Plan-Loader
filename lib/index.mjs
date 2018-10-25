/**
 * @typedef {Object} Plan
 * @property {?function()} execute The action to execute.
 * @property {?string|Plan[]} plans Associated plans.
 * @property {?boolean} serial If plans should be executed in order (instead of
 * at the same time).
 * @property {?string[]} include Static resources to provide to `execute`.
 * @see `manual/Getting Started.md`
 */

export { expandPath } from "./util";
export { resolve } from "./resolver";
export { execute, mode } from "./executor";
export { setResource } from "./resources";
