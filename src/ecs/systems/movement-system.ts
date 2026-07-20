import type { World } from "objecs";
import type { Entity } from "../entity.ts";

type MovementSystemOptions = {
	world: World<Entity>;
};

export function movementSystemFactory({ world }: MovementSystemOptions) {
	const movables = world.archetype("direction", "transform", "velocity");

	return function movementSystem(dt: number) {
		for (const entity of movables.entities) {
			entity.transform.position.x +=
				entity.velocity.x * entity.direction.x * dt;

			entity.transform.position.y +=
				entity.velocity.y * entity.direction.y * dt;
		}
	};
}
