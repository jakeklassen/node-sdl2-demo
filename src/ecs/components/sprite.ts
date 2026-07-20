import type { Entity } from "../entity.ts";
import type { Sprite } from "./sprite.factory.ts";
import { SpriteLayer } from "../constants.ts";

export function spriteFactory(sprite: Sprite): NonNullable<Entity["sprite"]> {
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
