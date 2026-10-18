const fs=require('fs');
const assert=require('assert');
const main=fs.readFileSync('app/src/main/java/com/example/luckydex/MainActivity.java','utf8');
const amie=fs.readFileSync('app/src/main/assets/arcade-amie.js','utf8');
const classics=fs.readFileSync('app/src/main/assets/arcade-classics.js','utf8');
const fossil=fs.readFileSync('app/src/main/assets/arcade-fossil-museum-core.js','utf8');
const fossilRuntime=fs.readFileSync('app/src/main/assets/arcade-fossil-museum.js','utf8');
const css=fs.readFileSync('app/src/main/assets/arcade.css','utf8');

assert(main.includes('FrameLayout'), 'WebView should live inside a safe-area root');
assert(main.includes('setMargins(safe.left, safe.top, safe.right, safe.bottom)'), 'system insets must resize the WebView viewport with margins');
assert(!main.includes('view.setPadding(safe.left, safe.top, safe.right, safe.bottom)'), 'fixed UI must not rely on WebView padding for system bars');

assert(amie.includes("addEventListener('touchstart'"), 'Berry Picker needs an Android touch fallback');
assert(amie.includes("addEventListener('touchmove'"), 'Berry Picker needs touchmove drag tracking');
assert(amie.includes("addEventListener('touchend'"), 'Berry Picker needs touchend drop detection');
assert(amie.includes('changedTouches'), 'Berry touch drop should use changedTouches coordinates');

assert(!classics.includes('function makeFossil'), 'Classics must not retain the retired Fossil owner');
assert(fossil.includes('rows:9,cols:12'), 'Fossil site should use the 12x9 Underground-style wall');
assert(fossil.includes('minFinds:3,maxFinds:6'), 'Fossil site should contain several buried objects');
assert(fossil.includes('pickaxe:{stabilityCost:3')&&fossil.includes('hammer:{stabilityCost:8'), 'Fossil tools should consume wall stability');
assert(fossilRuntime.includes('fossil-find-v0250'), 'Buried finds should render as coherent item sprites beneath rock');
assert(css.includes('aspect-ratio:12/9'), 'Fossil board should preserve 12x9 square-cell proportions');
assert(css.includes('grid-template-columns:repeat(12'), 'Fossil wall must expose twelve columns');

assert(css.includes('.world-scene>img{') && css.includes('object-fit:cover'), 'World art should fill the scene rather than float inside blur bars');
console.log('v0.22.2 device regression contract OK');
