import { System } from "@jakeklassen/ecs";
import type { World } from "@jakeklassen/ecs";
import { Transform2d } from "../components/transform2d.ts";
import { Sprite } from "../components/sprite.ts";
import { IDENTITY_MATRIX } from "../lib/canvas.ts";
import type { Canvas, CanvasRenderingContext2D } from "canvas";

export class RenderingSystem extends System {
	readonly #canvas: Canvas;

	readonly #ctx: CanvasRenderingContext2D;

	constructor(canvas: Canvas) {
		super();

		this.#canvas = canvas;
		this.#ctx = canvas.getContext("2d");
	}

	update(world: World, _dt: number) {
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
