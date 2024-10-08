import "zx/globals";

await $`pnpm packager --include "src/**/*.js" --include "assets/**/*" --include "package*.json" --out-dir dist`;
