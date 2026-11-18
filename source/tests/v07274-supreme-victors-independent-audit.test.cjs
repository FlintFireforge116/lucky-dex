'use strict';
// Supreme Victors independent audit: printed card fidelity, real battle
// outcomes, and 30-card player/CPU deck coherence. This file is exercised
// by Gradle after regenerating the catalogue from the official archive.
const {test}=require('node:test'),assert=require('node:assert/strict');
const printed=require('../data/classic/pl3-print-source.json');
const pl3=require('../app/src/main/assets/tcg-classic-supreme-victors');
const db=require('../app/src/main/assets/tcg-classic-battle-data');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const core=require('../app/src/main/assets/tcgp-battle-core');
const builder=require('../app/src/main/assets/tcg-classic-deck-builder');
const cpu=require('../app/src/main/assets/tcg-classic-opponents');
const own=pl3.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
const fullOwn=db.CARDS.filter(c=>c.battleEnabled).map(c=>({gameplayId:c.id,quantity:4}));
const types=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'];
const code={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'};
const cost=x=>(x||[]).map(t=>code[t]).join('');
const basic=types.filter(t=>t!=='Colorless');
const loaner=cpu.generate({sets:['pl3'],type:'Grass',seed:13});
assert.ok(loaner.ok,'A legal Supreme Victors loaner is needed for the audit scenarios');
function board(hero,foe='pl3-5'){
 const s=core.createBattle({format:'classic',playerDeck:loaner.cards,opponentDeck:loaner.cards,seed:49,firstSide:'player',playerEnergyTypes:basic,opponentEnergyTypes:basic});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';
 for(const side of ['player','opponent']){const p=s.sides[side];p.turnCount=5;p.hand=[];p.bench=[];p.discard=[];p.energyDiscard={};}
 s.sides.player.active=core.makePokemonSlot(hero,2,'auditor-hero');
 s.sides.opponent.active=core.makePokemonSlot(foe,2,'auditor-foe');
 s.sides.player.active.energy={Colorless:5,Fire:3,Darkness:4,Grass:3,Water:3,Psychic:3,Fighting:3};
 s.sides.opponent.active.energy={Colorless:2};
 return s;
}
function actions(s,type){const side=s.pendingChoice?.side||s.choiceSide||'player';return core.legalActions(s,side).filter(x=>x.type===type);}
function hit(s,name){const a=actions(s,'attack').find(x=>db.cardById(x.attackCardId||s.sides.player.active.cardId)?.attacks?.[x.attackIndex]?.name===name);assert.ok(a,`Missing legal attack ${name}`);core.applyAction(s,'player',a);return a;}
function pick(s,predicate){const a=actions(s,'effectChoice').find(predicate);assert.ok(a,'Expected legal choice: '+JSON.stringify(actions(s,'effectChoice').map(x=>x.choiceLabel)));core.applyAction(s,s.pendingChoice?.side||s.choiceSide||'player',a);return a;}
function checkDeck(r,label){
 assert.ok(r.ok,label+': '+JSON.stringify(r.errors||[]));assert.equal(r.cards.length,30,label+' card count');
 const cards=r.cards.map(db.cardById),mons=cards.filter(c=>c?.kind==='pokemon'),names=new Set(mons.map(c=>c.name)),energy=new Set(r.energyTypes);
 assert.ok(energy.size>=1&&energy.size<=3,label+' Energy Zone plan');
 for(const c of cards){assert.ok(c?.battleEnabled,label+' gated card '+c?.id);assert.equal(c.setId,'pl3',label+' off-set '+c.id);}
 for(const p of mons){if(p.evolvesFrom)assert.ok(names.has(p.evolvesFrom),label+' orphan '+p.id+' needs '+p.evolvesFrom);
   assert.ok((p.attacks||[]).some(a=>[...a.cost].every(sym=>sym==='C'||energy.has(Object.keys(code).find(k=>code[k]===sym)))),label+' unpayable '+p.id+' costs '+p.attacks.map(x=>x.cost)+' Zone '+r.energyTypes);
 }
 const hasLV=mons.some(p=>p.stage==='Level-Up'),hasSP=mons.some(p=>p.isPokemonSP);
 if(!hasLV)assert.ok(!r.cards.includes('pl3-134'),label+' orphan Battle Tower');
 if(!hasSP)assert.ok(!r.cards.includes('pl3-135'),label+' orphan Champion\'s Room');
}
test('all 153 printed cards match canonical identity, stats, typing, rarity, costs, abilities and effects',()=>{
 assert.equal(printed.length,153);assert.deepEqual(pl3.coverage(),{total:153,battleEnabled:153,gated:[]});
 assert.equal(printed.reduce((sum,c)=>sum+(c.attacks||[]).length,0),254);
 assert.equal(printed.reduce((sum,c)=>sum+(c.abilities||[]).length,0),34);
 for(const p of printed){const c=pl3.cardById('pl3-'+p.number);assert.ok(c?.battleEnabled,p.number);assert.equal(c.name,p.name,c.id);assert.equal(c.rarity,p.rarity||'',c.id);
   assert.equal(c.kind,p.supertype==='Pokémon'?'pokemon':'trainer',c.id);
   if(c.kind==='pokemon'){
     assert.equal(c.stage,p.subtypes[0],c.id);assert.equal(c.hp,Number(p.hp),c.id);assert.deepEqual(c.types,p.types,c.id);assert.equal(c.retreat,Number(p.convertedRetreatCost||0),c.id);
     assert.deepEqual(c.weaknesses,p.weaknesses||[],c.id);assert.deepEqual(c.resistances,p.resistances||[],c.id);
     assert.equal(c.evolvesFrom,p.evolvesFrom||((p.subtypes||[]).includes('Level-Up')?p.name.replace(/ LV\.X$/,''):null),c.id);
     assert.equal(c.isPokemonSP,(p.subtypes||[]).includes('SP'),c.id);
     assert.deepEqual(c.attacks.map(a=>[a.name,a.cost,a.damageText,a.text]),(p.attacks||[]).map(a=>[a.name,cost(a.cost),a.damage||null,a.text||'']),c.id);
     assert.deepEqual(c.abilities.map(a=>[a.name,a.text,a.printedPowerType]),(p.abilities||[]).map(a=>[a.name,a.text||'',a.type==='Poké-Body'?'body':'power']),c.id);
   }else assert.equal(c.text,(p.rules||[]).join('\n'),c.id);
   for(const e of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{effect:c.effect}]:[])]){
     assert.deepEqual(fx.validateEffect(e.effect),[],c.id+' '+(e.name||'Trainer'));
     if(e.text?.trim()&&e.name)assert.notEqual(e.effect.type,'noop',c.id+' '+e.name);
   }
 }
});
test('Magmortar Flame Ball physically transfers one Fire Energy to the chosen Bench Pokémon',()=>{
 const s=board('pl3-6');s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'bench')];s.sides.player.bench[0].energy={Fire:2};
 const before=s.sides.player.active.energy.Fire;hit(s,'Flame Ball');pick(s,a=>a.choiceLabel?.startsWith('Move Fire Energy to'));
 assert.equal(s.sides.player.active.energy.Fire,before-1);assert.equal(s.sides.player.bench[0].energy.Fire,3);
});
test('Camerupt Moving Fire physically transfers Fire Energy from selected Bench Pokémon',()=>{
 const s=board('pl3-18');s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'bench')];s.sides.player.bench[0].energy={Fire:2};
 const before=s.sides.player.active.energy.Fire;hit(s,'Moving Fire');pick(s,a=>a.choiceLabel?.startsWith('Move Fire Energy from'));
 assert.equal(s.sides.player.active.energy.Fire,before+1);assert.equal(s.sides.player.bench[0].energy.Fire,1);
});
test('Charizard G LV.X Call for Power moves actual attachments without consuming the once-per-turn allowance',()=>{
 const s=board('pl3-143');s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'bench')];s.sides.player.bench[0].energy={Fire:2};
 const power=actions(s,'ability').find(a=>a.cardId==='pl3-143');assert.ok(power);core.applyAction(s,'player',power);
 pick(s,a=>a.choiceLabel?.startsWith('Move Fire'));assert.equal(s.sides.player.active.energy.Fire,4);
 assert.equal(s.sides.player.bench[0].energy.Fire,1);
 assert.ok(actions(s,'ability').some(a=>a.cardId==='pl3-143'),'Call for Power can be used more than once');
});
test('Yanma Baton Pass moves selected physical Energy and preserves its remaining Energy',()=>{
 const s=board('pl3-SH9');s.sides.player.active.energy={Grass:2,Fire:1};s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'bench')];
 hit(s,'Baton Pass');pick(s,a=>a.choiceLabel?.startsWith('Switch to'));
 assert.equal(s.sides.player.active.cardId,'pl3-93');
 pick(s,a=>a.choiceLabel==='Move Grass Energy');
 pick(s,a=>a.choiceLabel==='Move no more Energy');
 assert.equal(s.sides.player.active.energy.Grass,1);
 assert.equal(s.sides.player.bench.find(p=>p.uid==='auditor-hero').energy.Grass,1);
 assert.equal(s.sides.player.bench.find(p=>p.uid==='auditor-hero').energy.Fire,1);
});
test('Absol G Feint Attack ignores opposing protective Poké-Bodies as printed',()=>{
 const s=board('pl3-1','pl3-SH7');assert.equal(s.sides.opponent.hand.length,0,'Aqua Mirage condition');
 hit(s,'Feint Attack');assert.equal(s.sides.opponent.active.damage,20,'Feint bypasses Aqua Mirage');
});
test('Supreme Victors terminal Primeape is buildable despite much later evolution species',()=>{
 checkDeck(builder.buildDeck(own,{sets:['pl3'],focusCardId:'pl3-39',randomSeed:47}),'Primeape');
});
test('Rayquaza C and its LV.X both receive all three mandatory attack Energy types',()=>{
 for(const id of ['pl3-8','pl3-146']){const r=builder.buildDeck(own,{sets:['pl3'],focusCardId:id,randomSeed:47});checkDeck(r,id);
   assert.deepEqual(new Set(r.energyTypes),new Set(['Water','Psychic','Fighting']));
   assert.ok(r.cards.includes('pl3-8')&&r.cards.includes('pl3-146'),'complete Basic/LV.X line');
 }
});
test('Staravia requires its actual Staraptor in the selected set pool, never an orphan',()=>{
 const absent=builder.buildDeck(own,{sets:['pl3'],focusCardId:'pl3-85',randomSeed:47});assert.equal(absent.ok,false);
 const valid=builder.buildDeck(fullOwn,{sets:['pl3','dp1'],focusCardId:'pl3-85',randomSeed:47});assert.ok(valid.ok,(valid.errors||[]).join(','));
 assert.ok(valid.cards.some(id=>db.cardById(id)?.name==='Staraptor'));assert.ok(valid.cards.includes('pl3-85'));
});
test('146 focused Pokémon and 225 CPU type/seed builds have legal Energy, evolution and Stadium synergy',()=>{
 let expectedUnavailable=0,accepted=0;
 for(const c of pl3.CARDS.filter(c=>c.kind==='pokemon')){
   const r=builder.buildDeck(own,{sets:['pl3'],focusCardId:c.id,randomSeed:47});
   if(c.id==='pl3-85'){assert.equal(r.ok,false);expectedUnavailable++;continue;}
   checkDeck(r,c.id);accepted++;
 }
 assert.equal(accepted,145);assert.equal(expectedUnavailable,1);
 for(const type of types)for(let seed=0;seed<25;seed++)checkDeck(cpu.generate({sets:['pl3'],type,seed:57*seed+11}),`CPU ${type} ${seed}`);
});
test('user-saved Battle Tower is preserved even without LV.X; only automatic copies are filtered',()=>{
 const r=builder.buildDeck(own,{sets:['pl3'],focusCardId:'pl3-22',cards:['pl3-134'],randomSeed:47});
 assert.ok(r.ok,(r.errors||[]).join(','));assert.ok(r.cards.includes('pl3-134'));
});
