# LuckyDex v0.69.392 — Steam Siege XY11 Stage 2

Pinned official 116-card Steam Siege catalogue (`22ea97ca00b595fe6b121494fd45dd65692deee6`).

**Coverage:** 76/116 cards playable (20 additional prints beyond v0.69.391b), 40 gated.

Newly enabled: Tangrowth, Seedot, Nuzleaf, Volcanion (non-EX), Mantine, Litwick,
Pawniard, Yveltal BREAK, Cobalion, Gardevoir-EX (three print variants), Xerneas,
Xerneas BREAK, Druddigon, Persian, Ambipom, Braviary, Captivating Poké Puff,
Special Charge. Each new effect is reused where exact and otherwise added as
explicit Steam Siege rule with choice or timing semantics.

Physical discard piles and Energy Zone are separate. Power Heater, Healing Wave,
Slightly Simmer and Special Charge require real selections. Alternate artwork
must share its exact effect. Break inheritance retains previous attacks. The
builder excludes Special Charge without actual Special Energy and Poké Puff as
unrelated filler, while manual retained choices remain allowed.

**Release gate:** `python3 scripts/check-gradle-source.py --self-test`, then
`python3 scripts/preflight-xy11-release.py --full`, then
`python3 scripts/preflight-xy10-release.py --full`, all before Git push. The
first XY11 full pass regenerates the official card catalogue, runs source and
generated tests (including v07392), and ensures required card IDs are enabled.
This is NOT final Steam Siege completion or a claim of GitHub Actions success.
