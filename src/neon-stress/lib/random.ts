export const getRandom = (max: number, min = 0): number =>
	Math.floor(Math.random() * max) + min;
