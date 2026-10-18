'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const P=require('../app/src/main/assets/pack-policy-v0343.js');
const R=require('../app/src/main/assets/card-rarity-v0253.js');

const fantastical={id:'B2',name:'Fantastical Parade',releaseDate:'2026-01-29'};
const noBonus=P.slotPlan(fantastical,{source:'tcgp',random:()=>0.05239});
assert.equal(noBonus.length,5,'Fantastical Parade stays a five-card pack above the 5.238% bonus threshold');
const withBonus=P.slotPlan(fantastical,{source:'tcgp',random:()=>0.05237});
assert.equal(withBonus.length,6,'Fantastical Parade adds a sixth card inside the 5.238% bonus window');
assert.equal(withBonus[5].id,'pocket-bonus-shiny','the sixth position is an explicit bonus shiny slot');
assert.equal(P.cardMatchesDescriptor({rarity:'One Shiny'},withBonus[5],fantastical,'tcgp',R.classify),true,'bonus slot accepts One Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'Two Shiny'},withBonus[5],fantastical,'tcgp',R.classify),true,'bonus slot accepts Two Shiny');
assert.equal(P.cardMatchesDescriptor({rarity:'One Star'},withBonus[5],fantastical,'tcgp',R.classify),false,'bonus slot rejects ordinary art rares');
assert.deepEqual(P.targetClassesFor(fantastical,withBonus[5],'tcgp',()=>0.0),['ultra'],'68.18% branch targets One Shiny class');
assert.deepEqual(P.targetClassesFor(fantastical,withBonus[5],'tcgp',()=>0.90),['special-illustration'],'31.82% branch targets Two Shiny class');

const jungle={id:'base2',name:'Jungle',releaseDate:'1999-06-16'};
const jungleSlots=P.slotPlan(jungle,{source:'tcg'});
assert.equal(P.cardMatchesDescriptor({id:'base2-28',localId:'28',name:'Vaporeon',rarity:'Uncommon'},jungleSlots[0],jungle,'tcg',R.classify),false,'Jungle #28 is canonically Rare even if upstream metadata says Uncommon');
assert.equal(P.cardMatchesDescriptor({id:'base2-28',localId:'28',name:'Vaporeon',rarity:'Uncommon'},jungleSlots[10],jungle,'tcg',R.classify),true,'Jungle #28 is accepted by the rare slot');
assert.equal(P.cardMatchesDescriptor({id:'base2-44',localId:'44',name:'Rapidash',rarity:'Rare'},jungleSlots[7],jungle,'tcg',R.classify),true,'Jungle #44 is canonically Uncommon even if upstream metadata says Rare');
assert.equal(P.cardMatchesDescriptor({id:'base2-54',localId:'54',name:'Jigglypuff',rarity:'Rare'},jungleSlots[0],jungle,'tcg',R.classify),true,'Jungle #54 is canonically Common');

const fossil={id:'base3',name:'Fossil',releaseDate:'1999-10-10'};
const fossilSlots=P.slotPlan(fossil,{source:'tcg'});
assert.equal(P.cardMatchesDescriptor({id:'base3-17',localId:'17',name:'Articuno',rarity:'Uncommon'},fossilSlots[8],fossil,'tcg',R.classify),false,'Fossil #17 is canonically Rare, not Uncommon');
assert.equal(P.cardMatchesDescriptor({id:'base3-17',localId:'17',name:'Articuno',rarity:'Uncommon'},fossilSlots[10],fossil,'tcg',R.classify),true,'Fossil #17 belongs in the rare slot');

for(let n=1;n<=64;n++){
  const expected=n<=32?'rare':n<=48?'uncommon':'common';
  assert.equal(R.classify({id:`base2-${n}`,localId:String(n),rarity:'Unknown'},jungle).rarityClass,expected,`Jungle #${n} canonical rarity band`);
}
for(let n=1;n<=62;n++){
  const expected=n<=30?'rare':n<=45?'uncommon':'common';
  assert.equal(R.classify({id:`base3-${n}`,localId:String(n),rarity:'Unknown'},fossil).rarityClass,expected,`Fossil #${n} canonical rarity band`);
}

const app=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');
assert.doesNotMatch(app,/return cards\.slice\(0,need\);\s*\}\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\/\* === v0\.13/s,'offline normal-pack path must not truncate a legitimate sixth Pocket bonus card');

console.log('PASS v0.34.6 Fantastical Parade bonus + legacy WotC collation');
