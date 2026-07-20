# Node.js SDL2

## 3D / WebGL: intentionally not used

This project has **no 3D dependency**, on purpose. `@kmamal/gl` (WebGL) and
`@kmamal/gpu` (WebGPU) were both evaluated and removed. Rendering here is 2D via
`@kmamal/sdl` + `canvas` / `@napi-rs/canvas`.

Please don't re-add either without reading this — both have real costs on Node 26+:

- **`@kmamal/gl`** publishes prebuilts only up to Node ABI 131 (Node 23); Node 26
  is ABI 147, so it always **compiles from source**. That build fails twice over:
  its bundled ANGLE gyp passes the clang-only flag `-Wshorten-64-to-32` (Node 26's
  official binary is clang-built, so node-gyp records `clang=1` even when your
  compiler is GCC), and its `nan@2.22.x` floor uses V8 APIs Node 26 deleted
  (`AccessControl`, `SetPrototype`, `WriteUtf8`, …). Making it work needed a
  `nan@2.27.0` override **plus** a patch to its ANGLE gyp — both since removed.
- **`@kmamal/gpu`** installs cleanly (prebuilt, N-API, no ABI pinning), but at
  `0.2.1` its `texture.createView()` is broken — every descriptor fails with
  `swizzle used without the FeatureName::TextureComponentSwizzle feature enabled`.
  That rules out depth buffers, sampled textures, and offscreen render targets;
  only trivial convex geometry renders correctly.

If you ever need 3D again, re-check both: whether `@kmamal/gl` ships prebuilts for
your ABI (`npm view @kmamal/gl dependencies`, and the release assets on GitHub),
and whether `@kmamal/gpu` has fixed `createView()`.

## Packaging the app (`pnpm build`)

`pnpm build` runs [`scripts/build.js`](./scripts/build.js), a small local packager
that bundles a standalone Node.js runtime + this app + its production
`node_modules` into `dist/<name>-<version>-<platform>-<arch>/` with a launcher
script. Run the result with `./dist/<name>-<version>-<platform>-<arch>/<name>`.

It replaces `@kmamal/packager` (removed). That tool installs the bundle's deps
with **npm**, which ignores this repo's pnpm config — a real problem back when we
depended on pnpm `overrides`/`patchedDependencies` to build `@kmamal/gl`. Those
pins are gone now, but the local packager is kept because it's dependency-free
(zx + built-ins) and installs with the same pnpm + lockfile as local dev.

What it does:

1. Downloads the matching Node.js runtime from `nodejs.org`.
2. Copies app files (`src/**`, `assets/**`, `package.json`) plus
   `pnpm-workspace.yaml` and `pnpm-lock.yaml`.
3. Runs `pnpm install --prod --frozen-lockfile` in the staging dir.
4. Forces `nodeLinker: hoisted` for the bundle only, producing a flat,
   symlink-free `node_modules` that stays valid when copied to another machine
   (the repo itself keeps pnpm's default isolated linker for dev).

Limitations: builds for the host platform/arch only (native modules compile with
the local toolchain — no cross-compiling), supports linux/macOS, and outputs an
unzipped directory.


## Canvas Libs to Try

- [canvas](https://github.com/Automattic/node-canvas)
  - No `filter` support
- [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)

## Audio Libs to Try

- [audic](https://github.com/Richienb/audic)
- [naudiodon](https://www.npmjs.com/package/naudiodon)
- [node-web-audio-api](https://github.com/ircam-ismm/node-web-audio-api)
  - This looks very good. It aims to support `AudioContext` natively. No types though 😔
