# LuckyDex v0.24.4

## Fixed
The Pack Browser's Release Date sort no longer depends on sparse card-index dates. A comprehensive physical-set release-date registry is now authoritative for sorting and display-date lookup.

The registry includes 247 names/aliases covering the validated physical catalogue and special representations. The card-art-index generator consumes the same registry and refuses to publish an index containing an undated validated set.

## Signing permanence
v0.24.4 retains the recovered original LuckyDex signing identity. The canonical keystore is bundled at `app/luckydex-dev.keystore`; Gradle refuses to silently use a different debug key.

Because APK signatures cannot be changed during an Android in-place update, a phone currently holding an APK signed by an earlier ephemeral runner debug key may require one final reinstall. Once v0.24.4 is installed with the canonical signer, subsequent versions that keep this source/signing contract should update normally.
