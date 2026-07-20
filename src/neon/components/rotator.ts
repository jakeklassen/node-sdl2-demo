import { Component } from "@jakeklassen/ecs";

export class Rotator extends Component {
	value: number;

	constructor(value: number) {
		super();

		this.value = value;
	}
}
