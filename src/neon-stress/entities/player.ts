import sdl from "@kmamal/sdl";
import Canvas, { Image } from "canvas";
import type { CanvasRenderingContext2D } from "canvas";
import { Vector2 } from "../lib/vector2.ts";

export class Player {
	image: Image;

	position = new Vector2(0, 0);
	velocity = new Vector2(0, 0);

	shotTimer = 0.2;
	shotTimerMax = 0.2;

	angle = -90;

	constructor(position: Vector2, velocity: Vector2) {
		this.position = position;
		this.velocity = velocity;

		const bufferCanvas = Canvas.createCanvas(96, 64);

		const bufferCtx = bufferCanvas.getContext("2d");
		bufferCtx.imageSmoothingEnabled = false;
		bufferCtx.globalCompositeOperation = "lighter";
		bufferCtx.shadowColor = "red";
		bufferCtx.shadowBlur = 6;

		// Ship
		bufferCtx.globalAlpha = 0.5;
		bufferCtx.strokeStyle = "white";
		bufferCtx.lineWidth = 3;
		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2,
			bufferCanvas.height / 2,
			18,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();

		// Orbs
		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2 - 32,
			bufferCanvas.height / 2,
			6,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();
		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2 + 32,
			bufferCanvas.height / 2,
			6,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();

		// Ship
		bufferCtx.globalAlpha = 0.8;
		bufferCtx.strokeStyle = "green";
		bufferCtx.lineWidth = 8;
		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2,
			bufferCanvas.height / 2,
			18,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();

		// Orbs
		bufferCtx.strokeStyle = "green";
		bufferCtx.lineWidth = 8;
		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2 - 32,
			bufferCanvas.height / 2,
			6,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();

		bufferCtx.beginPath();
		bufferCtx.arc(
			bufferCanvas.width / 2 + 32,
			bufferCanvas.height / 2,
			6,
			0,
			Math.PI * 2,
			true,
		);
		bufferCtx.stroke();

		const sprite = new Image();
		sprite.src = bufferCanvas.toDataURL();

		this.image = sprite;
	}

	update(dt: number) {
		const keyboardState = sdl.keyboard.getState();

		const input = {
			left: false,
			right: false,
			up: false,
			down: false,
		};

		input.left = keyboardState[sdl.keyboard.SCANCODE.LEFT];
		input.right = keyboardState[sdl.keyboard.SCANCODE.RIGHT];
		input.up = keyboardState[sdl.keyboard.SCANCODE.UP];
		input.down = keyboardState[sdl.keyboard.SCANCODE.DOWN];

		if (input.left) {
			this.position.x -= this.velocity.x * dt;
		}

		if (input.right) {
			this.position.x += this.velocity.x * dt;
		}

		if (input.up) {
			this.position.y -= this.velocity.y * dt;
		}

		if (input.down) {
			this.position.y += this.velocity.y * dt;
		}

		this.angle += 2 * dt;

		this.shotTimer -= dt;

		if (this.shotTimer <= 0) {
			this.shotTimer = this.shotTimerMax;

			// spawn bullets
		}
	}

	draw(context: CanvasRenderingContext2D) {
		context.translate(this.position.x, this.position.y);

		context.drawImage(
			this.image,
			-this.image.width / 2,
			-this.image.height / 2,
		);

		context.resetTransform();
	}
}
