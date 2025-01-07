import { World } from "@jakeklassen/ecs";
import sdl from "@kmamal/sdl";
import Canvas, { Image, registerFont } from "canvas";
import { setTimeout } from "timers/promises";
import { DEG_TO_RAD } from "../lib/math.js";
import { Rotator } from "./components/rotator.js";
import { Sprite } from "./components/sprite.js";
import { Transform2d } from "./components/transform2d.js";
import { Velocity2d } from "./components/velocity2d.js";
import { Vector2d } from "./lib/vector2d.js";
import { MovementSystem } from "./systems/movement-system.js";
import { RenderingSystem } from "./systems/rendering-system.js";
import { RotationSystem } from "./systems/rotation-system.js";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });

const gameWidth = 1024;
const gameHeight = 768;

/**
 * @type {Record<string, Image>}
 */
const cache = {};

generateImages(cache);

const window = sdl.video.createWindow({
	title: "Neon Effect",
	accelerated: true,
	width: gameWidth,
	height: gameHeight,
	fullscreen: false,
	vsync: false,
});

const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = true;
// context.antialias = "none";
// context.quality = "nearest";

// Used to create and store images
/**
 *
 * @param {Record<string, Image>} cache
 */
function generateImages(cache) {
	const bufferCanvas = Canvas.createCanvas(64, 64);

	const bufferCtx = bufferCanvas.getContext("2d");
	bufferCtx.imageSmoothingEnabled = false;
	bufferCtx.globalCompositeOperation = "lighter";
	bufferCtx.shadowColor = "red";
	bufferCtx.shadowBlur = 6;

	// Square
	bufferCtx.globalAlpha = 0.5;
	bufferCtx.strokeStyle = "white";
	bufferCtx.lineWidth = 5;
	bufferCtx.strokeRect(15, 15, 34, 34);

	// Overlay
	bufferCtx.globalAlpha = 0.8;
	bufferCtx.strokeStyle = "blue";
	bufferCtx.lineWidth = 8;
	bufferCtx.strokeRect(15, 15, 34, 34);

	cache.square = new Image();
	cache.square.src = bufferCanvas.toDataURL();

	bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

	// Ship base
	bufferCtx.globalAlpha = 0.5;
	bufferCtx.strokeStyle = "white";
	bufferCtx.lineWidth = 3;
	bufferCtx.beginPath();
	bufferCtx.arc(32, 32, 18, 0, Math.PI * 2, true);
	bufferCtx.stroke();

	// Ship overlay
	bufferCtx.globalAlpha = 0.8;
	bufferCtx.strokeStyle = "green";
	bufferCtx.lineWidth = 8;
	bufferCtx.beginPath();
	bufferCtx.arc(32, 32, 18, 0, Math.PI * 2, true);
	bufferCtx.stroke();

	cache.player = new Image();
	cache.player.src = bufferCanvas.toDataURL();

	bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

	// Navigator
	const startAngle = 0;

	bufferCtx.strokeStyle = "teal";
	bufferCtx.save();
	bufferCtx.lineWidth = 3;
	bufferCtx.beginPath();
	//bufferCtx.arc(32, 32, 22,  startAngle - 135 * Math.PI / 180, startAngle - 45 * Math.PI / 180, false);
	bufferCtx.arc(
		32,
		32,
		22,
		startAngle - 45 * DEG_TO_RAD,
		startAngle + 45 * DEG_TO_RAD,
		false,
	);
	bufferCtx.stroke();

	// Navigator overlay
	bufferCtx.strokeStyle = "lightBlue";
	bufferCtx.lineWidth = 3;
	bufferCtx.beginPath();
	bufferCtx.arc(
		32,
		32,
		22,
		startAngle - 45 * DEG_TO_RAD,
		startAngle + 45 * DEG_TO_RAD,
		false,
	);
	bufferCtx.stroke();
	bufferCtx.restore();

	cache.shipNavigator = new Image();
	cache.shipNavigator.src = bufferCanvas.toDataURL();

	bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
}

const world = new World();

const player = world.createEntity();
const shipNavigator = world.createEntity();
const square = world.createEntity();

world.addEntityComponents(
	player,
	new Transform2d(new Vector2d(canvas.width / 2, canvas.height / 2)),
	new Sprite(cache.player),
);

world.addEntityComponents(
	shipNavigator,
	new Transform2d(new Vector2d(canvas.width / 2, canvas.height / 2)),
	new Sprite(cache.shipNavigator),
	new Velocity2d(0, 0),
	new Rotator(5),
);

world.addEntityComponents(
	square,
	new Transform2d(new Vector2d(0, canvas.height / 2)),
	new Sprite(cache.square),
	new Velocity2d(150, 0),
	new Rotator(5),
);

world.addSystem(new MovementSystem());
world.addSystem(new RotationSystem());
world.addSystem(new RenderingSystem(canvas));

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

	world.update(variableDt);

	context.font = "20px PICO-8";
	context.fillStyle = "#ffffff";
	context.strokeStyle = "#ffffff";
	context.lineWidth = 1;

	const textMetrics = context.measureText("Neon Demo");
	context.fillText(
		"Neon Demo",
		(canvas.width / 2 - textMetrics.width / 2) | 0,
		24,
	);

	const buffer = canvas.toBuffer("raw");

	window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

	await setTimeout(0);

	last = hrt;
}
