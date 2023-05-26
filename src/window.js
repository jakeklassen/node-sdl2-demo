import sdl from "@kmamal/sdl";

console.log(sdl.video);

const window = sdl.video.createWindow({
	title: "Hello, World!",
	accelerated: true,
	resizable: true,
});

window.on("*", console.log);
