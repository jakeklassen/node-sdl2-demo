/**
 *
 * @param {number} max
 * @param {number} min
 * @returns
 */
export const getRandom = (max, min = 0) =>
	Math.floor(Math.random() * max) + min;
