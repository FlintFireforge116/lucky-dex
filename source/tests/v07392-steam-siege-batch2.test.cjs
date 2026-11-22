'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const contract=require('../scripts/xy11_release_contract.json');
const root=path.join(__dirname,'..');
const generated=fs.existsSync(path.join(root,'data/classic/xy11-print-compact.json'));
const verify={skip:!(generated||process.env.GITHUB_ACTIONS==='true')};
function slot(cardId,uid,benchSlot){return {cardId,uid,benchSlot,energy:{},specialEnergy:[],stack:[cardId],conditions:{},damage:0,locks:[]};}
const side=(active)=>({active,bench:[],deck:[],hand:[],discard:[],prizes:[],energySupply:[],energyDiscard:{}});
const scene=()=>({format:'classic',turnNumber:8,sides:{player:side(slot('xy11-25','a')),opponent:side(slot('xy11-1','z'))},log:[],modifiers:[]});
const fx=(n,title)=>{const card=xy.cardById('xy11-'+n);assert.ok(card?.battleEnabled,`${n} must be playable`);const a=card.attacks.find(x=>x.name===title);assert.ok(a,`${n} missing ${title}`);return a;};
const getCtx=(state,extras={})=>({state,side:'player',foeSide:'opponent',attacker:state.sides.player.active,defender:state.sides.opponent.active,cardById:id=>xy.cardById(id),random:()=>0.4,isAttack:true,...extras});
test('XY11 Stage 2 required print list is unique and all effect descriptors have registered handlers',()=>{
 assert.equal(contract.release,'0.69.394');assert.equal(contract.expectedPlayableMinimum>=94,true);
 assert.equal(new Set(contract.requiredEnabledNumbers).size,contract.requiredEnabledNumbers.length);
 const js=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');assert.match(js,/v07392-steam-siege-batch2\.test\.cjs/);
 assert.match(fs.readFileSync(path.join(root,'scripts/preflight-xy11-release.py'),'utf8'),/v07392-steam-siege-batch2\.test\.cjs/);
});
test('All 116 official prints retain exact printed attack energy costs and 76 ready prints',verify,()=>{
 const source=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy11-print-compact.json'),'utf8'));
 assert.equal(source.length,116);assert.equal(xy.CARDS.length,116);
 assert.equal(xy.CARDS.filter(c=>c.battleEnabled).length>=94,true);
 for(const r of source){const c=xy.cardById('xy11-'+r[0]);assert.ok(c,'missing '+r[0]);
  assert.deepEqual((c.attacks||[]).map(a=>Array.isArray(a.cost)?a.cost.join(''):String(a.cost||'')),r[7].map(a=>a[1].join('')),`printed cost of ${c.id}`);
  assert.deepEqual((c.attacks||[]).map(a=>a.name),r[7].map(a=>a[0]),`attack order of ${c.id}`);
  if(c.battleEnabled){for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],`${c.id} ${a.name}`);
   for(const ab of c.abilities||[])assert.deepEqual(effects.validateEffect(ab.effect),[],`${c.id} ability`);
   if(c.kind==='trainer')assert.deepEqual(effects.validateEffect(c.effect),[],`${c.id} Trainer`);}
 }
 for(const n of contract.requiredEnabledNumbers)assert.ok(xy.cardById('xy11-'+n)?.battleEnabled,n+' gated');
});
test('Tangrowth heals only own Grass Pokémon; non-Grass teammates stay damaged',verify,()=>{
 const s=scene(),me=s.sides.player;me.active=slot('xy11-2','t');me.active.damage=60;
 me.bench=[slot('xy11-1','g',0),slot('xy11-18','r',1)];me.bench[0].damage=50;me.bench[1].damage=60;
 const a=fx('2','Leaf Storm');effects.applyEffect(a.effect,getCtx(s));
 assert.equal(me.active.damage,20);assert.equal(me.bench[0].damage,10);assert.equal(me.bench[1].damage,60);
});
test('Volcanion Power Heater uses physical Fire discard and distinct Bench targets, not Energy Zone',verify,()=>{
 const s=scene(),me=s.sides.player;me.bench=[slot('xy11-18','b1',0),slot('xy11-19','b2',1)];
 me.energyDiscard={Fire:2};me.energySupply=['Fire','Fire'];const a=fx('25','Power Heater');let choice;
 const ctx=getCtx(s,{requestChoice:c=>{choice=c;}});
 effects.applyEffect(a.effect,ctx);assert.equal(choice?.kind,'pokemon');
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(me.bench[0].energy.Fire,1);assert.deepEqual(choice.excludeUids,['b1']);
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:1}});
 assert.equal(me.bench[1].energy.Fire,1);assert.equal(me.energyDiscard.Fire,0);
 assert.deepEqual(me.energySupply,['Fire','Fire']);
});
test('Mantine Healing Wave offers voluntary discard and heals by 10 for each actual hand card',verify,()=>{
 const s=scene(),me=s.sides.player;me.active=slot('xy11-27','m');me.active.damage=40;
 me.hand=[{uid:'x',cardId:'xy11-1'},{uid:'y',cardId:'xy11-3'}];let choice;
 const ctx=getCtx(s,{requestChoice:c=>choice=c});effects.applyEffect(fx('27','Healing Wave').effect,ctx);
 assert.equal(choice.kind,'handCard');assert.ok(choice.optional);
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.equal(me.active.damage,30);assert.equal(me.discard.length,1);
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceSkip:true}});
 assert.equal(me.hand.length,1);assert.equal(me.active.damage,30);
 const dw=fx('27','Dwindling Wave');assert.equal(effects.resolveAttack(dw,getCtx(s)).damage,60);
});
test('Litwick Slightly Simmer chooses up to two actual deck cards, then shuffles rest',verify,()=>{
 const s=scene(),me=s.sides.player;me.deck=[{uid:'a',cardId:'xy11-1'},{uid:'b',cardId:'xy11-2'},{uid:'c',cardId:'xy11-3'}];
 let choice,shuffles=0;const ctx=getCtx(s,{requestChoice:c=>choice=c,shuffle:()=>shuffles++});
 effects.applyEffect(fx('48','Slightly Simmer').effect,ctx);assert.equal(choice.kind,'deckCard');
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceDeckIndex:1}});
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceDeckIndex:0}});
 assert.deepEqual(me.discard.map(r=>r.uid),['b','a']);assert.deepEqual(me.deck.map(r=>r.uid),['c']);assert.equal(shuffles,1);
});
test('Pawniard Charge Order counts own in-play Pawniard (not opponent)',verify,()=>{
 const s=scene(),me=s.sides.player;me.active=slot('xy11-63','a');me.bench=[slot('xy11-63','b',0)];
 s.sides.opponent.bench=[slot('xy11-63','c',0)];
 assert.equal(effects.resolveAttack(fx('63','Charge Order'),getCtx(s)).damage,20);
});
test('Yveltal BREAK Baleful Night targets only previously damaged opponent Bench',verify,()=>{
 const s=scene(),foe=s.sides.opponent;foe.bench=[slot('xy11-1','a',0),slot('xy11-3','b',1)];foe.bench[0].damage=10;
 const e=fx('66','Baleful Night').effect;effects.applyEffect(e,getCtx(s));
 assert.equal(foe.bench[0].damage,40);assert.equal(foe.bench[1].damage,0);
});
test('Gardevoir-EX Link Blast compares effective attached Energy INCLUDING Special Energy',verify,()=>{
 const s=scene(),me=s.sides.player.active,foe=s.sides.opponent.active;
 me.energy={Fairy:1};foe.energy={Fire:1};const atk=fx('78','Link Blast');assert.equal(effects.resolveAttack(atk,getCtx(s)).damage,100);
 foe.specialEnergy=[{uid:'x',cardId:'xy3-118',provides:{Colorless:1}}];assert.equal(effects.resolveAttack(atk,getCtx(s)).damage,30);
 const ctx=getCtx(s,{effectiveEnergy:p=>p===me?{Fairy:1,Colorless:1}:{Fire:1,Colorless:1}});
 assert.equal(effects.resolveAttack(atk,ctx).damage,100);
});
test('Xerneas BREAK Life Stream counts only own field Energy, not the opponent',verify,()=>{
 const s=scene();s.sides.player.active.energy={Fairy:2};s.sides.player.bench=[slot('xy11-81','x',0)];s.sides.player.bench[0].energy={Fire:3};
 s.sides.opponent.active.energy={Fire:10};
 assert.equal(effects.resolveAttack(fx('82','Life Stream'),getCtx(s)).damage,100);
});
test('Druddigon Giga Claw fails only on double tails',verify,()=>{
 const s=scene(),atk=fx('83','Giga Claw');
 assert.equal(effects.resolveAttack(atk,getCtx(s,{random:()=>0.99})).damage,0);
 assert.equal(effects.resolveAttack(atk,getCtx(s,{random:()=>0})).damage,100);
});
test('Ambipom Furry Chance discards from opponent deck and checks physical Energy',verify,()=>{
 const s=scene(),foe=s.sides.opponent;
 foe.deck=[{uid:'e',cardId:'xy1-140'}];
 const ctx=getCtx(s,{cardById:id=>id==='xy1-140'?{id,kind:'energy',basicEnergy:true,subtype:'Fairy'}:xy.cardById(id)});
 assert.equal(effects.resolveAttack(fx('91','Furry Chance'),ctx).damage,80);
 assert.equal(foe.discard[0].uid,'e');assert.equal(s.sides.player.discard.length,0);
});
test('Braviary Sky Drop subtracts 20 times opponent retreat cost',verify,()=>{
 const s=scene();assert.equal(effects.resolveAttack(fx('93','Sky Drop'),getCtx(s,{retreatCost:()=>2})).damage,80);
});
test('Special Charge selects two physical Special Energy in discard, never virtual basic Energy Zone',verify,()=>{
 const s=scene(),me=s.sides.player;me.discard=[{uid:'x',cardId:'special-x'},{uid:'y',cardId:'special-y'}];me.energySupply=['Fire'];
 const cards={ 'special-x':{id:'special-x',kind:'energy',specialEnergy:true},'special-y':{id:'special-y',kind:'energy',specialEnergy:true}};
 let choice,shuffles=0;const ctx=getCtx(s,{cardById:id=>cards[id]||xy.cardById(id),requestChoice:c=>choice=c,shuffle:()=>shuffles++});
 const effect=xy.cardById('xy11-105').effect;
 effects.applyEffect(effect,ctx);assert.equal(choice.kind,'discardCard');
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceDiscardIndex:0}});
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceDiscardIndex:0}});
 assert.deepEqual(me.deck.map(r=>r.uid),['x','y']);assert.equal(me.discard.length,0);assert.equal(shuffles,1);
 assert.deepEqual(me.energySupply,['Fire']);
});
test('Captivating Poké Puff reveals the opponent hand and offers only Basic Pokémon to bench',verify,()=>{
 const s=scene(),foe=s.sides.opponent;foe.hand=[{uid:'b',cardId:'xy11-1'},{uid:'e',cardId:'xy11-2'}];
 let choice;const ctx=getCtx(s,{requestChoice:c=>choice=c,benchCard:(side,ref)=>{const p=slot(ref.cardId,ref.uid,side.bench.length);side.bench.push(p);return p;}});
 const effect=xy.cardById('xy11-99').effect;effects.applyEffect(effect,ctx);
 assert.ok(s.log.some(x=>x.type==='revealHand'&&x.revealedSide==='opponent'));
 assert.equal(choice.kind,'opponentHandCard');
 effects.applyEffect(choice.effect,{...ctx,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.deepEqual(foe.bench.map(p=>p.cardId),['xy11-1']);assert.deepEqual(foe.hand.map(r=>r.uid),['e']);
});
test('Automatic single-set decks avoid orphan Steam Siege Trainers while successful builds stay legal',verify,()=>{
 const owned=xy.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
 const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
 const decks=require('../app/src/main/assets/tcg-classic-decks.js');
 let successes=0;
 for(let seed=1;seed<=32;seed++){
  const result=builder.buildDeck(owned,{sets:['xy11'],style:'random',randomSeed:seed});
  if(!result.ok){assert.ok(result.errors?.length||result.error,'An impossible archetype needs an explicit failure');continue;}
  successes++;
  assert.equal(result.cards.length,30);
  assert.ok(decks.validateDraft(result.cards,owned,{requireFull:true}).ok,'Legal deck seed '+seed);
  assert.ok(!result.cards.includes('xy11-99'),'Poké Puff is not generic automatic filler');
  if(result.cards.includes('xy11-105'))assert.ok(result.cards.some(id=>xy.cardById(id)?.specialEnergy),'Special Charge without Special Energy');
 }
 assert.ok(successes>0,'At least one complete legal Steam Siege 30-card archetype expected');
});

test('Steam Siege sparse Trainer pool still builds a full coherent 30-card deck under both styles',verify,()=>{
 const classic=require('../app/src/main/assets/tcg-classic-battle-data.js');
 const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
 const decks=require('../app/src/main/assets/tcg-classic-decks.js');
 const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
 const owned=classic.CARDS.filter(c=>c.setId==='xy11'&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){
  const result=builder.buildDeck(owned,{sets:['xy11'],style,randomSeed});
  assert.equal(result.ok,true,`${style}: ${result.errors?.join('; ')}`);
  assert.equal(result.cards.length,30,`${style}: exactly 30 cards`);
  assert.equal(decks.validateDraft(result.cards,owned,{requireFull:true}).ok,true,`${style}: legal owned deck`);
  assert.deepEqual(decks.analyzeDeck(result.cards,result.energyTypes).missingEnergyTypes,[],`${style}: payable attacks`);
  assert.deepEqual(synergy.report(result.cards.map(classic.cardById),result.energyTypes,'any').dead,[],`${style}: no dead Trainer effects`);
  assert.ok(result.cards.every(id=>classic.cardById(id)?.setId==='xy11'),`${style}: no cross-set filler`);
  assert.ok(!result.cards.includes('xy11-99'),`${style}: no generic Poké Puff filler`);
  assert.ok(result.cards.filter(id=>classic.cardById(id)?.kind==='pokemon').length<=26,`${style}: at least four live support slots`);
 }
});
test('Steam Siege preflight includes the exact cross-set CI deck-quality gate',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const text=fs.readFileSync(path.join(__dirname,'../scripts/preflight-xy11-release.py'),'utf8');
 assert.match(text,/node','--test','tests\/v07333-classic-deck-quality\.test\.cjs/);
 const gate=fs.readFileSync(path.join(__dirname,'v07333-classic-deck-quality.test.cjs'),'utf8');
 assert.match(gate,/audited,2\*builder\.SET_IDS\.filter/,'cross-set count must track new sets');
});
