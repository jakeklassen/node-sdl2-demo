import { System } from "@jakeklassen/ecs";
import type { World } from "@jakeklassen/ecs";
import { Rotator } from "../components/rotator.ts";
import { Transform2d } from "../components/transform2d.ts";

export class RotationSystem extends System {
	update(world: World, dt: number) {
		for (const [_entity, components] of world.view(Transform2d, Rotator)) {
			const transform = components.get(Transform2d);
			const rotator = components.get(Rotator);

			transform.rotation += rotator.value * dt;
		}
	}
}
