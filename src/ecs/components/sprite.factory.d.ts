import { SetRequired } from "type-fest";
import { Entity } from "../entity.js";

export type Sprite = SetRequired<
	Partial<NonNullable<Entity["sprite"]>>,
	"frame"
>;
