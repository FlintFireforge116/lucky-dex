# Lucky Dex v0.16.5 validation report

## Scope
v0.16.5 integrates the validated physical-card artwork catalogue into LuckyDex without publishing the multi-GB draft artwork release. A compact exact metadata index is generated from the same pinned upstream snapshot used by the successful full-library build.

## Deterministic artwork path
- `.github/workflows/build-card-art-index.yml` checks out `type-null/PTCG-database` at commit `18e0de2feb7a35ebe4296ede0ba6cc768961489b`.
- The workflow refuses to publish the index unless it contains exactly **199 sets / 21,337 card records**, with no duplicate canonical IDs and no missing image/name records.
- My First Battle is represented by the validated 48 distinct physical print identities.
- McDonald's Collection 2013 is represented by the validated 12 French cards using the clean TCG Collector source URLs.
- Runtime matching accepts only an exact canonical ID or an unambiguous set + collector number + normalized name identity. Ambiguous matches return no artwork.
- Existing physical binder cards may resolve through exact set name + number + name, allowing the fix to apply to previously collected cards too.
- Legacy remote resolvers remain transition-only fallbacks when `card-art-index.json` cannot be loaded.

## Offline-ready layer
`MainActivity.java` includes an optional app-private set-pack installer for future hosted ZIP packs. Downloads are HTTPS-only, capped in size, optionally SHA-256 verified, ZIP-slip checked, manifest validated and served back to the WebView from the synthetic `https://luckydex.local/card-art/` host.

## Save compatibility
New index-native pulls carry canonical library identity metadata. When a unique legacy physical owned card has the same exact set name, collector number and card name, the pull merges into that owned entry instead of automatically creating a duplicate due only to a catalogue-ID change. Ambiguous legacy identities are not merged.

## Checks performed
- `node --check` passed for all JavaScript under `app/src/main/assets/`.
- Active HTML script references point to `card-art-library-v0165.js`, `pack-flow-v0165.js` and `app-v0165.js`; inactive v0.16.4 app/pack-flow scripts are absent.
- Android version metadata is `versionCode 165` / `versionName 0.16.5`.
- `MainActivity.java` was syntax/type sanity-compiled against lightweight Android/JSON stubs; compilation completed with only a deprecation warning. This is not a substitute for a real Android build.
- The index workflow YAML parses and its embedded Python compiles locally.
- A real debug APK build is intentionally delegated to the existing GitHub Actions APK workflow after `LuckyDex_source.zip` is replaced.
