const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const amie=read('app/src/main/assets/arcade-amie.js');
const amieCss=read('app/src/main/assets/arcade-amie.css');
const arcadeCss=read('app/src/main/assets/arcade.css');

// Android/WebView drag must retain the pointer after it leaves the berry button.
assert(amie.includes('setPointerCapture'),'Berry Picker drag must use Pointer Capture');
assert(amie.includes('lostpointercapture'),'Berry Picker drag must clean up lost pointer capture');

// Berry Service should devote the remaining portrait viewport to the scene,
// Exact berry/customer coordinates are verified with native touch geometry in v0223-berry-touch.test.cjs,
// not reserve a fixed minimum-height web widget with oversized customers.
assert.match(amieCss,/#berryPickerGame\s*\{[^}]*grid-template-rows:/s,'Berry Picker must use an explicit portrait layout grid');
assert.match(amieCss,/\.berry-picker-stage\s*\{[^}]*min-height:\s*0/s,'Berry Picker stage must be allowed to fill the remaining height');

// Arcade game pages should be top-composed like app screens, not vertically
// centered web cards that leave arbitrary dead space above/below the game.
assert.match(arcadeCss,/\.arcade-game\s*\{[^}]*justify-content:\s*flex-start/s,'Arcade screens must top-compose inside the usable phone viewport');
assert.match(arcadeCss,/\.arcade-game\s*\{[^}]*height:\s*100%/s,'Arcade screens must explicitly fill the usable app viewport');

console.log('PASS v0.22.1 phone UI focus contract');
