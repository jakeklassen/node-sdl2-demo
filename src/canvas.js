import sdl from "@kmamal/sdl";
import Canvas, { loadImage } from "canvas";
import { setTimeout } from "timers/promises";

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

const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

/**
 * Draw the sprite with the flash effect
 * @param {Canvas.CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} spriteWidth
 * @param {number} spriteHeight
 * @param {string} color
 * @param {number} flashDuration
 * @param {number} time
 */
function drawFlashingSprite(
  context,
  x,
  y,
  spriteWidth,
  spriteHeight,
  color,
  flashDuration,
  time,
) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate the alpha value based on the flashing duration
  const alpha = (Math.sin((time / flashDuration) * Math.PI * 2) + 1) / 2; // oscillate between 0 and 1

  // Convert the color from hex to RGBA
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  const rgba = `rgba(${red},${green},${blue},${alpha})`;

  context.save();
  // Set the "lighter" composite operation to brighten the sprite
  context.globalCompositeOperation = "destination-atop";

  // Draw the sprite with the color tint applied
  context.fillStyle = rgba;
  context.fillRect(x, y, spriteWidth, spriteHeight);

  // Draw the sprite on top of the color tint
  context.drawImage(ship, x, y, spriteWidth, spriteHeight);
  context.restore();
}

const flashDuration = 200;
const flashColor = "#ffffff";

while (!window.destroyed) {
  drawFlashingSprite(
    ctx,
    Math.floor(gameWidth / 2 - ship.width / 2),
    Math.floor(gameHeight / 2 - ship.height / 2),
    ship.width,
    ship.height,
    flashColor,
    flashDuration,
    performance.now(),
  );

  ctx.drawImage(
    ship,
    Math.floor(gameWidth / 2 - ship.width / 2),
    Math.floor(gameHeight / 2 - ship.height / 2) + 20,
  );

  const buffer = canvas.toBuffer("raw");

  window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

  await setTimeout(0);
}
