export type Frame = {
	sourceX: number;
	sourceY: number;
	width: number;
	height: number;
};

export type HexColor = `#${string}`;

type Sprite = {
	frame: Frame;
	layer: number;
	opacity: number;
	paletteSwaps: Array<[from: HexColor, to: HexColor]>;
};

type Transform = {
	position: Vector2d;
	scale: Vector2d;
	rotation: number;
};

type Vector2d = {
	x: number;
	y: number;
};

export type Entity = {
	direction?: Vector2d;
	sprite?: Sprite;
	star?: {
		color: string;
	};
	tagBullet?: true;
	tagPlayer?: true;
	transform?: Transform;
	velocity?: Vector2d;
};
