import { Component } from "@jakeklassen/ecs";
import type { Image } from "canvas";

export class Sprite extends Component {
	image: Image;

	constructor(image: Image) {
		super();

		this.image = image;
	}
}
