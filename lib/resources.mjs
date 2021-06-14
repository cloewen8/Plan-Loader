/**
 * @module Resources
 */

/**
 * @typedef {string} ResourceIdentifier
 * Identifies a static resource to include.
 * @global
 */

/**
 * Stores static resources.
 *
 * @package
 * @ignore
 */
export const res = {};

/**
 * Sets a static resource.
 *
 * @param {ResourceIdentifier} id The resource identifier.
 * @param {any} value The value.
 */
export function setResource(id, value) {
	if (value === undefined)
		console.warn('setResource should be called with static resources that' +
			'exist for the entire duration of the application. Consider using' +
			'dynamic resources.');
	res[id] = value;
}
