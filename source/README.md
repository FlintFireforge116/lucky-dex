# LuckyDex canonical source

This directory is the canonical LuckyDex project. Build and test from here rather than from a committed source ZIP.

## Android build

```bash
gradle --no-daemon :app:assembleDebug
```

GitHub Actions provisions Java 17 and Gradle 8.9 before running this command. The build verifies/regenerates required local assets during Gradle preBuild. Generated APKs and other release artifacts belong outside the canonical source tree.

## Tests

```bash
npm ci
npm test
```

`npm test` runs the active Node regression programs plus offline asset-integrity checks. Browser tests require the Playwright dependency declared in `package.json`.

## Repository inputs

The `data/`, `reference/`, root `card-art-index.json`, runtime assets, active tests and scripts are retained because build/development tooling consumes them. Historical test reports, delivery ZIPs/APKs, obsolete Codex prompts and generated `artifacts/` output are intentionally excluded from canonical source.

## Release history

See [`docs/RELEASE_HISTORY.md`](docs/RELEASE_HISTORY.md).
