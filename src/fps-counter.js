import sdl from "@kmamal/sdl";
import { loadImage, registerFont } from "canvas";
import { setTimeout } from "timers/promises";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });
const playerTexture = await loadImage("assets/player-ship.png");

const window = sdl.video.createWindow({
	title: "SDL2 FPS Counter",
	accelerated: true,
	vsync: false,
});

const { width, height } = window;
const stride = width * 4;
const numBytes = stride * height;
const buffer = Buffer.alloc(numBytes, 0);

const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;
const dt = STEP / 1000;
let dtAccumulator = 0;
let last = performance.now();
let tic = Date.now();
let toc;
let frames = 0;

while (!window.destroyed) {
	// Draw to the screen
	window.render(width, height, stride, "rgba32", buffer);

	// Count frames
	{
		frames++;
		toc = Date.now();
		const ellapsed = (toc - tic) / 1e3;

		if (ellapsed >= 1) {
			const fps = Math.round(frames / ellapsed);

			window.setTitle(`FPS: ${fps}`);

			tic = toc;
			frames = 0;
		}
	}

	await setTimeout(0);
}
