import { Component } from "@jakeklassen/ecs";

export class Velocity2d extends Component {
	x = 0;
	y = 0;

	constructor(x = 0, y = 0) {
		super();

		this.x = x;
		this.y = y;
	}

	flipX() {
		this.x *= -1;
	}

	flipY() {
		this.y *= -1;
	}
}
