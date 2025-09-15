import sdl from "@kmamal/sdl";
import { Timer } from "../../lib/timer.js";

/**
 * @typedef PlayerSystemOptions
 * @property {import("objecs").World<import("../entity.js").Entity>} world
 */

/**
 * @param {PlayerSystemOptions} options
 */
export function playerSystemFactory({ world }) {
	const players = world.archetype("direction", "tagPlayer", "velocity");

	const bulletTimer = new Timer(0.133);

	const input = {
		left: false,
		right: false,
		up: false,
		down: false,
		fire: false,
	};

	/**
	 * @param {number} dt
	 */
	return function playerSystem(dt) {
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
