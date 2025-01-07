import { System, World } from "@jakeklassen/ecs";
import { Rotator } from "../components/rotator.js";
import { Transform2d } from "../components/transform2d.js";

export class RotationSystem extends System {
	/**
	 *
	 * @param {World} world
	 * @param {number} dt
	 */
	update(world, dt) {
		for (const [_entity, components] of world.view(Transform2d, Rotator)) {
			const transform = components.get(Transform2d);
			const rotator = components.get(Rotator);

			transform.rotation += rotator.value * dt;
		}
	}
}
