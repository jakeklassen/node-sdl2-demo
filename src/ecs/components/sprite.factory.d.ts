import { SetRequired } from "type-fest";
import { Entity } from "../entity.ts";

export type Sprite = SetRequired<
	Partial<NonNullable<Entity["sprite"]>>,
	"frame"
>;
