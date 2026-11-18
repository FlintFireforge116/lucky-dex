# LuckyDex v0.69.271 — Supreme Victors, offline first-pass integration

**Source:** `pl3` 153 authentic Supreme Victors collector prints (1–150 plus SH7, SH8, SH9), preserving 254 printed attacks and 34 Poké-Powers/Bodies. The complete offline printed archive is in `data/classic/pl3-print-source.json`. `scripts/decode-pl3-archive.py` reproduces it from `data/classic/pl3-print-compact.b64`; `scripts/build-supreme-victors.py` verifies both fixed hashes before generating the playable asset.

**Coverage:** 153/153 visible card records; **84/153 battle/deck enabled**. The remaining **69** are catalogued but gated because one or more printed effects need an additional runtime handler, event trigger, or target-resolution behavior. They must not silently resolve as zero-effect attacks. The build always regenerates the asset before the audit and merge-assets phase.

**Integrated:** `pl3` is recognised by Classic collection/ownership, the Platinum-era set picker, deck-builder filter and CPU set selection. Item/Supporter exceptions and damage, status, coin, search, targeted damage, healing and selected persistent abilities use existing validated mechanics where their printed meaning matches. Version bumped consistently to 0.69.271 in Android Gradle, boot JS and UI.

**Known gaps to address in next pass:**
- Several Pokémon SP and LV.X on-evolve, after-KO and between-turn triggers.
- Status applied *after* a forced switch (Blaziken FB Luring Flame); the ordinary sequence would affect the wrong defending Pokémon.
- Manectric G Energy Absorption: two independently selected physical Energy cards, potentially of different types.
- Further stadium/supporter hooks and choice-heavy attacks.
- Strict Supreme Victors-only CPU Metal decks cannot currently be constructed from the enabled Metal pool; do not invent off-set or unpayable Pokémon merely to satisfy that preference.

**Tests:** `node --test tests/v07271-supreme-victors-stage1.test.cjs` tests print identity, registration and ownership, legal CPU decks (eight available type profiles), all enabled attack choices and version coherence. `node scripts/audit-classic-set.cjs --set pl3 --smoke --no-write` independently checks card and CPU/deck legality. The Gradle APK build runs both after asset generation.

**Release scope:** This is an honest first-pass integration rather than a claim of full implementation or device-tested APK. Next pass should prioritise outcome-accurate complex mechanics and expand the CPU Metal/card pool, followed by independent per-card outcome audit.
