import sdl from "@kmamal/sdl";
import Canvas, { loadImage, registerFont } from "canvas";
import { setTimeout } from "timers/promises";

registerFont("assets/fonts/pico-8.ttf", { family: "PICO-8" });
const playerTexture = await loadImage("assets/player-ship.png");

const gameWidth = 128;
const gameHeight = 128;
const scale = 4;

const window = sdl.video.createWindow({
  title: "SDL2 Movement",
  accelerated: true,
  width: gameWidth * scale,
  height: gameHeight * scale,
  vsync: true,
});

const canvas = Canvas.createCanvas(gameWidth, gameHeight);

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

const player1 = {
  sprite: playerTexture,
  boxCollider: {
    offsetX: 0,
    offsetY: 0,
    width: playerTexture.width,
    height: playerTexture.height,
  },
  x: Math.floor(gameWidth / 2 - playerTexture.width / 2),
  y: Math.floor(gameHeight / 2 - playerTexture.height / 2) - 8,
  dx: 0,
  dy: 0,
  vx: 60,
  vy: 60,
};

const player2 = {
  sprite: playerTexture,
  boxCollider: {
    offsetX: 0,
    offsetY: 0,
    width: playerTexture.width,
    height: playerTexture.height,
  },
  x: Math.floor(gameWidth / 2 - playerTexture.width / 2),
  y: Math.floor(gameHeight / 2 - playerTexture.height / 2) + 8,
  dx: 0,
  dy: 0,
  vx: 60,
  vy: 60,
};

const players = [player1, player2];

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
};

const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;
const dt = STEP / 1000;
let dtAccumulator = 0;
let last = performance.now();

while (!window.destroyed) {
  const hrt = performance.now();

  dtAccumulator += hrt - last;

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
    for (const player of players) {
      player.dx = 0;
      player.dy = 0;

      if (input.left) {
        player.dx = -1;
      } else if (input.right) {
        player.dx = 1;
      }

      if (input.up) {
        player.dy = -1;
      } else if (input.down) {
        player.dy = 1;
      }

      player.x += player.dx * player.vx * dt;
      player.y += player.dy * player.vy * dt;

      if (player.x < 0) {
        player.x = 0;
        player.dx = 1;
      } else if (player.x > gameWidth - player.boxCollider.width) {
        player.x = gameWidth - player.boxCollider.width;
        player.dx = -1;
      }

      if (player.y < 0) {
        player.y = 0;
        player.dy = 1;
      } else if (player.y > gameHeight - player.boxCollider.height) {
        player.y = gameHeight - player.boxCollider.height;
        player.dy = -1;
      }
    }

    dtAccumulator -= STEP;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  context.font = "5px PICO-8";
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;

  const textMetrics = context.measureText("Movement");
  context.fillText("Movement", canvas.width / 2 - textMetrics.width / 2, 8);

  context.drawImage(player1.sprite, player1.x | 0, player1.y | 0);
  context.drawImage(player2.sprite, player2.x, player2.y);

  const buffer = canvas.toBuffer("raw");

  window.render(gameWidth, gameHeight, gameWidth * 4, "bgra32", buffer);

  await setTimeout(0);

  last = hrt;
}
