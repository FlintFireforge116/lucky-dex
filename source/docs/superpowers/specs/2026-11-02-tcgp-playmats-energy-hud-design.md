# TCGP Playmats, Energy Icons and Battlefield Cosmetics Design

## Intent
Make the TCG battle board feel like Pokémon TCG Pocket rather than a generic floating-card board. Real Pocket playmat artwork provides the battlefield geometry; cards snap to the Active and Bench slots printed into the artwork. Tools stay visually attached to their owning Pokémon, Energy uses real TCG symbols, and the turn HUD must fit without crowding the play area.

## Goals
- Add unlockable/equippable playmats alongside sleeves, with persisted ownership and active selection.
- Seed the system with a curated set of real TCG Pocket playmats and LuckyDex progression unlocks.
- Use the equipped player mat for the lower half and a deterministic opponent mat for the upper half.
- Align Active and three Bench cards to the printed Pocket mat positions; hide LuckyDex's own empty slot outlines when a mat is active.
- Keep Tool mini-cards anchored to their Pokémon wrapper so they follow movement/promotion/retreat and never cover HP.
- Replace textual Energy letters/words in battle HUD/cost/attachments with real TCG energy icons, with accessible labels/fallbacks.
- Make End Turn/Ready/Choose controls compact enough to fit the middle lane at mobile widths.

## Non-goals
- Do not change battle rules, card text, or energy generation semantics.
- Do not require a network connection for battle logic; remote cosmetic artwork may fail gracefully to the plain board.
- Do not import every historical Pocket playmat in this first release; the catalogue/data model must make expansion content-only.

## Constraints
- Preserve existing sleeve behaviour and save compatibility.
- Existing saved games without playmat fields must migrate automatically.
- Player unlocks must be progression-based, with at least one playmat always available.
- Opponent playmat selection must not depend on player's ownership.
- Existing Stadium, Tool, drag-targeting, animation, and random Solo behaviour must remain intact.

## Chosen approach
Extend the existing Cosmetics core with a separate playmat catalogue/state (`unlockedPlaymats`, `activePlaymat`) and a playmat tab in the existing Customise screen. Battle UI consumes the active mat and a deterministic opponent mat. The 1024×1024 official art is used as a background crop: top half for CPU, bottom half for player. Fixed percentage anchors match Pocket's printed slot geometry, while a plain-board fallback keeps the current layout usable if art fails.

Energy icon URLs are centralised in `tcgp-ui-assets.js`, using Bulbagarden Archives TCG card element images with text fallback. Playmat artwork URLs use Bulbagarden Archives full-size Pocket playmat files; source/provenance metadata remains in the catalogue.
