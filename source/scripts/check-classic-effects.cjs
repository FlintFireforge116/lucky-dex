#!/usr/bin/env node
'use strict';
// Usage: node scripts/check-classic-effects.cjs <catalogue-module> [effects-module]
// Also accepts temporary proposed modules, so installers can validate before writing.
const path=require('node:path');
const assert=require('node:assert/strict');
const catalog=require(path.resolve(process.argv[2]));
const fx=require(path.resolve(process.argv[3]||path.join(__dirname,'../app/src/main/assets/tcgp-battle-effects.js')));
const cards=catalog.CARDS;
assert.ok(Array.isArray(cards),'Catalogue does not expose CARDS');
const failures=[];
let enabled=0, checked=0;
for(const c of cards){
 if(!c.battleEnabled)continue;
 enabled++;
 const effects=[...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{name:'card effect',effect:c.effect}]:[]),...(c.onAttach?[{name:'onAttach',effect:c.onAttach}]:[])];
 for(const a of effects){checked++;if(!fx.supportsEffect(a.effect))failures.push(`${c.id} ${a.name}: ${fx.validateEffect(a.effect).join('; ')}`);}
}
assert.equal(failures.length,0,failures.join('\n'));
console.log(`Engine compatibility: ${enabled}/${cards.length} enabled prints; ${checked} effects accepted.`);
