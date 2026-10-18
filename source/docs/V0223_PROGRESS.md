# v0.22.3 progress

Baseline is the supplied v0.22.2 source, not the older v0.21 checkout. The earlier v0.22.0 restore request is superseded by the latest targeted fix request.

The five real Samsung screenshots were received and copied unmodified to `artifacts/v0223/baseline/phone-*.jpg`.

Observed root cause: `.dig-cell-v019.empty` inherits `.empty { grid-column: 1 / -1; }` from main app CSS. This makes revealed cells span rows and creates the reported strips. No architecture change is needed.

Baseline suite currently fails its Amie fixture: it reads a hidden Berry stage bounding box after switching to Tile Puzzle. This is a test ordering defect; the touch owner task will repair the fixture without changing Tile Puzzle behavior.

Focused parallel tasks own Berry touch/scene, Ball physics and venue images independently. Parent owns world layout, Fossil display, integration, build and release packaging.

Targeted implementation and review verified. Twenty test programs and original/new venue guards pass. APK0.22.3/code223builds; original signer and every packaged source asset match. Clefairy/Blender/nativefiles byteunchanged; Tile implementation functions unchanged. No ADB device; physical install/updateQA unavailable.
Repaired stale test assumptions only: hiddenBerry measurement, wrong-berry selection fixture, hidden app-nav during Arcade, local PNG TARGETdata mislabeled remote, outdated v222 release literals.
