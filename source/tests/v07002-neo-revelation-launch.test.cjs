 'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const A=path.resolve(__dirname,'../app/src/main/assets'),R=path.resolve(__dirname,'..');
const revelation=require(path.join(A,'tcg-classic-neo-revelation.js'));
const classic=require(path.join(A,'tcg-classic-battle-data.js'));
const builder=require(path.join(A,'tcg-classic-deck-builder.js'));
const opponents=require(path.join(A,'tcg-classic-opponents.js'));
const workspace=require(path.join(A,'tcg-classic-deck-workspace.js'));
const decks=require(path.join(A,'tcg-classic-decks.js'));
const core=require(path.join(A,'tcgp-battle-core.js'));
const fx=require(path.join(A,'tcgp-battle-effects.js'));
const ai=require(path.join(A,'tcgp-battle-ai.js'));
const all=classic.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
test('Neo Revelation registers all 66 numbered cards in nine-set catalogue; restricted effects never claim battle-ready',()=>{
 assert.equal(revelation.CARDS.length,66);assert.equal(new Set(revelation.CARDS.map(c=>c.id)).size,66);
 assert.equal(revelation.CARDS[0].name,'Ampharos');assert.equal(revelation.CARDS[64].name,'Shining Gyarados');assert.equal(revelation.CARDS[65].name,'Shining Magikarp');
 assert.equal(classic.SETS.length,9);assert.equal(classic.SETS.at(-1).id,'neo3');
 assert.equal(classic.CARDS.filter(c=>c.setId==='neo3').length,66);
 assert.ok(revelation.coverage().battleEnabled>=20);
 for(const card of revelation.CARDS)if(card.battleEnabled){assert.equal(card.support.status,'FULL',card.id);for(const a of card.attacks||[])assert.equal(a.unimplemented,false,card.id+' '+a.name);}
 assert.equal(revelation.cardById('neo3-6').battleEnabled,false,'Entei Howl must not be misrepresented');
});
test('Neo Revelation has correct browser loading order, nine-set picker and build identity',()=>{
 const html=fs.readFileSync(path.join(A,'index.html'),'utf8');
 assert.ok(html.indexOf('tcgp-battle-effects.js')<html.indexOf('tcg-classic-neo-revelation.js'));
 assert.ok(html.indexOf('tcg-classic-neo-revelation.js')<html.indexOf('tcg-classic-battle-data.js'));
 assert.match(fs.readFileSync(path.join(A,'tcg-classic-deck-editor.js'),'utf8'),/Neo Revelation/);
 assert.match(fs.readFileSync(path.join(A,'tcgp-battle-ui.js'),'utf8'),/Neo Revelation/);
 assert.deepEqual(builder.SET_IDS,opponents.SETS);
 assert.match(fs.readFileSync(path.join(R,'app/build.gradle'),'utf8'),/versionName '0\.69\.102'/);
 assert.match(fs.readFileSync(path.join(A,'app-v0167.js'),'utf8'),/window\.__LUCKYDEX_BUILD='0\.69\.102'/);
});
test('Neo3 physical ownership mappings, non-owned filtering, and Shining copy cap',()=>{
 const owned=classic.projectOwnedCards([
   {source:'tcg',setId:'N3',id:'N3-007',number:7,count:2},
   {source:'tcg',setName:'Neo Revelation',id:'library:n3:007',number:'007',count:1},
   {source:'tcg',setId:'neo3',id:'neo3-65',number:65,count:1},
   {source:'tcgp',setId:'neo3',id:'neo3-18',number:18,count:5}
 ]);
 assert.equal(owned.find(r=>r.gameplayId==='neo3-7')?.quantity,3);
 assert.equal(owned.find(r=>r.gameplayId==='neo3-65')?.quantity,1);
 assert.equal(owned.some(r=>r.gameplayId==='neo3-18'),false);
 const listing=workspace.query(workspace.catalogue([]),{filters:{set:'neo3',enabled:false},pageSize:100});
 assert.equal(listing.total,66);
 const ready=workspace.query(workspace.catalogue([]),{filters:{set:'neo3',enabled:true},pageSize:100});
 assert.equal(ready.total,revelation.coverage().battleEnabled);
 const invalid=classic.validateDeck(Array(2).fill('neo3-65').concat(Array(28).fill('neo3-7')));
 assert.match(invalid.errors.join(' '),/Shining Gyarados is limited to one/i);
});
test('Neo Revelation only and mixed auto decks are legal, including metal special Energy',()=>{
 for(const style of ['random','competitive'])for(let seed=1;seed<=12;seed++){
  const result=builder.buildDeck(all,{sets:['neo3'],style,randomSeed:seed});
  assert.equal(result.ok,true,style+' seed '+seed+': '+result.errors);
  assert.equal(result.cards.length,30);
  assert.equal(classic.validateDeck(result.cards).ok,true);
  assert.ok(result.cards.every(id=>classic.cardById(id).setId==='neo3'||['neo1-19','neo1-104'].includes(id)));
  assert.ok(decks.readiness({cards:result.cards,energyMode:'manual',energyTypes:result.energyTypes},all).ok);
 }
 for(const type of ['Grass','Water','Fighting','Fire','Metal','Colorless']){
  const o=opponents.generate({sets:['neo3'],type,seed:100+type.length});
  assert.equal(o.ok,true,type+': '+o.error);
  assert.equal(classic.validateDeck(o.cards).ok,true);
 }
});
test('Ho-oh Stoke searches the ordered Basic Energy supply and resolves a real choice',()=>{
 const opponent=opponents.generate({sets:['neo3'],type:'Fire',seed:57});assert.ok(opponent.ok);
 const s=core.createBattle({format:'classic',playerDeck:opponent.cards,opponentDeck:opponent.cards,playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire'],seed:427,firstSide:'player'});
 const me=s.sides.player;me.active=core.makePokemonSlot('neo3-7',3,'hooh');
 const supplies=me.energySupply.length,before=me.active.energy.Fire||0;
 fx.applyEffect({type:'neoRule',rule:'revelation:stoke'},core.effectContext(s,'player',{},me.active));
 assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(choice);
 core.applyAction(s,'player',choice);
 assert.equal(me.active.energy.Fire,before+1);assert.equal(me.energySupply.length,supplies-1);assert.equal(me.nextEnergyType,me.energySupply[0]);
});
test('Healing Field action heals on heads and Rocket Hideout gives Dark-name Pokémon 20 HP',()=>{
 const opponent=opponents.generate({sets:['neo3'],type:'Water',seed:69});assert.ok(opponent.ok);
 const s=core.createBattle({format:'classic',playerDeck:opponent.cards,opponentDeck:opponent.cards,playerEnergyTypes:['Water'],opponentEnergyTypes:['Water'],seed:24,firstSide:'player'});
 s.sides.player.active.damage=50;
 fx.applyEffect(classic.cardById('neo3-61').effect.effect,{...core.effectContext(s,'player'),random:()=>.01});
 assert.equal(s.sides.player.active.damage,30);
 s.sides.player.active=core.makePokemonSlot('base5-4',1,'darkchar');
 s.stadium={uid:'stadium',cardId:'neo3-63',ownerSide:'player'};
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'maxHp',classic.cardById),20);
 s.sides.player.active=core.makePokemonSlot('neo3-7',1,'hooh');
 assert.equal(fx.modifierAmount(s,'player',s.sides.player.active,'maxHp',classic.cardById),0);
});
test('Neo Revelation CPU-vs-CPU battles complete without stalled effect choices',()=>{
 let finished=0;
 for(let seed=1;seed<=6;seed++){
  const o=opponents.generate({sets:['neo3'],type:['Water','Fire','Grass','Fighting','Colorless','Metal'][seed-1],seed:seed*137});assert.ok(o.ok,o.error);
  const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:o.energyTypes,opponentEnergyTypes:o.energyTypes,seed:seed*91,firstSide:'player'});
  let n=0;while(s.phase!=='finished'&&n<1800){const side=s.phase==='effectChoice'?s.choiceSide:s.phase==='promote'?s.promotionSide:s.phase==='setup'?s.setupSide:s.activeSide;const a=ai.chooseAction(s,side,'Intermediate',n);assert.ok(a,'No action: '+s.phase);core.applyAction(s,side,a);n++;}
  assert.equal(s.phase,'finished','seed '+seed+' stalled after '+n+' actions');finished++;
 }
 assert.equal(finished,6);
});

test('Shining Magikarp stays one-copy legal; Gold Scale respects opponent choice',()=>{
 assert.equal(classic.cardById('neo3-66').battleEnabled,true);
 const rejected=classic.validateDeck(['neo3-66','neo3-66']);
 assert.match(rejected.errors.join(' '),/one card/i);
 const one=decks.edit(['neo3-66'],'neo3-66',1,[{gameplayId:'neo3-66',quantity:4}]);
 assert.equal(one.ok,false);
 const o=opponents.generate({sets:['neo3'],type:'Water',seed:180});assert.ok(o.ok);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Water'],opponentEnergyTypes:['Water'],seed:180,firstSide:'player'});
 s.sides.player.active=core.makePokemonSlot('neo3-66',1,'shining');
 const p=s.sides.player,foe=s.sides.opponent,pBefore=p.hand.length,fBefore=foe.hand.length;
 fx.applyEffect(classic.cardById('neo3-66').attacks[0].effect,core.effectContext(s,'player',{},p.active));
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 const no=core.legalActions(s,'opponent').find(a=>a.choiceOption===1);assert.ok(no);
 core.applyAction(s,'opponent',no);
 assert.equal(p.hand.length,pBefore+2);
 assert.equal(foe.hand.length,fBefore);
});

test('Ampharos Attract Current spends Lightning from ordered supply on selected targets',()=>{
 const o=opponents.generate({sets:['base1','neo3'],type:'Lightning',seed:29});assert.ok(o.ok);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Lightning'],opponentEnergyTypes:['Lightning'],seed:34,firstSide:'player'});
 const me=s.sides.player;me.active=core.makePokemonSlot('neo3-1',1,'ampharos');
 const initial=me.energySupply.length;
 fx.applyEffect(classic.cardById('neo3-1').attacks[0].effect,{...core.effectContext(s,'player',{},me.active),random:()=>.01});
 assert.equal(s.phase,'effectChoice');
 for(let i=0;i<3;i++){
   const a=core.legalActions(s,'player').find(x=>x.choiceTarget==='active');assert.ok(a,'Lightning target missing '+i);
   core.applyAction(s,'player',a);
 }
 assert.equal(me.active.energy.Lightning,3);
 assert.equal(me.energySupply.length,initial-3);
 assert.equal(me.nextEnergyType,me.energySupply[0]);
});

test('Shuckle Toxic Saliva applies stronger 20-damage Poison status',()=>{
 const o=opponents.generate({sets:['neo3'],type:'Fighting',seed:16});assert.ok(o.ok);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Fighting'],seed:16,firstSide:'player'});
 s.sides.player.active=core.makePokemonSlot('neo3-51',1,'shuckle');
 const fxCard=classic.cardById('neo3-51').attacks[0].effect;
 fx.applyEffect(fxCard,{...core.effectContext(s,'player',{},s.sides.player.active),random:()=>.01});
 assert.deepEqual(s.sides.opponent.active.conditions.poison,{amount:20});
});

test('Shining Magikarp Dragon Bond searches only the named Gyarados family and shuffles deck',()=>{
 const o=opponents.generate({sets:['neo3'],type:'Water',seed:175});assert.ok(o.ok);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Water'],opponentEnergyTypes:['Water'],seed:176,firstSide:'player'});
 const me=s.sides.player;me.active=core.makePokemonSlot('neo3-66',1,'golden');
 me.deck.push({uid:'test-gyr',cardId:'neo3-65'});
 const count=me.hand.length;
 fx.applyEffect(classic.cardById('neo3-66').attacks[1].effect,core.effectContext(s,'player',{},me.active));
 assert.equal(s.phase,'effectChoice');
 const picked=core.legalActions(s,'player').find(a=>a.choiceCardId==='neo3-65');assert.ok(picked);
 core.applyAction(s,'player',picked);
 assert.equal(me.hand.length,count+1);assert.ok(me.hand.some(ref=>ref.cardId==='neo3-65'));
 assert.equal(me.deck.some(ref=>ref.uid==='test-gyr'),false);
});

test('Celebi Psychic Leaf scales with defending Energy cards and uses actual-damage drain',()=>{
 const o=opponents.generate({sets:['neo3'],type:'Grass',seed:219});assert.ok(o.ok);
 const s=core.createBattle({format:'classic',playerDeck:o.cards,opponentDeck:o.cards,playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass'],seed:220,firstSide:'player'});
 const me=s.sides.player,foe=s.sides.opponent;
 me.active=core.makePokemonSlot('neo3-16',1,'celebi');me.active.damage=30;
 foe.active=core.makePokemonSlot('neo3-7',1,'hooh');foe.active.energy={Fire:2,Water:1};
 const attack=classic.cardById('neo3-16').attacks[0];
 const ctx={...core.effectContext(s,'player',{},me.active),attack,random:()=>.01};
 const calc=fx.resolveAttack(attack,ctx);
 assert.equal(calc.damage,40);
 assert.ok(calc.pendingEffects.some(e=>e.type==='drain'));
 fx.applyEffect({type:'drain'},{...ctx,dealtDamage:20});
 assert.equal(me.active.damage,10);
});
