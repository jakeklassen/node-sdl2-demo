/**
 * @param {string} hex
 * @param {number} alpha
 * @returns
 */
export const hexColorToRGBA = (hex, alpha = 255) => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	return { r, g, b, a: alpha };
};
