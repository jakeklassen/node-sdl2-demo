import { SpriteLayer } from "../constants.ts";

/**
 *
 * @param {import("./sprite.factory.js").Sprite} sprite
 * @returns {NonNullable<import("../entity.js").Entity["sprite"]>}
 */
export function spriteFactory(sprite) {
	return {
		frame: {
			sourceX: sprite.frame.sourceX,
			sourceY: sprite.frame.sourceY,
			width: sprite.frame.width,
			height: sprite.frame.height,
		},
		layer: sprite.layer ?? SpriteLayer.Base,
		opacity: sprite.opacity ?? 1,
		paletteSwaps: sprite.paletteSwaps ?? [],
	};
}
