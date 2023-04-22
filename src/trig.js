import sdl from "@kmamal/sdl";
import Canvas, { registerFont } from "canvas";
import { setTimeout } from "timers/promises";
import { Pico8Colors, circ } from "./lib/pico-8.js";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });

const gameWidth = 128;
const gameHeight = 128;
const scale = 4;

const window = sdl.video.createWindow({
  title: "Canvas",
  width: gameWidth * scale,
  height: gameHeight * scale,
  vsync: true,
});

const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const pixel = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 60,
  vy: 60,
  angle: 0,
};

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
};

let tic = 0;
let toc = 0;
let dt = 0;
let last = performance.now();
let frames = 0;

while (!window.destroyed) {
  const hrt = performance.now();
  dt = (hrt - last) / 1000;
  frames++;
  toc = Date.now();

  const elapsed = (toc - tic) / 1e3;
  if (elapsed >= 1) {
    const fps = Math.round(frames / elapsed);

    window.setTitle(`FPS: ${fps}`);

    tic = toc;
    frames = 0;
  }

  const keyboardState = sdl.keyboard.getState();

  if (keyboardState[sdl.keyboard.SCANCODE.ESCAPE]) {
    window.destroy();

    break;
  }

  input.left = keyboardState[sdl.keyboard.SCANCODE.LEFT];
  input.right = keyboardState[sdl.keyboard.SCANCODE.RIGHT];
  input.up = keyboardState[sdl.keyboard.SCANCODE.UP];
  input.down = keyboardState[sdl.keyboard.SCANCODE.DOWN];

  if (input.left) {
    pixel.x -= pixel.vx * dt;
  } else if (input.right) {
    pixel.x += pixel.vx * dt;
  }

  if (input.up) {
    pixel.y -= pixel.vy * dt;
  } else if (input.down) {
    pixel.y += pixel.vy * dt;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.font = "5px PICO-8";
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;

  const textMetrics = context.measureText("Trig Demo");
  context.fillText("Trig Demo", canvas.width / 2 - textMetrics.width / 2, 8);

  context.fillStyle = Pico8Colors.Color5;
  context.textAlign = "left";
  context.fillText(`X: ${pixel.x.toFixed(0)}`, 2, 8);
  context.fillText(`Y: ${pixel.y.toFixed(0)}`, 2, 15);

  context.beginPath();
  // Ewwww have to do this to get a 1px line
  context.moveTo(canvas.width / 2 - textMetrics.width / 2, 10.5);
  context.lineTo(
    canvas.width / 2 - textMetrics.width / 2 + textMetrics.width,
    10.5,
  );
  context.stroke();

  context.fillStyle = Pico8Colors.Color8;
  context.fillRect(pixel.x | 0, pixel.y | 0, 1, 1);

  circ(context, canvas.width / 2, canvas.height / 2, 14, Pico8Colors.Color5);

  const buffer = canvas.toBuffer("raw");

  window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

  last = hrt;

  await setTimeout(0);
}
