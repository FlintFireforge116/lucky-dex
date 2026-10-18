const assert = require('assert');
const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-ekans-hoop.css'),'utf8');

// The global `.arcade-game button{touch-action:manipulation}` has specificity 0,1,1.
// Ekans must override it with a selector of strictly higher specificity so Android/WebView
// does not take ownership of the slingshot drag and emit pointercancel before pointermove.
const strongOverride = /(?:#ekansHoopLauncher|\.arcade-game\s+(?:button\.)?ekans-hoop-launcher)[^{]*\{[^}]*touch-action\s*:\s*none\b/i;
assert.ok(strongOverride.test(css), 'Ekans launcher needs a touch-action:none override stronger than `.arcade-game button`');
console.log('v0.35.5 Ekans touch ownership regression: PASS');
