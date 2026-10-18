const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade.css'),'utf8');
const js=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-unown.js'),'utf8');

for(const id of ['unownAnswerScreen','unownAnswerCloseBtn','unownAnswerGlyphs','unownAnswerCategory','unownAnswerClue','unownAnswerTimerFill','unownAnswerOpenBtn']){
  assert.ok(html.includes(`id="${id}"`),`missing #${id}`);
}
assert.match(html,/id="unownAnswerScreen"[\s\S]*id="unownTypedForm"[\s\S]*id="unownInput"[\s\S]*id="unownDecodeBtn"/,'typed input must live inside the dedicated answer screen');
assert.match(css,/\.unown-answer-screen\s*\{[\s\S]*position:\s*fixed/,'answer screen must be fixed rather than reflowing the game');
assert.match(css,/\.unown-answer-screen\[hidden\]/,'answer screen needs an explicit hidden state');
assert.match(js,/function\s+openTypedScreen\s*\(/,'typed screen open lifecycle missing');
assert.match(js,/function\s+closeTypedScreen\s*\(/,'typed screen close lifecycle missing');
assert.match(js,/unownAnswerGlyphs/,'question glyphs must also render inside the answer screen');
assert.match(js,/unownAnswerTimerFill/,'timer progress must be mirrored into the answer screen');
assert.match(js,/unownAnswerOpenBtn/,'main Decoder screen must provide a reopen control after keyboard/back dismissal');
assert.match(js,/closeTypedScreen\([^)]*false/,'answer screen must be dismissible without ending the question');
assert.match(js,/focus\?\.\(\{preventScroll:true\}\)/,'typed screen should focus without browser scroll-jump');
assert.match(js,/answerOpen\.hidden=!canOpen/,'answer button must stay hidden until a live question');

console.log('PASS v0.28.7 Unown dedicated answer-screen contract');
