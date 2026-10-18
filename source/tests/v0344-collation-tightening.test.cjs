'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

assert.equal(R.classify({rarity:'Pikachu Rare'}).rarityClass,'rare','Pikachu Rare is a first-class printed rarity rather than unknown');
const jungle={name:'Jungle',releaseDate:'1999-06-16'};
const classic=P.slotPlan(jungle,{source:'tcg'});
assert.equal(classic.length,11,'Jungle stays an 11-card WotC booster');
assert.deepEqual(classic.slice(0,7).map(s=>s.allowedClasses),Array.from({length:7},()=>['common']),'first seven slots are commons');
assert.deepEqual(classic.slice(7,10).map(s=>s.allowedClasses),Array.from({length:3},()=>['uncommon']),'next three slots are uncommons');
assert.deepEqual(classic[10].allowedClasses,['rare','double-rare','ultra','illustration','special-illustration','historic-chase','secret'],'final slot owns the rare-or-higher pull');
assert.equal(typeof P.cardMatchesDescriptor,'function','policy exposes strict descriptor membership');
assert.equal(P.cardMatchesDescriptor({name:'Mr. Mime',rarity:'Rare'},classic[0],jungle,'tcg',R.classify),false,'a Rare cannot leak into a common slot');
assert.equal(P.cardMatchesDescriptor({name:'Clefable',rarity:'Rare Holo'},classic[8],jungle,'tcg',R.classify),false,'a Rare Holo cannot leak into an uncommon slot');
assert.equal(P.cardMatchesDescriptor({name:'Spearow',rarity:'Common'},classic[0],jungle,'tcg',R.classify),true,'common slot accepts Common');
assert.equal(P.cardMatchesDescriptor({name:'Vaporeon',rarity:'Rare Holo'},classic[10],jungle,'tcg',R.classify),true,'rare slot accepts Rare Holo');

const th={name:'30th Celebration',releaseDate:'2026-09-16'};
const slots=P.slotPlan(th,{source:'tcg'});
assert.equal(slots.length,6,'30th Celebration remains six cards');
assert.equal(slots.slice(0,4).every(s=>s.pool==='core'&&s.finish==='holo'),true,'first four cards are general foil set cards');
assert.equal(slots[4].id,'pikachu-rare','fifth set-card slot is the guaranteed Pikachu Rare');
assert.equal(slots[4].requiredRarity,'Pikachu Rare');
assert.equal(slots[5].id,'energy','sixth slot is the foil Basic Energy');
assert.equal(slots[5].pool,'special-energy');
assert.equal(P.cardMatchesDescriptor({name:'Pikachu',localId:'23',rarity:'Rare'},slots[4],th,'tcg',R.classify),true,'guaranteed slot accepts the numbered Pikachu Rare even if a catalogue flattens the printed rarity');
assert.equal(P.cardMatchesDescriptor({name:'Pikachu',rarity:'Pikachu Rare'},slots[4],th,'tcg',R.classify),true,'guaranteed slot accepts an explicit Pikachu Rare');
assert.equal(P.cardMatchesDescriptor({name:'Pikachu ex',rarity:'Double Rare'},slots[4],th,'tcg',R.classify),false,'guaranteed Pikachu slot is not any card named Pikachu');
assert.equal(P.cardMatchesDescriptor({name:'Pikachu',rarity:'Pikachu Rare'},slots[0],th,'tcg',R.classify),false,'general foil slots do not create a second Pikachu Rare');
assert.equal(P.cardMatchesDescriptor({name:'Pikachu',localId:'24',rarity:'Rare'},slots[0],th,'tcg',R.classify),false,'general foil slots exclude numbered Pikachu Rares even with flattened catalogue rarity');

assert.equal(typeof P.specialPoolCards,'function','policy supplies non-numbered pack inserts');
const energies=P.specialPoolCards(th,slots[5]);
assert.equal(energies.length,8,'30th Celebration energy insert has all eight Basic Energy types');
assert.equal(new Set(energies.map(c=>c.id)).size,8,'energy insert IDs are stable and unique');
assert.ok(energies.every(c=>/^Basic .+ Energy$/.test(c.name)),'all synthetic inserts are Basic Energy cards');
assert.ok(energies.every(c=>/^https:\/\/images\.scrydex\.com\/pokemon\/mee-(?:9|10|11|12|13|14|15|16)\/large$/.test(c.image)),'energy inserts use identity-stable MEE 9–16 artwork');

const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
assert.match(app,/LuckyDexPackPolicy\?\.specialPoolCards\?\./,'builder asks policy for synthetic/special insert pools');
assert.match(app,/LuckyDexPackPolicy\?\.cardMatchesDescriptor\?\./,'descriptor picker enforces final slot membership');
console.log('PASS v0.34.4 collation tightening contract');
