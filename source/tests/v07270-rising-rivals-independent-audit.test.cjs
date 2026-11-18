'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const printed=JSON.parse(fs.readFileSync(path.join(root,'data/classic/pl2-print-source.json'),'utf8'));
const rr=require(path.join(assets,'tcg-classic-rising-rivals.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const owned=rr.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'];
const energySymbol={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const codes=x=>(x||[]).map(t=>energySymbol[t]).join('');
const cById=id=>db.cardById(id);
const printedByNumber=new Map(printed.map(x=>[String(x.number),x]));
function checkDeck(r,label){
 assert.ok(r.ok,label+' failed: '+JSON.stringify(r.errors||r.error));
 assert.equal(r.cards.length,30,label);
 const cards=r.cards.map(cById),pokemon=cards.filter(c=>c?.kind==='pokemon'),names=new Set(pokemon.map(p=>p.name));
 const isSP=pokemon.some(p=>p.isPokemonSP);
 for(const c of cards){assert.ok(c?.battleEnabled,label+' gated '+c?.id);assert.equal(c.setId,'pl2',label+' off-set '+c.id);}
 for(const p of pokemon)if(p.evolvesFrom)assert.ok(names.has(p.evolvesFrom),label+' orphan '+p.id+' missing '+p.evolvesFrom);
 if(!isSP)for(const id of ['pl2-90','pl2-91','pl2-95','pl2-96'])assert.ok(!r.cards.includes(id),label+' dead SP-only card '+id);
 const count=id=>r.cards.filter(c=>c===id).length;
 assert.ok(count('pl2-96')<=2,label+' SP Radar overload');
 assert.ok(count('pl2-95')<=2,label+' Technical Machine G overload');
 // Basic Energy comes from the Zone in this format. Flint searches *hand*
 // Energy, so pure Rising Rivals auto-decks must not use it as filler.
 assert.equal(count('pl2-91'),0,label+' Flint cannot attach zone-only Energy from hand');
}
test('all 120 authentic prints preserve all static card rules, statistics, costs, status and weaknesses',()=>{
 assert.equal(printed.length,120);assert.equal(rr.CARDS.length,120);
 assert.equal(printed.reduce((n,p)=>n+(p.attacks||[]).length,0),188);
 assert.equal(printed.reduce((n,p)=>n+(p.abilities||[]).length,0),45);
 for(const p of printed){
  const c=rr.cardById('pl2-'+p.number);assert.ok(c,p.number);
  assert.equal(c.name,p.name,c.id);assert.equal(c.rarity,p.rarity||'',c.id);
  assert.equal(c.kind,{'Pokémon':'pokemon','Trainer':'trainer','Energy':'energy'}[p.supertype],c.id);
  assert.ok(c.battleEnabled&&c.deckEligible,c.id+' not enabled');
  if(c.kind==='pokemon'){
   assert.equal(c.hp,Number(p.hp),c.id);assert.equal(c.stage,p.subtypes[0],c.id);
   assert.deepEqual(c.types,p.types,c.id);assert.equal(c.retreat,Number(p.convertedRetreatCost||0),c.id);
   assert.equal(c.evolvesFrom,p.evolvesFrom||(p.subtypes[0]==='Level-Up'?p.name.replace(/ LV\.X$/,''):null),c.id);
   assert.deepEqual(c.weaknesses,p.weaknesses||[],c.id+' weaknesses');
   assert.deepEqual(c.resistances,p.resistances||[],c.id+' resistances');
   assert.equal(c.isPokemonSP,p.subtypes.includes('SP'),c.id);
   assert.deepEqual(c.attacks.map(a=>[a.name,a.cost,a.damageText,a.text]),(p.attacks||[]).map(a=>[a.name,codes(a.cost),a.damage||null,a.text||'']),c.id+' attack print');
   assert.deepEqual(c.abilities.map(a=>[a.name,a.text,a.printedPowerType]),(p.abilities||[]).map(a=>[a.name,a.text||'',a.type==='Poké-Body'?'body':'power']),c.id+' powers');
   for(const a of c.attacks||[]){assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);if(a.text?.trim())assert.notEqual(a.effect.type,'noop',c.id+' '+a.name+' no-op');}
   for(const a of c.abilities||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
  }else{assert.equal(c.text,(p.rules||[]).join('\n'),c.id);assert.deepEqual(fx.validateEffect(c.effect),[],c.id);}
 }
});
test('104 focused Rising Rivals Pokémon and 36 CPU decks have coherent physical cards and SP support',()=>{
 const focus=rr.CARDS.filter(c=>c.kind==='pokemon');assert.equal(focus.length,104);
 for(const p of focus)checkDeck(builder.buildDeck(owned,{sets:['pl2'],focusCardId:p.id,randomSeed:47}),p.id);
 for(const type of types)for(let seed=1;seed<=4;seed++)checkDeck(cpu.generate({sets:['pl2'],type,seed:53*seed}),`CPU ${type} ${seed}`);
});
test('manually retained SP Radar copies are not deleted by automatic eligibility caps',()=>{
 const chosen=['pl2-96','pl2-96','pl2-96'];
 const r=builder.buildDeck(owned,{sets:['pl2'],focusCardId:'pl2-59',cards:chosen,randomSeed:47});
 assert.ok(r.ok,(r.errors||[]).join(','));
 assert.ok(r.cards.filter(id=>id==='pl2-96').length>=3,'manual choices should remain');
});
const sample=cpu.generate({sets:['pl2'],type:'Grass',seed:37});assert.ok(sample.ok);
function board(a,b){
 const s=core.createBattle({format:'classic',playerDeck:sample.cards,opponentDeck:sample.cards,firstSide:'player',seed:51,playerEnergyTypes:types.filter(x=>x!=='Colorless'),opponentEnergyTypes:types.filter(x=>x!=='Colorless')});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';s.sides.player.turnCount=6;s.sides.opponent.turnCount=6;
 s.sides.player.active=core.makePokemonSlot(a,2,'focus');s.sides.opponent.active=core.makePokemonSlot(b,2,'target');
 s.sides.player.bench=[];s.sides.opponent.bench=[];s.sides.player.hand=[];s.sides.opponent.hand=[];
 s.sides.player.active.energy={Lightning:5,Colorless:5};s.sides.opponent.active.energy={};return s;
}
test('Shiftry Unlucky Wind forces opponent-turn coin tails only while Body is live',()=>{
 const s=board('pl2-112','pl2-13');
 const move=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1);
 assert.ok(move,'Pikachu Thunder Jolt is payable');core.applyAction(s,'player',move);
 assert.equal(s.sides.player.active.damage,10,'tails self-damage must happen');
});
test('Mamoswine Icy Aura respects Water typing and does not damage Water Active Pokémon',()=>{
 const s=board('pl2-112','pl2-27');
 const end=core.legalActions(s,'player').find(a=>a.type==='endTurn');assert.ok(end);core.applyAction(s,'player',end);
 // Water-type Mamoswine is exempt; opposing Lightning Pikachu gets a counter.
 assert.equal(s.sides.player.active.damage,10);assert.equal(s.sides.opponent.active.damage,0);
 const water=board('pl2-82','pl2-27');const endWater=core.legalActions(water,'player').find(a=>a.type==='endTurn');assert.ok(endWater);core.applyAction(water,'player',endWater);
 assert.equal(water.sides.player.active.damage,0,'Water Spheal is exempt too');
});
