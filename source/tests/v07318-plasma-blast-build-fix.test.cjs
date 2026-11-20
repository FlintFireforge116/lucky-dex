'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const decks=require(path.join(assets,'tcg-classic-decks.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const src=path.join(root,'data/classic/bw10-print-compact.json');
test('BW10 generator coverage explicitly exposes both printed and total counts', {skip:!fs.existsSync(src)},()=>{
 assert.equal(data.coverage().plasmaBlast.total,105);
 assert.equal(data.coverage().plasmaBlast.printed,105);
});
test('BW10-only last-resort builds are 30-card legal and use complete evolution lines', {skip:!fs.existsSync(src)},()=>{
 const rows=data.CARDS.filter(c=>c.setId==='bw10'&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 let passed=0;
 for(const type of ['Grass','Fire','Water','Psychic','Fighting','Metal','Darkness','Colorless']){
  const built=builder.rescueBW10Deck(rows,{sets:['bw10'],types:[type]});
  assert.ok(built?.ok,type+' rescue should be a legal, complete family');
  assert.equal(built.cards.length,30,type);
  assert.equal(data.validateDeck(built.cards).ok,true,type);
  assert.equal(decks.validateDraft(built.cards,rows,{requireFull:true}).ok,true,type);
  assert.equal(decks.analyzeDeck(built.cards,built.energyTypes).missingEnergyTypes.length,0,type);
  assert.ok(built.cards.every(id=>data.cardById(id)?.setId==='bw10'&&data.cardById(id).deckEligible!==false),type);
  assert.equal(built.cards.filter(id=>data.cardById(id)?.aceSpec).length,0,type);
  for(const [stage,roots] of [['bw10-13',['bw10-12']],['bw10-56',['bw10-55']],['bw10-59',['bw10-57','bw10-58']]])
   if(built.cards.includes(stage))for(const prerequisite of roots)assert.ok(built.cards.includes(prerequisite),stage+' prerequisite '+prerequisite);
  passed++;
 }
 assert.equal(passed,8);
 assert.equal(builder.rescueBW10Deck(rows,{sets:['bw9'],types:['Grass']}),null);
 assert.equal(builder.rescueBW10Deck(rows,{sets:['bw10'],types:['Lightning']}),null);
});
