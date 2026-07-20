import ffmpeg from "ffmpeg-static";
import { spawn } from "node:child_process";

/**
 * Decode an audio file to raw 32-bit float PCM using ffmpeg.
 */
export const loadAudio = async (
	path: string,
	{ channels, frequency }: { channels?: number; frequency?: number },
): Promise<Buffer> => {
	// `ffmpeg-static` is CJS (`module.exports = <path>`) but ships ESM-style
	// typings, so under NodeNext the default import is typed as the module
	// namespace instead of the path string.
	const ffmpegPath = ffmpeg as unknown as string | null;

	const proc = spawn(
		ffmpegPath!,
		[
			["-i", path],
			channels && ["-ac", channels],
			frequency && ["-ar", frequency],
			["-f", "f32le"],
			["-c:a", "pcm_f32le"],
			"-",
		].flat() as string[],
	);

	const chunks: Buffer[] = [];

	proc.stdout.on("data", (chunk: Buffer) => {
		chunks.push(chunk);
	});

	return await new Promise<Buffer>((resolve, reject) => {
		proc.on("close", (code) => {
			if (code) {
				reject(new Error(`exit code ${code}`));
			} else {
				resolve(Buffer.concat(chunks));
			}
		});
	});
};
