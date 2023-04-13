import sdl from "@kmamal/sdl";
import Canvas, { loadImage, registerFont } from "canvas";
import { setTimeout } from "timers/promises";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });

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

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

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

/**
 *
 * @param {Canvas.CanvasRenderingContext2D} context
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} color
 */
function fillPixelatedCircle(context, cx, cy, r, color) {
  r |= 0; // floor radius

  // context.setTransform(1, 0, 0, 1, 0, 0); // ensure default transform

  var x = r,
    y = 0,
    dx = 1,
    dy = 1;

  var err = dx - (r << 1);
  var x0 = (cx - 1) | 0,
    y0 = cy | 0;
  var lx = x,
    ly = y;

  context.fillStyle = color;

  context.beginPath();

  while (x >= y) {
    context.rect(x0 - x, y0 + y, x * 2 + 2, 1);
    context.rect(x0 - x, y0 - y, x * 2 + 2, 1);
    if (x !== lx) {
      context.rect(x0 - ly, y0 - lx, ly * 2 + 2, 1);
      context.rect(x0 - ly, y0 + lx, ly * 2 + 2, 1);
    }
    lx = x;
    ly = y;
    y++;
    err += dy;
    dy += 2;
    if (err > 0) {
      x--;
      dx += 2;
      err += (-r << 1) + dx;
    }
  }
  if (x !== lx) {
    context.rect(x0 - ly, y0 - lx, ly * 2 + 1, 1);
    context.rect(x0 - ly, y0 + lx, ly * 2 + 1, 1);
  }
  context.fill();
}

/**
 * Implementation of the PICO-8 `circfill` function
 * @param {Canvas.CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} color
 */
function fillCircle(context, x, y, radius, color) {
  let x1 = 0;
  let y1 = radius;
  let diameter = 3 - 2 * radius;

  while (x1 <= y1) {
    // Draw horizontal lines of the circle
    for (let i = -x1; i <= x1; i++) {
      context.fillStyle = color;
      context.fillRect(x + i, y + y1, 1, 1);
      context.fillRect(x + i, y - y1, 1, 1);
    }

    // Draw vertical lines of the circle
    for (let i = -y1; i <= y1; i++) {
      context.fillStyle = color;
      context.fillRect(x + i, y + x1, 1, 1);
      context.fillRect(x + i, y - x1, 1, 1);
    }

    if (diameter < 0) {
      diameter = diameter + 4 * x1 + 6;
    } else {
      diameter = diameter + 4 * (x1 - y1) + 10;
      y1--;
    }

    x1++;
  }
}

const flashDuration = 200;
const flashColor = "#ffffff";

const tintCanvas = Canvas.createCanvas(gameWidth, gameHeight);

const tintContext = tintCanvas.getContext("2d");
tintContext.imageSmoothingEnabled = false;

const bufferCanvas = Canvas.createCanvas(gameWidth, gameHeight);

const bufferContext = bufferCanvas.getContext("2d");
bufferContext.imageSmoothingEnabled = false;

/**
 *
 * @param {Canvas.CanvasRenderingContext2D} context
 * @param {number} time
 * @param {string} flashColor
 */
function drawSprites(context, time, flashColor) {
  // Clear the canvas
  tintContext.clearRect(0, 0, tintCanvas.width, tintCanvas.height);
  bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

  tintContext.save();

  // Loop through each sprite and draw it
  for (const sprite of sprites) {
    // Calculate the alpha value based on the flashing duration and the sprite's flash flag
    const alpha = sprite.flash
      ? (Math.sin((time / sprite.flashDuration) * Math.PI * 2) + 1) / 2
      : 1; // oscillate between 0 and 1 if flash is true, else use 1

    // Convert the flashColor from hex to RGBA
    const red = parseInt(flashColor.substring(1, 3), 16);
    const green = parseInt(flashColor.substring(3, 5), 16);
    const blue = parseInt(flashColor.substring(5, 7), 16);
    const rgba = `rgba(${red},${green},${blue},${alpha})`;

    // Draw the sprite with the color tint applied if flash is true
    if (sprite.flash) {
      tintContext.fillStyle = rgba;
      // tintContext.fillRect(
      //   sprite.x,
      //   sprite.y,
      //   sprite.image.width,
      //   sprite.image.height
      // );

      tintContext.beginPath();
      tintContext.arc(
        sprite.x + sprite.image.width / 2,
        sprite.y + sprite.image.height / 2,
        4,
        0,
        2 * Math.PI,
      );
      tintContext.fill();
    }

    bufferContext.drawImage(
      sprite.image,
      sprite.x,
      sprite.y,
      sprite.image.width,
      sprite.image.height,
    );
  }

  tintContext.globalCompositeOperation = "destination-atop";

  tintContext.drawImage(bufferCanvas, 0, 0);

  tintContext.restore();

  context.drawImage(tintCanvas, 0, 0);
}

/**
 * @type {import("./sprite.js").Sprite[]}
 */
const sprites = [
  {
    image: ship,
    x: Math.floor(canvas.width / 2 - ship.width / 2),
    y: Math.floor(canvas.height / 2 - ship.height / 2),
    flash: true,
    flashDuration: 200,
  },
  {
    image: ship,
    x: Math.floor(canvas.width / 2 - ship.width / 2),
    y: Math.floor(canvas.height / 2 - ship.height / 2) + 20,
    flash: true,
    flashDuration: 200,
  },
  {
    image: ship,
    x: Math.floor(canvas.width / 2 - ship.width / 2) + 4,
    y: Math.floor(canvas.height / 2 - ship.height / 2) + 24,
    flash: true,
    flashDuration: 400,
  },
];

while (!window.destroyed) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawSprites(context, performance.now(), flashColor);

  context.drawImage(
    ship,
    Math.floor(gameWidth / 2 - ship.width / 2),
    Math.floor(gameHeight / 2 - ship.height / 2) + 40,
  );

  context.font = "5px PICO-8";
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;

  context.beginPath();
  // Ewwww have to do this to get a 1px line
  context.moveTo(40, 10.5);
  context.lineTo(50, 10.5);
  context.stroke();

  context.fillRect(55, 10, 1, 1);

  context.beginPath();
  context.arc(10, 10, 5, 0, 2 * Math.PI);
  context.fill();

  fillCircle(context, 10, 30, 1, "#ffffff");
  fillCircle(context, 16, 30, 2, "#ffffff");
  fillCircle(context, 24, 30, 3, "#ffffff");
  fillCircle(context, 36, 30, 4, "#ffffff");
  fillCircle(context, 48, 30, 5, "#ffffff");
  fillCircle(context, 66, 30, 6, "#ffffff");
  fillCircle(context, 84, 30, 7, "#ffffff");
  fillCircle(context, 104, 30, 8, "#ffffff");

  context.fillText("Hello World!", 10, 50);
  context.fillStyle = "#ff004d";
  context.fillText("GAME OVER", 10, 60);

  const buffer = canvas.toBuffer("raw");

  window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

  await setTimeout(0);
}
