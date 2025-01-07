import { Component } from "@jakeklassen/ecs";
import { Image } from "canvas";

export class Sprite extends Component {
	/**
	 * @type {Image}
	 */
	image;

	/**
	 *
	 * @param {Image} image
	 */
	constructor(image) {
		super();

		this.image = image;
	}
}
