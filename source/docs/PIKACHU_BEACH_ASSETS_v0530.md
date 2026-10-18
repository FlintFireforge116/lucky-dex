# Pikachu's Beach v0.53.0 source and asset notes

## Classic / Pokémon Yellow

Classic mode is a JavaScript translation of the surfing Pikachu minigame state machine in `pret/pokeyellow`, primarily `engine/minigame/surfing_pikachu.asm`. The source establishes the 6000 HP countdown, 24-section course, riding/jumping/landing/crashed states, wave-crest jump gate, gradual acceleration, rough/hard landing speed loss, wipeout reset, and the original Radness awards (50, 150, 180, 350, 500). The LuckyDex core advances at a fixed 20 ms step; this is an implementation-time translation of the Game Boy frame loop rather than an emulator.

Classic pixel artwork is derived from the corresponding `gfx/surfing_pikachu/` resources from the same disassembly. LuckyDex does not ship a Pokémon Yellow ROM and does not depend on `Pikachus Beach.ips`.

## Super Surfing Pikachu DX

The user supplied `superSurfingPikachuDX_v1_1.zip` for private use. `scripts/extract-pikachu-beach-dx.py` reads its GameMaker `data.win` directly. It decodes the five `2zoq`/`fioq` texture pages, reads sprite-to-texture-page references, restores trimmed frames to their original sprite canvas, and extracts the WAV assets referenced by the selected sound records. `manifest.json` preserves the original GameMaker resource names.

Recovered gameplay families include surfing Pikachu, waves, rings, HP Up, Seaking/Lapras/Natu allies, common water/flying enemies, Articuno, Zapdos, Moltres, Lugia, Wailord, their attack/effect sprites, UI effects and the release's surfing/action audio. The compiled release also exposes GameMaker object/code names such as `o_player`, `o_wave`, `o_scoreRing`, `o_hpUp`, `o_ally`, `o_seaking`, `o_lapras`, `o_natu`, `o_legendaryBird`, `o_boss`, `o_aeroblast`, `o_water_spouts`, `o_hydropump`, and the player/combat scripts; these names are used to keep the port aligned with the supplied release's systems.

The LuckyDex DX simulation is a clean browser-runtime port around those recovered systems/assets. It does not embed or execute the Windows EXE and does not require GameMaker at runtime. Exact GameMaker VM bytecode is not executed; where numeric timing/physics constants were not directly recoverable without a full GameMaker decompiler, LuckyDex uses deterministic values chosen to reproduce the visible systems rather than claiming byte-for-byte behaviour.
