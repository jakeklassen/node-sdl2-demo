#!/usr/bin/env zx
// Explicit named imports rather than `import "zx/globals"`. Injected globals
// would force every consumer (lint's no-undef, readers) to know zx's global
// surface; importing what we use keeps it greppable and needs no lint config.
import { $, cd, echo, fs, glob, os, path, within } from "zx";

/**
 * Local application packager.
 *
 * A trimmed, vendored replacement for `@kmamal/packager` (removed). It does the
 * same job — bundle a standalone Node.js runtime + this app + its production
 * `node_modules` into `dist/<name>-<version>-<platform>-<arch>/` with a launcher
 * script — but installs the bundle's dependencies with **pnpm**, not npm.
 *
 * `@kmamal/packager` shelled out to `npm install`, which ignores this repo's
 * pnpm config. That broke the bundle build back when we relied on pnpm
 * `overrides`/`patchedDependencies` to compile `@kmamal/gl` on Node 26. Those
 * pins are gone (see README "3D / WebGL: intentionally not used"), but this
 * packager is kept: it needs no dependencies (zx + Node built-ins) and installs
 * from the same pnpm + lockfile as local dev.
 *
 * Notes / limitations:
 * - Builds for the host platform/arch only (native modules are compiled with the
 *   local toolchain — no cross-compiling).
 * - Supports linux/macOS. Windows packaging is intentionally not implemented.
 * - Output is an unzipped directory (handier for local runs than a zip).
 */

const projectPath = path.resolve(process.cwd());
const pkg = await fs.readJson(path.join(projectPath, "package.json"));

const name = pkg.name ?? "app";
const version = pkg.version ?? "0.0.0";
const platform = process.platform; // e.g. "linux"
const arch = process.arch; // e.g. "x64"
const nodeVersion = process.version; // e.g. "v26.3.0"
const outDir = path.resolve(projectPath, "dist");
const targetName = `${name}-${version}-${platform}-${arch}`;

if (platform === "win32") {
	throw new Error("This local packager supports linux/macOS only.");
}

// Files from THIS project that go into the bundle (app code + assets + manifest).
// Sources are .ts and run directly on the bundled Node via native type stripping
// — nothing is compiled, so the .ts files themselves must ship.
const includes = ["src/**/*.ts", "assets/**/*", "package.json"];

// pnpm config that must travel with the project so the staged install resolves
// deps identically to local dev (same lockfile, same allowBuilds gating).
const pnpmConfigFiles = ["pnpm-workspace.yaml", "pnpm-lock.yaml"];

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "packager-"));
try {
	echo(
		`Packaging ${name}@${version} for ${platform}-${arch} (node ${nodeVersion})`,
	);

	// 1. Download + extract a standalone Node.js runtime for the bundle.
	const archive = `node-${nodeVersion}-${platform}-${arch}.tar.xz`;
	const url = `https://nodejs.org/dist/${nodeVersion}/${archive}`;
	const downloadDir = path.join(tmpDir, "download");
	await fs.ensureDir(downloadDir);

	echo(`Downloading ${url}`);
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`Failed to download Node.js runtime: ${res.status} ${res.statusText} (${url})`,
		);
	}
	const archivePath = path.join(downloadDir, archive);
	await fs.writeFile(archivePath, Buffer.from(await res.arrayBuffer()));

	echo(`Extracting ${archive}`);
	await $`tar -xJf ${archivePath} -C ${downloadDir}`;
	const nodeDir = path.join(downloadDir, archive.replace(/\.tar\.xz$/u, ""));
	const nodeBin = path.join(nodeDir, "bin", "node");

	// 2. Build the staging layout:
	//    <targetName>/
	//      <name>              <- launcher script
	//      bundle/
	//        node              <- the runtime
	//        project/          <- app files + node_modules
	const outRoot = path.join(tmpDir, "stage", targetName);
	const bundleDir = path.join(outRoot, "bundle");
	const projectDir = path.join(bundleDir, "project");
	await fs.ensureDir(projectDir);

	await fs.copy(nodeBin, path.join(bundleDir, "node"));

	// Launcher: run from INSIDE the project dir so the app's relative asset
	// paths (e.g. "assets/fonts/...") resolve the same way they do in dev (cwd =
	// project root). Hand off to the bundled node running the project directory
	// (uses package.json "main"). Forwards any CLI args.
	const launcher = [
		"#!/usr/bin/env bash",
		"set -eEu -o pipefail",
		'DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"',
		'cd "$DIR/bundle/project"',
		'exec "$DIR/bundle/node" . "$@"',
		"",
	].join("\n");
	const launcherPath = path.join(outRoot, name);
	await fs.writeFile(launcherPath, launcher);
	await fs.chmod(launcherPath, 0o755);

	// Copy app files.
	const files = await glob(includes, { cwd: projectPath });
	for (const file of files) {
		await fs.copy(path.join(projectPath, file), path.join(projectDir, file));
	}

	// Copy pnpm config alongside the app.
	for (const cfg of pnpmConfigFiles) {
		const src = path.join(projectPath, cfg);
		if (await fs.pathExists(src)) {
			await fs.copy(src, path.join(projectDir, cfg));
		}
	}

	// Force a flat, npm-style node_modules for the bundle (no `.pnpm` symlink
	// store) so it's trivially portable. We only do this for the bundle — the
	// repo keeps pnpm's default isolated linker for dev. Setting it in the
	// workspace file is what actually takes effect (a copied workspace file
	// makes pnpm ignore `--node-linker` / `.npmrc`).
	await fs.appendFile(
		path.join(projectDir, "pnpm-workspace.yaml"),
		"\nnodeLinker: hoisted\n",
	);

	// 3. Install production deps with pnpm, matching local dev's lockfile
	//    (nodeLinker: hoisted is set in the staging workspace file above).
	echo("Installing production node_modules with pnpm");
	await fs.remove(path.join(projectDir, "node_modules"));
	await within(async () => {
		cd(projectDir);
		await $`pnpm install --prod --frozen-lockfile`;
	});

	// 4. Move the finished bundle into ./dist.
	await fs.ensureDir(outDir);
	const finalDir = path.join(outDir, targetName);
	await fs.remove(finalDir);
	await fs.move(outRoot, finalDir);

	echo("");
	echo(`✔ Bundle ready: ${path.relative(projectPath, finalDir)}`);
	echo(
		`  Run it with:  ./${path.relative(projectPath, path.join(finalDir, name))}`,
	);
} finally {
	await fs.remove(tmpDir);
}
