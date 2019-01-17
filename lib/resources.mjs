/**
 * Stores static resources.
 */
export const res = {};

/**
 * Sets a static resource.
 * @param {string} key The key to include.
 * @param {any} value The value.
 */
export function setResource(key, value) {
	if (value === undefined)
		console.warn('setResource should be called with static resources that' +
			'exist for the entire duration of the application. Consider using' +
			'dynamic resources.');
	res[key] = value;
}
