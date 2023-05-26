import sdl from "@kmamal/sdl";
import path from "node:path";
import { loadAudio } from "./lib/ffmpeg.js";

const channels = 1;
const frequency = 48e3;

const audioInstance = sdl.audio.openDevice({ type: "playback" });

console.log(sdl.audio.devices);

const dir = path.dirname(import.meta.url);
const buffer = await loadAudio(
	path.join(dir, "assets/audio/title-screen-music.wav"),
	{
		channels,
		frequency,
	},
);

console.log(buffer);

audioInstance.enqueue(buffer);
audioInstance.play();

audioInstance.close();
