import { Image } from "canvas";

export interface Sprite {
	image: Image;
	x: number;
	y: number;
	flash: boolean;
	flashDuration: number;
}
