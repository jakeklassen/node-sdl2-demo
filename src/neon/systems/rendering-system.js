import { System, World } from "@jakeklassen/ecs";
import { Transform2d } from "../components/transform2d.js";
import { Sprite } from "../components/sprite.js";
import { IDENTITY_MATRIX } from "../lib/canvas.js";
import { Canvas, CanvasRenderingContext2D } from "canvas";

export class RenderingSystem extends System {
	/**
	 * @type {Canvas}
	 * @readonly
	 */
	#canvas;

	/**
	 * @type {CanvasRenderingContext2D}
	 * @readonly
	 */
	#ctx;

	/**
	 *
	 * @param {Canvas} canvas
	 */
	constructor(canvas) {
		super();

		this.#canvas = canvas;
		this.#ctx = canvas.getContext("2d");
	}

	/**
	 *
	 * @param {World} world
	 * @param {number} dt
	 */
	update(world, dt) {
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

		for (const [_entity, components] of world.view(Transform2d, Sprite)) {
			const transform = components.get(Transform2d);
			const sprite = components.get(Sprite);

			this.#ctx.globalCompositeOperation = "lighter";
			this.#ctx.translate(transform.position.x, transform.position.y);
			this.#ctx.rotate(transform.rotation);

			this.#ctx.drawImage(
				sprite.image,
				-sprite.image.width / 2,
				-sprite.image.height / 2,
				sprite.image.width,
				sprite.image.height,
			);

			this.#ctx.setTransform(IDENTITY_MATRIX);
		}
	}
}
