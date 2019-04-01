/**
 * @module Tests
 */

import Jasmine from 'jasmine';

const jasmine = new Jasmine();

/**
 * Adds a function that is called once the suite is finished.
 *
 * @param {function(runDetails: Jasmine.RunDetails): void} callback
 * @package
 */
export function addExtraReport(callback) {
	let old = jasmine.reporter.jasmineDone;
	jasmine.reporter.jasmineDone = function(runDetails) {
		old(runDetails);
		callback(runDetails);
	};
}

/**
 * Gets a random floating-point number.
 *
 * @param {?number} min The minimum number range.
 * @param {?number} max The maximum number range.
 * @returns {number}
 * @package
 */
export function getRandFloat(min = 0, max = 9) {
	return min + Math.random()*(max - min);
}

/**
 * Gets a random whole number.
 *
 * @param {?number} min The minimum number range.
 * @param {?number} max The maximum number range.
 * @returns {number}
 * @package
 */
export function getRandInt(min = 0, max = 9) {
	return Math.floor(getRandFloat(min, max));
}

/**
 * Creates a random string.
 *
 * @param {?number} min The minimum string length.
 * @param {?number} max The maximum string length.
 * @param {?string} range The minimum and maximum character codepoints (e.g.
 * `az`).
 * @returns {string}
 * @package
 */
export function getRandString(min = 1, max = 1, range = ' ~') {
	let startPoint = range.codePointAt(0);
	let endPoint = range.codePointAt(1);
	let points = [];
	for (let i = 0; i < getRandInt(min, max); i++)
		points.push(getRandInt(startPoint, endPoint));
	return String.fromCodePoint(...points);
}

export default jasmine;
