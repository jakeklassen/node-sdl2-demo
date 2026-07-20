import { System } from "@jakeklassen/ecs";
import type { World } from "@jakeklassen/ecs";
import { Transform2d } from "../components/transform2d.ts";
import { Velocity2d } from "../components/velocity2d.ts";

export class MovementSystem extends System {
	update(world: World, dt: number) {
		for (const [_entity, components] of world.view(Transform2d, Velocity2d)) {
			const transform = components.get(Transform2d);
			const velocity = components.get(Velocity2d);

			transform.position.x += velocity.x * dt;
			transform.position.y += velocity.y * dt;
		}
	}
}
