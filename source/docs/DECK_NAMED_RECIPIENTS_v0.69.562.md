# v0.69.562 — named Trainer eligibility

Reported: Misty's Water Command selected in Water TAG TEAM decks without any legal recipient. Reproduced on v0.69.561 with focus sm9-160 and sm12-38, seed 13. Added a shared exact-name eligibility gate to the synergy scorer used by automatic player/CPU deck generation. Also covers Brock's Training. Existing manual picks remain retained. This is a deck selection fix, not a change to the printed or battle rules.

Tests: added four named-recipient tests to the registered adaptive-Trainer suite, including positive recipient names, both TAG TEAM cores, manually retained cards, CPU and optimiser. All eight focused tests passed. No expansion data or new UI changed. Larger UX redesign is deferred to TCG polish.

Full v0.69.562 preparation: 2874/2874 standard gameplay test invocations passed; 69/69 additional Hidden Fates outcome tests and 12/12 manifest tests passed.
