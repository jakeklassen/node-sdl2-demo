import sdl from "@kmamal/sdl";
import Canvas, { registerFont } from "canvas";
import { World } from "objecs";
import { setTimeout } from "timers/promises";
import { starfieldFactory } from "./entity-factories/star.js";
import { movementSystemFactory } from "./systems/movement-system.js";
import { starfieldRenderingSystemFactory } from "./systems/starfield-rendering-system.js";
import { starfieldSystemFactory } from "./systems/starfield-system.js";
import { spriteRenderingSystemFactory } from "./systems/sprite-rendering-system.js";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });

const gameWidth = 128;
const gameHeight = 128;
const scale = 4;

const window = sdl.video.createWindow({
	title: "Cherry Bomb",
	accelerated: true,
	width: gameWidth * scale,
	height: gameHeight * scale,
	fullscreen: false,
	vsync: false,
});

const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
context.antialias = "none";
context.quality = "nearest";

/**
 * @type {World<import("./entity.js").Entity>}
 */
const world = new World();

const systems = [
	starfieldSystemFactory({ world }),
	movementSystemFactory({ world }),
	starfieldRenderingSystemFactory({
		context,
		world,
	}),
	await spriteRenderingSystemFactory({
		context,
		world,
	}),
];

starfieldFactory({
	areaWidth: gameWidth - 1,
	areaHeight: gameHeight - 1,
	count: 100,
	world,
});

const input = {
	left: false,
	right: false,
	up: false,
	down: false,
};

const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;
const dt = STEP / 1000;
let variableDt = 0;
let dtAccumulator = 0;
let last = performance.now();

while (!window.destroyed) {
	const hrt = performance.now();

	dtAccumulator += hrt - last;
	variableDt = (hrt - last) / 1000;

	const keyboardState = sdl.keyboard.getState();

	if (keyboardState[sdl.keyboard.SCANCODE.ESCAPE]) {
		window.destroy();

		break;
	}

	input.left = keyboardState[sdl.keyboard.SCANCODE.LEFT];
	input.right = keyboardState[sdl.keyboard.SCANCODE.RIGHT];
	input.up = keyboardState[sdl.keyboard.SCANCODE.UP];
	input.down = keyboardState[sdl.keyboard.SCANCODE.DOWN];

	context.clearRect(0, 0, canvas.width, canvas.height);

	while (dtAccumulator >= STEP) {
		dtAccumulator -= STEP;
	}

	for (const system of systems) {
		system(variableDt);
	}

	context.font = "5px PICO-8";
	context.fillStyle = "#ffffff";
	context.strokeStyle = "#ffffff";
	context.lineWidth = 1;

	const textMetrics = context.measureText("Cherry Bomb");
	context.fillText(
		"Cherry Bomb",
		(canvas.width / 2 - textMetrics.width / 2) | 0,
		8,
	);

	const buffer = canvas.toBuffer("raw");

	window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

	await setTimeout(0);

	last = hrt;
}
