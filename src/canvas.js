import sdl from "@kmamal/sdl";
import Canvas, { loadImage } from "canvas";

const ship = await loadImage("assets/player-ship.png");

const gameWidth = 128;
const gameHeight = 128;
const scale = 4;

const window = sdl.video.createWindow({
  title: "Canvas",
  width: gameWidth * scale,
  height: gameHeight * scale,
  vsync: true,
});

const { width, height } = window;
const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

ctx.fillStyle = "black";
ctx.fillRect(0, 0, gameWidth, gameHeight);
ctx.drawImage(
  ship,
  canvas.width / 2 - ship.width / 2,
  canvas.height / 2 - ship.height / 2,
);

const buffer = canvas.toBuffer("raw");

window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);
