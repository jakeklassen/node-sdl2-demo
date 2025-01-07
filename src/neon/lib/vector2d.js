export class Vector2d {
	static zero() {
		return new Vector2d(0, 0);
	}

	x = 0;
	y = 0;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}
