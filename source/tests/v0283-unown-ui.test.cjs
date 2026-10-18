const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');

for(const mode of ['easy','normal','hard'])assert.ok(html.includes(`data-unown-difficulty="${mode}"`),`missing ${mode} mode`);
for(const id of ['unownStreak','unownScore','unownCategory','unownClue','unownGlyphs','unownTimerFill','unownAnswers','unownTypedForm','unownInput','unownDecodeBtn','unownStartBtn','unownCashBtn'])assert.ok(html.includes(`id="${id}"`),`missing #${id}`);
assert.doesNotMatch(html,/Message\s*<span[^>]*id="unownRound"[^>]*>[^<]*<\/span>\s*\/5/i,'fixed five-message UI should be removed');
const speciesPos=html.indexOf('adventure/adventure-species.js');
const dataPos=html.indexOf('arcade-unown-data.js');
const ownerPos=html.indexOf('arcade-unown.js');
assert.ok(speciesPos>=0&&dataPos>speciesPos&&ownerPos>dataPos,'Unown data helper must load after species and before owner');

assert.match(css,/\.unown-game\.mode-easy[\s\S]*\.unown-answers|\.mode-easy[^{]*\.unown-answers/,'Easy visibility hook missing');
assert.match(css,/\.unown-game\.mode-(?:normal|typed)|\.mode-normal[^{]*\.unown-typed-form/,'typed-mode visibility hook missing');
assert.match(css,/\.unown-glyphs\.(?:decoded|failed)|\.unown-chamber\.(?:decoded|failed)/,'decoded/reveal state missing');
assert.match(css,/\.unown-canonical/,'canonical reveal text styling missing');
assert.match(css,/max-width:\s*100%/,'mobile max-width rule missing');
assert.match(css,/flex-wrap:\s*wrap/,'glyph words must wrap');
assert.match(css,/\.unown-typed-form[\s\S]*width:\s*100%/,'typed controls should fit phone width');

console.log('PASS v0.28.3 Unown UI static contract');
