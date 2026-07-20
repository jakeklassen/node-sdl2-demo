# Node.js SDL2

## TypeScript, without a build step

Sources are `.ts` and run **directly on Node** — there is no compile step and no
bundler. Node 26 executes them via native **type stripping**, so `node src/…​.ts`
just works, and the packager ships the `.ts` files as-is.

Two consequences worth knowing:

- **Relative imports use real `.ts` extensions** (`import { x } from "./lib/foo.ts"`).
  Node resolves the literal path — it will not rewrite `.js` to `.ts` for you.
- **Only erasable syntax is allowed.** Node strips types, it does not transform
  them, so no `enum`, `namespace`, parameter properties, or decorators.
  `tsconfig.json` sets `erasableSyntaxOnly: true` so `tsc` catches these at
  typecheck time rather than letting them explode at runtime.

`tsc` is used purely as a type checker (`noEmit`); it never produces output.

### DOM globals leak in — the linter is what guards against them

This is a Node project, so browser globals (`Image`, `document`, …) should not be
in scope. `tsconfig.json` sets `"lib": ["ESNext"]` to say so, **but that does not
actually exclude the DOM.** `node-web-audio-api`'s `index.d.ts` contains
`/// <reference lib="dom" />`, and that directive unconditionally pulls
`lib.dom.d.ts` into the program no matter what `lib` says. Nothing in tsconfig
can override it.

This is not academic: `neon-stress/index.ts` called `new Image()` without
importing it, and typechecked cleanly for exactly this reason — while being a
guaranteed `ReferenceError: Image is not defined` at runtime, since Node has no
global `Image`. The fix was to import `Image` from `canvas`.

So the real guard is **oxlint**, which has its own environment model: `.oxlintrc.json`
enables `no-undef` with `env: { builtin, node }` and no browser env, which does
flag browser globals. Keep that rule on.

Note the fix is always to **import** the real thing (`import { Image } from "canvas"`),
never to declare a global that makes the DOM version resolve. Node has no global
`Image` at runtime, so any such declaration would be a lie about the runtime — it
would silence the type error while leaving the `ReferenceError` in place.

Relatedly, `scripts/build.ts` uses explicit named imports from `zx` rather than
`import "zx/globals"`. The globals form would need every injected name (`$`, `echo`,
`fs`, `path`, …) declared in lint config and kept in sync by hand; importing what
we use needs no configuration at all.

## Scripts

| Script            | What it does                                                   |
| ----------------- | -------------------------------------------------------------- |
| `pnpm typecheck`  | `tsc --noEmit` — types only, emits nothing                     |
| `pnpm lint`       | `oxlint --type-aware` (type-aware rules via `oxlint-tsgolint`) |
| `pnpm lint:fix`   | same, applying autofixes                                       |
| `pnpm format`     | `oxfmt --check .` — fails if anything is unformatted           |
| `pnpm format:fix` | `oxfmt .` — formats in place                                   |
| `pnpm build`      | Bundles a standalone app into `dist/` (see below)              |

Formatting is [oxfmt](https://www.npmjs.com/package/oxfmt); its `.oxfmtrc.json`
was generated with `oxfmt --migrate=prettier` from the old `.prettierrc`, so the
house style (tabs, `trailingComma: all`, semicolons) is unchanged. Prettier is no
longer used.

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

`pnpm build` runs [`scripts/build.ts`](./scripts/build.ts), a small local packager
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
