import { Vector2d } from "../lib/vector2d.js";
import { Component } from "@jakeklassen/ecs";

export class Transform2d extends Component {
	position = Vector2d.zero();
	rotation = 0;

	constructor(position = Vector2d.zero()) {
		super();
		this.position = position;
	}
}
