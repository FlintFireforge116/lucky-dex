'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync('app/src/main/assets/'+f,'utf8');
const dash=read('arcade-dash.js'),dig=read('arcade-dig-dig-dig.js'),mag=read('arcade-magikarp-splash.js'),rock=read('arcade-rock-harden.js');
for(const [name,src] of [['Dash',dash],['Dig',dig],['Magikarp',mag],['Rock',rock]]){
 assert.match(src,/review\s*(?:=|:)\s*\{/s,`${name} must submit a structured review`);
 assert.match(src,/scoreboard(?:\s*:|\s*[,}])/s,`${name} review must include scoreboard`);
 assert.match(src,/difficulty\s*:/s,`${name} review must expose difficulty`);
}
assert.match(dash,/mode\s*:\s*['"]Quick Race['"]/s,'Dash Quick Race mode review');
assert.match(dash,/mode\s*:\s*`?\$?\{?titleType\(cup\.type\).*League/s,'Dash league review mode');
assert.match(dash,/standingRows\.map/s,'Dash league review uses authoritative cup standings');
assert.match(dig,/ranking\.map/s);assert.match(mag,/core\.placeFor/s);assert.match(mag,/Best Quick Chain/s,'Magikarp review includes Quick-chain performance');assert.match(rock,/core\.placeFor/s);assert.match(rock,/playerGrades/s,'Rock review tracks grade breakdown');assert.match(rock,/Gold Rock/s,'Rock review includes Gold Rock result');
for(const src of [dash,dig,mag,rock])assert.match(src,/rewards\s*:/s,'review shows already-awarded rewards');
console.log('PASS v0.39.0 competitive structured review contracts');
