export class Timer {
	#duration = 0;
	#elapsed = 0;
	#isExpired = false;

	constructor(duration: number) {
		this.#duration = duration;
	}

	get isExpired() {
		return this.#isExpired;
	}

	update(dt: number) {
		this.#elapsed += dt;

		if (this.#elapsed >= this.#duration) {
			this.#isExpired = true;
		}
	}

	reset() {
		this.#elapsed = 0;
		this.#isExpired = false;
	}
}
