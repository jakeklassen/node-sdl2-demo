import sdl from "@kmamal/sdl";
import type { World } from "objecs";
import { Timer } from "../../lib/timer.ts";
import type { Entity } from "../entity.ts";

type PlayerSystemOptions = {
	world: World<Entity>;
};

export function playerSystemFactory({ world }: PlayerSystemOptions) {
	const players = world.archetype("direction", "tagPlayer", "velocity");

	const bulletTimer = new Timer(0.133);

	const input = {
		left: false,
		right: false,
		up: false,
		down: false,
		fire: false,
	};

	return function playerSystem(dt: number) {
		const [player] = players.entities;

		if (player == null) {
			return;
		}

		bulletTimer.update(dt);

		const keyboardState = sdl.keyboard.getState();

		input.left = keyboardState[sdl.keyboard.SCANCODE.LEFT];
		input.right = keyboardState[sdl.keyboard.SCANCODE.RIGHT];
		input.up = keyboardState[sdl.keyboard.SCANCODE.UP];
		input.down = keyboardState[sdl.keyboard.SCANCODE.DOWN];
		input.fire = keyboardState[sdl.keyboard.SCANCODE.X];

		const { direction } = player;

		direction.x = 0;
		direction.y = 0;

		if (input.left) {
			direction.x = -1;
		} else if (input.right) {
			direction.x = 1;
		}

		if (input.up) {
			direction.y = -1;
		} else if (input.down) {
			direction.y = 1;
		}

		if (input.fire && bulletTimer.isExpired) {
			bulletTimer.reset();

			// TODO: Fire bullet
		}
	};
}
