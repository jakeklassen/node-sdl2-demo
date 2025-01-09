import Canvas, { CanvasRenderingContext2D, Image } from "canvas";
import { Vector2 } from "../lib/vector2.js";

export class Bullet {
	/**
	 * @type {Image}
	 */
	image;

	/**
	 *
	 * @param {Vector2} position
	 * @param {Vector2} velocity
	 * @param {string} color
	 * @param {number} bulletWidth
	 */
	constructor(position, velocity, color, bulletWidth = 4) {
		this.position = position;
		this.velocity = velocity;
		this.color = color;
		this.bulletWidth = bulletWidth;

		const bufferCanvas = Canvas.createCanvas(64, 64);

		const bufferCtx = bufferCanvas.getContext("2d");
		bufferCtx.imageSmoothingEnabled = false;
		bufferCtx.globalCompositeOperation = "lighter";
		bufferCtx.shadowColor = "red";
		bufferCtx.shadowBlur = 6;

		// Bullet
		bufferCtx.globalAlpha = 0.5;
		bufferCtx.strokeStyle = "white";
		bufferCtx.lineWidth = bulletWidth;
		bufferCtx.beginPath();
		bufferCtx.moveTo(bufferCanvas.width / 2, bufferCanvas.height / 2);
		bufferCtx.lineTo(bufferCanvas.width / 2, bufferCanvas.height / 2 - 15);
		bufferCtx.closePath();
		bufferCtx.stroke();

		// Bullet overlay
		bufferCtx.globalAlpha = 0.8;
		bufferCtx.strokeStyle = color;
		bufferCtx.lineWidth = bulletWidth;
		bufferCtx.beginPath();
		bufferCtx.moveTo(bufferCanvas.width / 2, bufferCanvas.height / 2);
		bufferCtx.lineTo(bufferCanvas.width / 2, bufferCanvas.height / 2 - 15);
		bufferCtx.closePath();
		bufferCtx.stroke();

		const sprite = new Image();
		sprite.src = bufferCanvas.toDataURL();

		this.image = sprite;

		// const bufferWidth = 16;
		// const bufferHeight = 24;
		// const buffer = document.createElement('canvas');
		// buffer.width = bufferWidth;
		// buffer.height = bufferHeight;
		// const renderPosition = new Vector2(bufferWidth / 2, bufferHeight / 2);
		// const context = buffer.getContext('2d')!;
		// context.imageSmoothingEnabled = false;
		// context.globalCompositeOperation = 'lighter';
		// context.globalAlpha = 0.5;
		// context.strokeStyle = 'white';
		// context.lineWidth = this.bulletWidth;
		// context.beginPath();
		// context.moveTo(renderPosition.x, renderPosition.y);
		// context.lineTo(renderPosition.x, renderPosition.y - 15);
		// context.closePath();
		// context.stroke();
		// // Bullet overlay
		// context.globalAlpha = 0.8;
		// context.strokeStyle = this.color;
		// context.lineWidth = this.bulletWidth;
		// context.beginPath();
		// context.moveTo(renderPosition.x, renderPosition.y);
		// context.lineTo(renderPosition.x, renderPosition.y - 15);
		// context.closePath();
		// context.stroke();
		// this.image = buffer;
	}

	/**
	 *
	 * @param {number} dt
	 */
	update(dt) {
		this.position.x += this.velocity.x * dt;
		this.position.y += this.velocity.y * dt;
	}

	/**
	 * @param {CanvasRenderingContext2D} context
	 */
	draw(context) {
		context.translate(this.position.x, this.position.y);
		context.drawImage(
			this.image,
			-this.image.width / 2,
			-this.image.height / 2,
		);

		context.resetTransform();

		// Bullet
		// context.globalAlpha = 0.5;
		// context.strokeStyle = "white";
		// context.lineWidth = this.bulletWidth;
		// context.beginPath();
		// context.moveTo(this.position.x, this.position.y);
		// context.lineTo(this.position.x, this.position.y - 15);
		// context.closePath();
		// context.stroke();

		// // Bullet overlay
		// context.globalAlpha = 0.8;
		// context.strokeStyle = this.color;
		// context.lineWidth = this.bulletWidth;
		// context.beginPath();
		// context.moveTo(this.position.x, this.position.y);
		// context.lineTo(this.position.x, this.position.y - 15);
		// context.closePath();
		// context.stroke();

		// context.drawImage(this.image, this.position.x, this.position.y);
	}
}
