import { AudioContext, GainNode } from "node-web-audio-api";
import fs from "node:fs";
import { setTimeout } from "node:timers/promises";

const titleScreenMusicBuffer = fs.createReadStream(
  "assets/audio/title-screen-music.wav",
);

const audioContext = new AudioContext();
const gainNode = new GainNode(audioContext);
gainNode.connect(audioContext.destination);

const titleScreenMusicTrackBuffer = await audioContext.decodeAudioData(
  titleScreenMusicBuffer,
);
const source = audioContext.createBufferSource();
source.buffer = titleScreenMusicTrackBuffer;
source.connect(gainNode);
source.loop = true;

source.start();

await setTimeout(20_000);

source.stop();
audioContext.close();
