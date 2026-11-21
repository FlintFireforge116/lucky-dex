# v0.69.350 — GitHub Actions API rate-limit fix

GitHub Actions APK build #638 (2026-11-21) failed at `:app:generateBW11ForApk`: `HTTP Error 403: rate limit exceeded`. That failure was upstream catalogue retrieval, not a failing Primal Clash card regression.

The nine pinned set generators BW8–BW11 and XY1–XY5 now download **the same immutable Git blob contents** directly using `raw.githubusercontent.com` at revision `90f27d0e14cefe48ccb2b8922a7a356b2fcf0072`. These nine checked-in BLOB hash constants match the file hashes at that upstream commit; each download checks Git's exact `blob <len>\0<bytes>` SHA-1 before JSON parsing, so the card catalogue is not a moving or fabricated source. This avoids the GitHub REST API's unauthenticated hourly rate limit.

Primal Clash v0.69.349 engine and descriptors remain intact. v0.69.350 adds an offline helper regression and retains all official card audits. A successful GitHub build remains to be verified after push.
