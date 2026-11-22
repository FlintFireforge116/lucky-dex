'use strict';
// Independent Evolutions XY12 audit: adversarial attack-resolution and zones.
// These are regressions from actual flaws missed by the completion smoke tests.
const {test}=require('node:test'),assert=require('node:assert/strict');
const xy=require('../app/src/main/assets/tcg-classic-evolutions.js');
const data=require('../app/src/main/assets/tcg-classic-battle-data.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder.js');
const decks=require('../app/src/main/assets/tcg-classic-decks.js');
const synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
const slot=(id,uid)=>({cardId:id,uid,stack:[id],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0});
const board=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],turnCount:1,benchLimit:3});
const fresh=(own='xy12-36',other='xy12-9')=>({format:'classic',turnNumber:8,firstSide:'player',activeSide:'player',sides:{player:board(slot(own,'us')),opponent:board(slot(other,'foe'))},modifiers:[],log:[]});
const ctx=(s,extra={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,random:()=>.8,shuffle:()=>{},drawCard:()=>{},...extra});
const move=(n,name)=>xy.cardById('xy12-'+n).attacks.find(a=>a.name===name);
const apply=(s,e,extra={})=>effects.applyEffect(e,ctx(s,extra));
const choice=(s,e,extra={})=>{let found;apply(s,e,{...extra,requestChoice:c=>{found=c}});return found};

test('every printed XY12 attack resolves to a supported, non-placeholder implementation',()=>{
 assert.equal(xy.CARDS.length,113);
 for(const c of xy.CARDS){assert.ok(c.battleEnabled,c.id);for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],c.id+'/'+a.name);}
 assert.equal(xy.CARDS.reduce((n,c)=>n+(c.attacks||[]).length,0),129);
});

test('Spark Bolt resolves the optional 70 bonus BEFORE damage and discards attachments afterwards',()=>{
 const s=fresh();s.sides.player.active.energy.Lightning=3;
 const a=move(36,'Spark Bolt'),opts=effects.choicesForEffect(a.effect,ctx(s));
 assert.deepEqual(opts.map(o=>o.effectSelection),['keep','discard']);
 const basic=effects.resolveAttack(a,ctx(s,{action:{effectSelection:'keep'}}));
 assert.equal(basic.damage,70);assert.equal(basic.pendingEffects.length,0);
 assert.equal(s.sides.player.active.energy.Lightning,3);
 const boosted=effects.resolveAttack(a,ctx(s,{action:{effectSelection:'discard'}}));
 assert.equal(boosted.damage,140);assert.equal(boosted.pendingEffects.length,1);
 for(const e of boosted.pendingEffects)apply(s,e,{action:{effectSelection:'discard'}});
 assert.equal(s.sides.player.active.energy.Lightning,0);
 assert.equal(s.sides.player.energyDiscard.Lightning,3);
});

test('Spark Bolt boost discards real Special Energy as well as virtual Basics, without disturbing the defending player',()=>{
 const s=fresh();s.sides.player.active.energy.Lightning=2;
 s.sides.player.active.specialEnergy=[{uid:'double-1',cardId:'xy12-90'}];
 const result=effects.resolveAttack(move(36,'Spark Bolt'),ctx(s,{action:{effectSelection:'discard'}}));
 assert.equal(result.damage,140);
 result.pendingEffects.forEach(e=>apply(s,e));
 assert.equal(s.sides.player.active.energy.Lightning,0);
 assert.equal(s.sides.player.active.specialEnergy.length,0);
 assert.equal(s.sides.player.discard[0].cardId,'xy12-90');
 assert.equal(s.sides.player.energyDiscard.Lightning,2);
 assert.equal(s.sides.opponent.discard.length,0);
});

test('free attacks with no attached Energy cannot fabricate a Spark Bolt discard bonus',()=>{
 const s=fresh(),a=move(36,'Spark Bolt');
 assert.deepEqual(effects.choicesForEffect(a.effect,ctx(s)).map(x=>x.effectSelection),['keep']);
 const result=effects.resolveAttack(a,ctx(s,{action:{effectSelection:'discard'}}));
 assert.equal(result.damage,70);assert.equal(result.pendingEffects.length,0);
});

test('Mewtwo-EX Energy Absorption chooses an actual discarded Double Colorless card',()=>{
 for(const n of [52,103]){
  const s=fresh('xy12-'+n),p=s.sides.player;
  p.discard=[{uid:'special1',cardId:'xy12-90'},{uid:'g1',cardId:'xy12-91'}];
  const e=move(n,'Energy Absorption').effect,c=choice(s,e);
  assert.equal(c.kind,'option');assert.deepEqual(c.options,['Attach Double Colorless Energy','Attach Grass Energy']);
  apply(s,c.effect,{resolvingChoice:true,action:{choiceOption:0}});
  assert.deepEqual(p.active.specialEnergy.map(r=>r.uid),['special1']);
  assert.equal(core.effectiveEnergy(s,'player',p.active).Colorless,2);
  assert.deepEqual(p.discard.map(r=>r.uid),['g1']);
 }
});

test('Energy Absorption distinguishes a physical Basic Energy card from a virtual discarded Zone unit',()=>{
 const s=fresh('xy12-52'),p=s.sides.player;
 p.discard=[{uid:'actual-grass',cardId:'xy12-91'}];p.energyDiscard={Fire:2};
 const e=move(52,'Energy Absorption').effect;
 let c=choice(s,e);assert.equal(c.options.length,2);
 apply(s,c.effect,{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.active.energy.Grass,1);assert.equal(p.discard.length,0);assert.equal(p.energyDiscard.Fire,2);
 c=choice(s,e);assert.equal(c.options.length,1);
 apply(s,c.effect,{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard.Fire,1);
});

test('Energy Absorption does not take ordinary Pokémon, Trainers or opponent Special Energy',()=>{
 const s=fresh('xy12-52'),p=s.sides.player,foe=s.sides.opponent;
 p.discard=[{uid:'p1',cardId:'xy12-3'},{uid:'t1',cardId:'xy12-88'}];
 foe.discard=[{uid:'opp-energy',cardId:'xy12-90'}];
 const c=choice(s,move(52,'Energy Absorption').effect);assert.equal(c,undefined);
 assert.equal(p.active.specialEnergy.length,0);
});

test('automatic Evolutions decks remain legal and synergy-safe over 64 independent seeds',()=>{
 const owned=xy.CARDS.filter(c=>c.battleEnabled&&c.deckEligible).map(c=>({gameplayId:c.id,quantity:4}));
 for(let seed=0;seed<32;seed++)for(const style of ['competitive','random']){
  const r=builder.buildDeck(owned,{sets:['xy12'],style,randomSeed:seed});
  assert.equal(r.ok,true,`${style}/${seed}: ${r.errors||[]}`);assert.equal(r.cards.length,30);
  assert.ok(r.cards.every(id=>data.cardById(id)?.setId==='xy12'));
  assert.equal(decks.validateDraft(r.cards,owned,{requireFull:true}).ok,true,`${style}/${seed} legality`);
  assert.deepEqual(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes,[],`${style}/${seed} Energy`);
  assert.deepEqual(synergy.report(r.cards.map(data.cardById),r.energyTypes,'any').dead,[],`${style}/${seed} useless Trainers`);
 }
});
