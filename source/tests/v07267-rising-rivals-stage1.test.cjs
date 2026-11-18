'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const printed=JSON.parse(fs.readFileSync(path.join(root,'data/classic/pl2-print-source.json'),'utf8'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const rr=require(path.join(assets,'tcg-classic-rising-rivals.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
function verifyEffect(e){assert.ok(e&&typeof e==='object');assert.deepEqual(effects.validateEffect(e),[],JSON.stringify(e));if(e.type==='sequence')for(const x of e.effects||[])verifyEffect(x);if(e.type==='coinFlip')for(const k of ['heads','tails'])if(e[k])verifyEffect(e[k]);if(e.type==='chooseOption')for(const o of e.options||[])verifyEffect(o.effect);assert.ok(e.type!=='neoRule'||['dp1:babyEvolve',...["pl2:103:damageSwitch", "pl2:104:energyCyclone", "pl2:104:waterRescue", "pl2:105:extremeAttack", "pl2:105:windErosion", "pl2:106:bladeStorm", "pl2:107:doubleShoot", "pl2:107:sandReset", "pl2:109:brightLook", "pl2:109:flashImpact", "pl2:10:grudge", "pl2:110:darknessMagic", "pl2:110:magicalReturn", "pl2:111:exercise", "pl2:11:trample", "pl2:12:longWhip", "pl2:13:sealOff", "pl2:13:unluckyWind", "pl2:14:metalFang", "pl2:15:needleShock", "pl2:16:handRefresh", "pl2:16:payback", "pl2:1:burnOut", "pl2:1:flamesOfRage", "pl2:1:flareCondition", "pl2:21:callingWave", "pl2:21:stickyHold", "pl2:22:muddyBomb", "pl2:25:groundquake", "pl2:25:sandCover", "pl2:25:saveSand", "pl2:27:icyAura", "pl2:28:magicHeal", "pl2:29:flingAway", "pl2:29:gigaHorn", "pl2:29:territoriality", "pl2:30:maternalComfort", "pl2:34:evolvingAqua", "pl2:35:leafNeedle", "pl2:35:royalGain", "pl2:36:gatherIce", "pl2:38:recover", "pl2:3:eerieAura", "pl2:40:attackAndHide", "pl2:41:frostWind", "pl2:41:iceBind", "pl2:44:heavyMetal", "pl2:45:energyRefresh", "pl2:45:plusEnergy", "pl2:46:brushOff", "pl2:46:crossCut", "pl2:47:pickupPower", "pl2:49:crunch", "pl2:49:energyShark", "pl2:50:aquaRecycle", "pl2:51:mend", "pl2:52:blessedFruit", "pl2:53:energyTyphoon", "pl2:55:primalBreath", "pl2:56:snapAttack", "pl2:5:powerSwing", "pl2:5:rainbowFloat", "pl2:5:sandWall", "pl2:63:stoke", "pl2:67:colorfulBody", "pl2:78:harden", "pl2:7:detour", "pl2:7:finalWish", "pl2:80:healingSea", "pl2:81:badSleepingHabits", "pl2:84:gatherSand", "pl2:86:rescueString", "pl2:87:camouflageGas", "pl2:87:damageBreakdown", "pl2:88:aarons", "pl2:89:bebes", "pl2:8:boundaryAura", "pl2:90:berthas", "pl2:91:flints", "pl2:92:lucians", "pl2:93:contestHall", "pl2:94:sunyshore", "pl2:95:damagePorter", "pl2:96:spRadar", "pl2:97:expedition", "pl2:98:volkner", "pl2:RT3:warmUp", "pl2:RT6:charon", "pl2:pl1mirror", "pl2:rotomShift"]].includes(e.rule),'Unverified pl2 rule enabled: '+e.rule);}
test('all 120 authentic Rising Rivals prints, including Rotom, carry exact identity/HP/type/attack descriptions',()=>{
 assert.equal(printed.length,120);assert.equal(rr.CARDS.length,120);assert.equal(new Set(rr.CARDS.map(c=>c.id)).size,120);
 assert.equal(printed.reduce((n,c)=>n+(c.attacks||[]).length,0),188);assert.equal(printed.reduce((n,c)=>n+(c.abilities||[]).length,0),45);
 for(const p of printed){const c=rr.cardById('pl2-'+p.number);assert.ok(c,p.number);assert.equal(c.name,p.name);assert.equal(c.kind,{'Pokémon':'pokemon','Energy':'energy','Trainer':'trainer'}[p.supertype]);
 if(p.supertype==='Pokémon'){assert.equal(c.hp,Number(p.hp));assert.deepEqual(c.types,p.types);assert.equal(c.stage,p.subtypes[0]);assert.deepEqual(c.attacks.map(a=>[a.name,a.text]),(p.attacks||[]).map(a=>[a.name,a.text||'']));assert.deepEqual(c.abilities.map(a=>[a.name,a.text]),(p.abilities||[]).map(a=>[a.name,a.text||'']));}
 else assert.equal(c.text,(p.rules||[]).join('\n'));
 if(c.battleEnabled){assert.equal(c.deckEligible,true);assert.equal(c.support.status,'FULL');for(const a of c.attacks||[])verifyEffect(a.effect);for(const a of c.abilities||[])verifyEffect(a.effect);if(c.kind!=='pokemon')verifyEffect(c.effect);}
 else{assert.equal(c.deckEligible,false);assert.ok(c.support.reasons.length,'No reason to gate '+c.id);}
 }
 assert.ok(rr.CARDS.filter(c=>c.battleEnabled).length>=35);
});
test('Rising Rivals appears in both player and CPU set pickers, and maps actual owned cards',()=>{
 assert.ok(db.SETS.some(x=>x.id==='pl2'));
 assert.ok(builder.SET_IDS.includes('pl2'));
 assert.ok(cpu.SETS.includes('pl2'));
 assert.ok(db.cardById('pl2-RT4'));
 const rows=db.projectOwnedCards([{source:'tcg',setId:'pl2',number:'59',count:2},{source:'tcg',setId:'pl2',number:'RT4',quantity:1}]);
 assert.ok(rows.some(r=>r.gameplayId==='pl2-59'&&r.quantity===2),JSON.stringify(rows));
 assert.ok(rows.some(r=>r.gameplayId==='pl2-RT4'),JSON.stringify(rows));
});
const loan=cpu.generate({sets:['dp5'],type:'Grass',seed:25});
test('Rising Rivals visible attack buttons always complete or offer a resolvable choice',()=>{
 assert.ok(loan.ok,loan.error);
 let checked=0;
 for(const c of rr.CARDS.filter(x=>x.kind==='pokemon'&&x.battleEnabled))for(let k=0;k<c.attacks.length;k++){
  const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:87,firstSide:'player',playerEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'],opponentEnergyTypes:['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal']});
  s.phase='battle';s.turnNumber=10;s.activeSide='player';
  for(const side of ['player','opponent']){const ss=s.sides[side];ss.turnCount=5;ss.bench=[];ss.hand=[{uid:'x-'+side,cardId:'pl2-99'}];ss.discard=[];ss.lostZone=[];}
  s.sides.player.deck.unshift({uid:'waterbasic',cardId:'dp1-125'},{uid:'grassbasic',cardId:'dp1-123'},{uid:'firebasic',cardId:'dp1-124'},{uid:'eeveelution',cardId:'pl2-19'},{uid:'trainer',cardId:'pl1-109'});
  s.sides.player.active=core.makePokemonSlot(c.id,2,'p-'+c.id);s.sides.player.active.energy={Grass:10,Fire:10,Water:10,Lightning:10,Psychic:10,Fighting:10,Darkness:10,Metal:10,Colorless:10};
  s.sides.opponent.active=core.makePokemonSlot('pl2-73',2,'dummy');s.sides.opponent.active.energy={Water:3};s.sides.opponent.active.damage=10;const fresh=core.makePokemonSlot('pl2-82',2,'fresh');fresh.benchSlot=0;s.sides.opponent.bench.push(fresh);
  const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===k);
  assert.ok(a,c.id+' '+c.attacks[k].name+' missing attack');
  assert.doesNotThrow(()=>core.applyAction(s,'player',a),c.id+' '+c.attacks[k].name);
  for(let t=0;t<8&&s.phase==='effectChoice';t++){
    const chooser=s.choiceSide||'player',choices=core.legalActions(s,chooser);
    const opt=choices.find(x=>x.type==='effectChoice'&&!x.choiceSkip)||choices.find(x=>x.type==='effectChoice')||choices.find(x=>x.type==='chooseEffect')||choices[0];
    assert.ok(opt,c.id+' stuck with no choice action');
    assert.doesNotThrow(()=>core.applyAction(s,chooser,opt),c.id+' choice '+t);
  }
  assert.notEqual(s.phase,'effectChoice',c.id+' '+c.attacks[k].name+' stuck in choice');checked++;
 }
 assert.ok(checked>=58,checked);
});

test('CPU generates 30-card Rising Rivals decks for all nine Energy types without gated effects',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless']){
  const result=cpu.generate({sets:['pl2'],type,seed:37});assert.ok(result.ok,type+': '+(result.error||result.errors));
  assert.equal(result.cards.length,30,type);
  for(const id of result.cards){const c=db.cardById(id);assert.ok(c&&c.setId==='pl2'&&c.battleEnabled,type+' '+id);}
 }
});
test('Flareon Undevelop returns its actual evolution to hand, preserving Eevee',()=>{
 const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:31,firstSide:'player',playerEnergyTypes:['Fire'],opponentEnergyTypes:['Fire']});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.player.hand=[];
 const mon=core.makePokemonSlot('pl2-19',3,'flareon-evolved');mon.stack=['pl2-59','pl2-19'];mon.evolvedOnTurn=9;s.sides.player.active=mon;
 const ability=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='pl2-19');assert.ok(ability);
 core.applyAction(s,'player',ability);
 assert.equal(s.sides.player.active.cardId,'pl2-59');
 assert.ok(s.sides.player.hand.some(r=>r.cardId==='pl2-19'));
});
test('Turtwig GL Overgrow increases only damaged Turtwig damage, and Giga Drain heals actual dealt damage',()=>{
 const field=damaged=>{
  const s=core.createBattle({format:'classic',playerDeck:loan.cards,opponentDeck:loan.cards,seed:39,firstSide:'player',playerEnergyTypes:['Grass'],opponentEnergyTypes:['Grass']});
  s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;
  s.sides.player.active=core.makePokemonSlot('pl2-85',3,'turtwig');s.sides.player.active.energy={Grass:3,Colorless:3};s.sides.player.active.damage=damaged;
  s.sides.opponent.active=core.makePokemonSlot('pl2-69',3,'munchlax');
  return s;
 };
 const healthy=field(0);core.applyAction(healthy,'player',core.legalActions(healthy,'player').find(a=>a.type==='attack'));const regularHit=healthy.sides.opponent.active.damage;
 const hurt=field(30);core.applyAction(hurt,'player',core.legalActions(hurt,'player').find(a=>a.type==='attack'));
 assert.equal(hurt.sides.opponent.active.damage,regularHit+30);
 assert.equal(hurt.sides.player.active.damage,0,'Giga Drain heals the inflicted damage');
});
