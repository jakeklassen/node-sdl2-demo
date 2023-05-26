import { World } from "objecs";
import { hexColorToRGBA } from "../../lib/color.js";

/**
 * @typedef StarfieldRenderingSystemOptions
 * @property {World<import("../entity.js").Entity>} world
 * @property {import('canvas').CanvasRenderingContext2D} context
 */

/**
 * @param {StarfieldRenderingSystemOptions} options
 */
export function starfieldRenderingSystemFactory({ world, context }) {
	const stars = world.archetype("star", "transform");

	return function starfieldRenderingSystem() {
		for (const { star, transform } of stars.entities) {
			context.globalAlpha = 1;

			context.translate(transform.position.x | 0, transform.position.y | 0);
			context.rotate(transform.rotation);
			context.scale(transform.scale.x, transform.scale.y);

			context.fillStyle = star.color;

			context.fillRect(0, 0, 1, 1);

			context.globalAlpha = 1;
			context.resetTransform();
		}
	};
}
