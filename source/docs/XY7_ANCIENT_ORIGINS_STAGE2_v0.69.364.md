# LuckyDex v0.69.364 — Ancient Origins Stage 2

## Verified predecessor

- GitHub Actions run #652: v0.69.363 Stage 1 **succeeded**.
- Official XY7 catalogue remains 101 prints, with 15 printed θ Ancient Traits.

## Changes

- Implemented θ Stop, θ Double, θ Max at the shared battle-engine level. Traits are not Pokémon Abilities and do not stop working under Ability suppression.
- θ Stop: protects its bearer against opposing Pokémon Ability effects (including generic damage, conditions and older direct-mutation effects). It does not block attacks or effects from the protected player's own Pokémon.
- θ Double: supports two physical Tools with inspection and normal removal; ordinary one-Tool limits still apply. Banette may blank Tool text without detaching Tools.
- θ Max: heals inherited damage after evolution/primal reversion, preserving Energy and Tools, and respecting global healing prohibition.
- Ancient Origins 96–98 reuse verified effects of their previously printed regular-art counterparts; matching older Spirit Links also recognise these prints in gameplay and deck construction.
- Newly battle-ready θ prints: 11, 15, 18, 32, 43, 50, 92, 96, 97, 98.

## Still gated

- Ancient Trait prints #8, #21, #35, #67, #85 require independent work on attacks or Abilities; their θ traits alone do not make the entire print playable.
- Other unsupported XY7 abilities, trainers, stadiums and two Special Energies remain gated.
- No claim of full Ancient Origins completion or Android device testing is made.

## Checks

- Local: 132 passed, 0 failed, 6 skips in selected cross-set tests.
- GitHub build runs both `v07363-ancient-origins-stage1` and `v07364-ancient-origins-theta` after generation of the verified XY7 catalogue.
- A successful GitHub APK build is still required.
