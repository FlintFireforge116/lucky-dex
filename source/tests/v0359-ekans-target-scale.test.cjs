const assert=require('assert');
const fs=require('fs');
const css=fs.readFileSync('app/src/main/assets/arcade-ekans-hoop.css','utf8');

const desktopDiglett=css.match(/\.ekans-hoop-target\{[^}]*width:\s*(\d+)px;[^}]*height:\s*(\d+)px/i);
const desktopDugtrio=css.match(/\.ekans-hoop-target\.is-dugtrio\{[^}]*width:\s*(\d+)px;[^}]*height:\s*(\d+)px/i);
assert.ok(desktopDiglett && Number(desktopDiglett[1])>=78 && Number(desktopDiglett[2])>=78,'desktop Diglett remains at least v0.35.9 scale');
assert.ok(desktopDugtrio && Number(desktopDugtrio[1])>=96 && Number(desktopDugtrio[2])>=88,'desktop Dugtrio remains at least v0.35.9 scale');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.ekans-hoop-target\{width:\s*(?:7[2-9]|[89]\d|\d{3,})px;height:\s*(?:7[2-9]|[89]\d|\d{3,})px\}/i,'mobile Diglett remains at least v0.35.9 scale');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.ekans-hoop-target\.is-dugtrio\{width:\s*(?:8[6-9]|9\d|\d{3,})px;height:\s*(?:8\d|9\d|\d{3,})px\}/i,'mobile Dugtrio remains at least v0.35.9 scale');
console.log('PASS v0.35.9 Ekans target sprite scale');
