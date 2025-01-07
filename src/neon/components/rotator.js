import { Component } from "@jakeklassen/ecs";

export class Rotator extends Component {
	/** @type {number} */
	value;

	/**
	 *
	 * @param {number} value
	 */
	constructor(value) {
		super();

		this.value = value;
	}
}
