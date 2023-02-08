import sdl from "@kmamal/sdl";
import Canvas from "canvas";

const window = sdl.video.createWindow({ title: "Canvas" });
const { width, height } = window;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0, 0, width, height);
const buffer = canvas.toBuffer("raw");

window.render(width, height, width * 4, "bgra32", buffer);
