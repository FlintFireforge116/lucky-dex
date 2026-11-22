# Steam Siege XY11 — generated cost assertion hotfix (v0.69.391b)

**Symptom:** strict `--full` preflight stopped with `actual: ['C','GC']` versus `expected: [['C'],['G','C']]`.

**Root cause:** source generator emits symbol arrays. The shared `tcg-classic-battle-data.js` registry intentionally compacts attack costs to symbol strings, mutating nested attack objects in place. `v07391` expected the pre-registration array even after importing `tcgp-battle-core.js`. `v07390` also assumed arrays and could fail its `.join` calls when registry was loaded.

**Fix:** both generated-data assertions normalise actual and expected into the exact printed energy sequence; neither the card generator nor game engine is changed. New source-only regression confirms registry mutation and preserves the printed symbols.

**Release:** remains `0.69.391`. Apply this patch over v0.69.391, then rerun `python3 scripts/preflight-xy11-release.py --full` before push. No APK build or full official catalogue test has been observed successful in this environment.
