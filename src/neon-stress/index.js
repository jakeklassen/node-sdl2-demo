import sdl from "@kmamal/sdl";
import Canvas, { registerFont } from "canvas";
import { setTimeout } from "timers/promises";
import { DEG_TO_RAD } from "../lib/math.js";
import { Bullet } from "./entities/bullet.js";
import { Player } from "./entities/player.js";
import { getRandom } from "./lib/random.js";
import { Vector2 } from "./lib/vector2.js";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });

const GAME_WIDTH = 640;
const GAME_HEIGHT = 360;
const SCALE = 2;

const gameWidth = GAME_WIDTH * SCALE;
const gameHeight = GAME_HEIGHT * SCALE;

const window = sdl.video.createWindow({
	title: "Neon Effect",
	accelerated: true,
	width: gameWidth,
	height: gameHeight,
	fullscreen: false,
	vsync: false,
});

const canvas = Canvas.createCanvas(GAME_WIDTH, GAME_HEIGHT);

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
context.globalCompositeOperation = "lighter";
context.antialias = "none";
context.quality = "nearest";

const player = new Player(
	new Vector2(canvas.width / 2, canvas.height - 100),
	new Vector2(300, 300),
);

function generateImages() {
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

	const square = new Image();
	square.src = bufferCanvas.toDataURL();

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

	const player = new Image();
	player.src = bufferCanvas.toDataURL();

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

	const shipNavigator = new Image();
	shipNavigator.src = bufferCanvas.toDataURL();

	bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
}

const COLORS = ["red", "green", "blue", "cyan", "yellow", "magenta"];

const bullets = Array.from(
	{ length: 1_000 },
	() =>
		new Bullet(
			new Vector2(
				getRandom(canvas.width),
				getRandom(canvas.height, canvas.height * 1.5),
			),
			new Vector2(0, -getRandom(650, 50)),
			COLORS[getRandom(COLORS.length)],
			2,
		),
);

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

	while (dtAccumulator >= STEP) {
		dtAccumulator -= STEP;
	}

	player.update(variableDt);

	for (const bullet of bullets) {
		bullet.update(variableDt);
	}

	context.clearRect(0, 0, canvas.width, canvas.height);

	// context.shadowColor = "red";
	// context.shadowBlur = 6;

	player.draw(context);

	for (const bullet of bullets) {
		bullet.draw(context);
	}

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

	window.render(GAME_WIDTH, GAME_HEIGHT, GAME_WIDTH * 4, "bgra32", buffer);

	await setTimeout(0);

	last = hrt;
}
