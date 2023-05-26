import { loadImage } from "canvas";
import { World } from "objecs";

/**
 * @typedef SpriteRenderingSystemOptions
 * @property {World<import("../entity.js").Entity>} world
 * @property {import('canvas').CanvasRenderingContext2D} context
 */

/**
 * @param {SpriteRenderingSystemOptions} options
 */
export async function spriteRenderingSystemFactory({ context, world }) {
	const content = {
		spriteSheet: await loadImage("assets/image/shmup.png"),
	};

	const sprites = world.archetype("sprite", "transform");

	return function spriteRenderingSystem() {
		const entities = Array.from(sprites.entities).sort(
			(a, b) => a.sprite.layer - b.sprite.layer,
		);

		const entityMissingLayer = entities.find(
			(entity) => entity.sprite.layer == null,
		);

		if (entityMissingLayer != null) {
			console.warn(
				`Entity is missing a layer. All entities with a sprite must have a layer.`,
			);
			console.warn(entityMissingLayer);
		}

		for (const entity of entities) {
			const { sprite, transform } = entity;

			context.globalAlpha = sprite.opacity;

			context.translate(transform.position.x | 0, transform.position.y | 0);
			context.rotate(transform.rotation);
			context.scale(transform.scale.x, transform.scale.y);

			/**
			 * @type {import('canvas').Image}
			 */
			let imageSource = content.spriteSheet;

			context.drawImage(
				imageSource,
				sprite.frame.sourceX,
				sprite.frame.sourceY,
				sprite.frame.width,
				sprite.frame.height,
				transform.scale.x > 0 ? 0 : -sprite.frame.width,
				transform.scale.y > 0 ? 0 : -sprite.frame.height,
				sprite.frame.width,
				sprite.frame.height,
			);

			context.globalAlpha = 1;
			context.resetTransform();
		}
	};
}
