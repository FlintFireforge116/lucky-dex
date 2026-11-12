const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets');
const sv=require(path.join(A,'tcg-classic-scarlet-violet.js'));
const d=require(path.join(A,'tcg-classic-battle-data.js'));
const eff=require(path.join(A,'tcgp-battle-effects.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const draft=[...Array(4).fill('sv1-30'),...Array(4).fill('sv1-32'),...Array(4).fill('sv1-33'),...Array(4).fill('sv1-36'),...Array(4).fill('sv1-188'),...Array(4).fill('sv1-180'),...Array(4).fill('sv1-189'),...Array(2).fill('sv1-194')];
test('all 258 original prints have real identities, images and rarity labels',()=>{
 assert.equal(sv.CARDS.length,258);assert.equal(new Set(sv.CARDS.map(x=>x.id)).size,258);
 assert.equal(sv.CARDS.filter(x=>x.battleEnabled).length,256);
 for(const c of sv.CARDS){assert.ok(c.name&&c.rarity&&c.setId==='sv1'&&c.image.includes('/sv1/'));assert.equal(sv.cardById(c.id),c);}
});
test('hyper and full-art variants reuse the matching normal print mechanics only',()=>{
 assert.equal(sv.cardById('sv1-224').name,'Arcanine ex');
 assert.deepEqual(sv.cardById('sv1-224').attacks,sv.cardById('sv1-32').attacks);
 assert.equal(sv.cardById('sv1-245').rarity,'Special Illustration Rare');
 assert.equal(sv.cardById('sv1-245').battleEnabled,true); // Gardevoir ex is now enabled with its discard-energy Ability.
 assert.equal(sv.cardById('sv1-257').deckEligible,false); // separate Energy Zone
});
test('hybrid Basic Energy prints remain outside decks while all SV1 Pokémon are available',()=>{
 assert.equal(sv.cardById('sv1-86').battleEnabled,true);
 const invalid=[...Array(29).fill('sv1-33'),'sv1-257'];
 assert.ok(d.validateDeck(invalid).errors.some(x=>/not battle-ready|cannot occupy|energy/i.test(x)));
 assert.equal(d.cardById('sv1-19').name,'Spidops ex');
});
test('supported move, trainer and passive effects pass the Classic engine validator',()=>{
 for(const c of sv.CARDS.filter(c=>c.battleEnabled)){
  for(const a of c.attacks||[])if(a.effect)assert.deepEqual(eff.validateEffect(a.effect),[],c.id+' '+a.name);
  if(c.effect)assert.deepEqual(eff.validateEffect(c.effect),[],c.id);
  for(const a of c.abilities||[])assert.deepEqual(eff.validateEffect(a.effect),[],c.id+' '+a.name);
 }
});
test('owned SV1 print variants project independently and do not change counts',()=>{
 const rows=d.projectOwnedCards([{id:'sv1-32',setId:'sv1',source:'tcg',count:2},{id:'sv1-224',setId:'sv1',source:'tcg',count:1}]);
 const x=rows.filter(x=>x.card.setId==='sv1');assert.equal(x.length,2);
 assert.equal(x.find(x=>x.gameplayId==='sv1-32').quantity,2);
 assert.equal(x.find(x=>x.gameplayId==='sv1-224').quantity,1);
});
test('SV1-only CPU can build legal 30-card decks for several types',()=>{
 for(const type of ['Fire','Water','Grass','Lightning','Fighting','Psychic','Darkness']){
  const o=opponents.generate({sets:['sv1'],type,seed:15});assert.equal(o.ok,true,type+': '+o.error);
  assert.equal(o.cards.length,30);assert.ok(o.cards.every(id=>d.cardById(id)?.setId==='sv1'));
  assert.equal(d.validateDeck(o.cards).ok,true);
 }
});
test('basic-ex and alt-ex give two Prizes on KO',()=>{
 let s=core.createBattle({format:'classic',playerDeck:draft,opponentDeck:draft,seed:8,firstSide:'player',playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire']});
 s.sides.player.active.cardId='sv1-32';s.sides.player.active.stack=['sv1-30','sv1-32'];s.sides.player.active.energy.Fire=3;
 s.sides.opponent.active.cardId='sv1-224';s.sides.opponent.active.stack=['sv1-30','sv1-224'];s.sides.opponent.active.damage=260;
 const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(attack);core.applyAction(s,'player',attack);
 assert.equal(s.pendingChoice?.special,'chooseClassicPrize');
 for(let i=0;i<2;i++){
  const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choicePrizeIndex===0);
  assert.ok(choice,'each Prize should be selected explicitly');core.applyAction(s,'player',choice);
 }
 assert.equal(s.sides.player.prizesTaken,2);
});
test('Professor research, Poké Ball and Ultra Ball produce legal play choices',()=>{
 for(const id of ['sv1-189','sv1-185','sv1-196']){
  const s=core.createBattle({format:'classic',playerDeck:draft,opponentDeck:draft,seed:9,firstSide:'player',playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire']});
  s.sides.player.hand.unshift({uid:'QA-'+id,cardId:id});
  const action=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id);
  assert.ok(action,id);assert.doesNotThrow(()=>core.applyAction(s,'player',action));
  assert.ok(['battle','effectChoice'].includes(s.phase));
 }
});
test('Scarlet & Violet remains separate from both Snap sets and existing rarity selectors',()=>{
 assert.ok(d.SETS.some(x=>x.id==='sv1'));
 assert.ok(d.SETS.some(x=>x.id==='SNAPFLORIO'));
 assert.ok(d.SETS.some(x=>x.id==='SNAPFOUNJA'));
 assert.ok(builder.SET_IDS.includes('sv1'));
 assert.ok(builder.RARITY_FOCUS.some(x=>x.id==='ultra'));
});
