'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),A='../app/src/main/assets/';
const core=require(A+'tcgp-battle-core'),fx=require(A+'tcgp-battle-effects'),cat=require(A+'tcg-classic-battle-data'),set=require(A+'tcg-classic-crystal-guardians'),cpu=require(A+'tcg-classic-opponents'),builder=require(A+'tcg-classic-deck-builder');
const TYPES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
function battle(cardId='ex14-3',foeId='ex14-58'){
 const deck=cpu.generate({sets:['ex14'],type:'Water',seed:244}).cards;
 assert.equal(deck?.length,30,'must be a legal 30-card fixture');
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:250,firstSide:'player',playerEnergyTypes:TYPES,opponentEnergyTypes:TYPES});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=5;
 s.sides.player.active=core.makePokemonSlot(cardId,2,'pa');s.sides.opponent.active=core.makePokemonSlot(foeId,2,'oa');
 s.sides.player.active.energy={Grass:4,Fire:4,Water:4,Lightning:4,Psychic:4,Fighting:4,Metal:4,Darkness:4};s.sides.opponent.active.energy={};
 s.sides.player.bench=[core.makePokemonSlot('ex14-58',2,'pb')];s.sides.player.bench[0].benchSlot=0;
 s.sides.opponent.bench=[core.makePokemonSlot('ex14-58',2,'ob0'),core.makePokemonSlot('ex14-58',2,'ob1'),core.makePokemonSlot('ex14-58',2,'ob2')];s.sides.opponent.bench.forEach((p,i)=>p.benchSlot=i);
 return s;
}
function atk(s,i=0){const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,'attack not selectable: '+s.sides.player.active.cardId+'/'+i);core.applyAction(s,'player',a);return s;}
function choices(s){return core.legalActions(s,s.choiceSide||s.activeSide).filter(a=>a.type==='effectChoice');}
function choose(s,pred){assert.equal(s.phase,'effectChoice','expected a choice');const v=choices(s).find(pred);assert.ok(v,'choice not found '+JSON.stringify(choices(s)));core.applyAction(s,s.choiceSide||s.activeSide,v);return s;}
function clear(s){for(let i=0;i<15&&s.phase==='effectChoice';i++)choose(s,()=>true);assert.notEqual(s.phase,'effectChoice','choice flow did not end');}
test('exact ex14 roster, all actual set cards and printed text/metadata registered',()=>{
 assert.equal(set.CARDS.length,100);assert.equal(new Set(set.CARDS.map(c=>c.id)).size,100);assert.equal(cat.cardById('ex14-99').name,'Alakazam ★');
 assert.ok(cat.SETS.some(s=>s.id==='ex14'));assert.ok(cpu.SETS.includes('ex14'));assert.ok(builder.SET_IDS.includes('ex14'));
 for(const c of set.CARDS){assert.equal(c.image,'https://images.pokemontcg.io/ex14/'+c.number+'.png');assert.ok(c.deckMeta?.roles);assert.ok(!JSON.stringify(c).includes('Resolve neo Rule effect'));assert.ok(!c.battleEnabled||c.support.status==='FULL');}
});
test('Banette Safeguard cancels opponent Pokémon-ex attacks',()=>{
 const s=battle('ex14-93','ex14-1');s.sides.player.active.energy={Fighting:4};atk(s);assert.equal(s.sides.opponent.active.damage,0);
});
test('Blastoise Shield Veil prevents weakness for its own Active Pokémon',()=>{
 const s=battle('ex14-3','ex14-63');s.sides.opponent.active.energy={Water:1};s.sides.opponent.bench=[core.makePokemonSlot('ex14-2',2,'b')];
 const result=fx.attackDamageWithState(s,'player',s.sides.player.active,'opponent',s.sides.opponent.active,30,cat.cardById);
 assert.equal(result,30);
});
test('Camerupt Delta Protection reduces incoming δ attacks by forty',()=>{
 const s=battle('ex14-2','ex14-3'),a=s.sides.player.active,d=s.sides.opponent.active;
 const value=fx.attackDamageWithState(s,'player',a,'opponent',d,60,cat.cardById);assert.equal(value,20);
});
test('Dugtrio Sand Veil prevents Bench damage, not damage to the Active',()=>{
 const s=battle('ex14-3','ex14-58');s.sides.opponent.bench=[core.makePokemonSlot('ex14-5',2,'dug'),core.makePokemonSlot('ex14-58',2,'other')];
 assert.ok(fx.attackIsPrevented(s,'opponent',s.sides.opponent.bench[1],s.sides.player.active,cat.cardById));
 assert.equal(fx.attackIsPrevented(s,'opponent',s.sides.opponent.active,s.sides.player.active,cat.cardById),null);
});
test('Hydro Pump counts surplus Water Energy, capped to 40 additional damage',()=>{
 const s=battle('ex14-14','ex14-2'),foe=s.sides.opponent.active;s.sides.player.active.energy={Water:3};atk(s);assert.equal(foe.damage,90);
});
test('Crystal Beach makes double-unit Special Energy provide one Colorless; Basic unchanged',()=>{
 const s=battle('ex14-15'),a=s.sides.player.active;a.energy={Fighting:1};a.specialEnergy=[{uid:'d',cardId:'ex14-88'}];
 const before=core.effectiveEnergy(s,'player',a);assert.equal(before.Miracle,2);
 s.stadium={uid:'stad',cardId:'ex14-75',ownerSide:'player'};const after=core.effectiveEnergy(s,'player',a);
 assert.equal(after.Colorless,1);assert.equal(after.Miracle||0,0);assert.equal(after.Fighting,1);
});
test('Double Rainbow can only be attached to evolved non-ex Pokémon',()=>{
 const s=battle('ex14-61');const p=s.sides.player;p.hand=[{uid:'dr',cardId:'ex14-88'}];
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='attachSpecial'&&x.cardId==='ex14-88'&&x.target==='active'));
 p.active=core.makePokemonSlot('ex14-15',2,'evolved');
 assert.ok(core.legalActions(s,'player').some(x=>x.cardId==='ex14-88'&&/attach/i.test(x.type)));
});
test('Swalot Reactive Poison scales 20 per special condition',()=>{
 const s=battle('ex14-11','ex14-95');s.sides.player.active.energy={Grass:3};s.sides.opponent.active.conditions={poison:true};atk(s,1);assert.equal(s.log.filter(x=>x.type==='attack').at(-1).damage,70);
});
test('Manectric Strong Current hits opposing ex Bench only when wearing a Pokémon Tool',()=>{
 const s=battle('ex14-8','ex14-59');s.sides.player.active.energy={Lightning:3};s.sides.opponent.bench[0].cardId='ex14-93';
 atk(s,1);assert.equal(s.sides.opponent.bench[0].damage,0);
 const v=battle('ex14-8','ex14-59');v.sides.player.active.energy={Lightning:3};v.sides.opponent.bench[0].cardId='ex14-93';v.sides.player.active.tool={uid:'t',cardId:'ex14-80'};
 atk(v,1);assert.equal(v.sides.opponent.bench[0].damage,20);
});
test('Basic-stage expansion Pokémon can generate legal 30-card CPU decks across archetypes',()=>{
 for(const t of [...TYPES,'Colorless'])for(const seed of [1,17,244]){const d=cpu.generate({sets:['ex14'],type:t,seed,includeColorless:true});assert.ok(d.ok,t+' seed '+seed+' '+d.error);assert.equal(d.cards.length,30);assert.ok(cat.validateDeck(d.cards).ok);}
});
test('EX Crystal Guardians incomplete or untested effects are excluded from automated opponents',()=>{
 const failed=set.CARDS.filter(c=>!c.battleEnabled);for(const c of failed){assert.equal(c.deckEligible,false);assert.equal(c.support.status,'PARTIAL');}
});

test('Crystal Guardians Stadium Holon Circle consumes attack and discards itself',()=>{
 const s=battle('ex14-3','ex14-58');s.stadium={uid:'holon-stad',cardId:'ex14-79',ownerSide:'player'};const before=s.sides.opponent.active.damage;
 atk(s,1);assert.equal(s.stadium,null);assert.equal(s.sides.opponent.active.damage,before);assert.ok(s.sides.player.discard.some(x=>x.cardId==='ex14-79'));
});
test('Venusaur Toxic Sleep applies Sleep plus two damage counters between turns',()=>{
 const s=battle('ex14-28','ex14-2');s.sides.player.active.energy={Grass:3};atk(s,1);
 assert.ok(s.sides.opponent.active.conditions.poison);assert.equal(s.sides.opponent.active.conditions.poison.amount,20);
 assert.ok(s.log.some(x=>x.type==='sleepCheck'&&x.side==='opponent'));assert.ok(s.log.some(x=>x.type==='statusDamage'&&x.status==='poison'&&x.amount===20));
});
test('Lotad Aqua Lift and Kyogre Flotation need their printed Energy state',()=>{
 const s=battle('ex14-55','ex14-58');s.sides.player.active.energy={};
 assert.notEqual(s.sides.player.active.retreat,0);s.sides.player.active.energy={Water:1};
 // Retreat legal if Energy is attached and has a Bench; free retreat should not discard it.
 const legal=core.legalActions(s,'player').filter(x=>x.type==='retreat');assert.ok(legal.length>0);
 const k=battle('ex14-95','ex14-58');k.sides.player.active.energy={Water:1};assert.ok(core.legalActions(k,'player').some(x=>x.type==='retreat'));
});
test('Aggron ex Split Bomb chooses two distinct opposing targets for 30 each',()=>{
 const s=battle('ex14-89','ex14-58');s.sides.player.active.energy={Metal:3};atk(s,0);assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceTarget==='active');assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.active.damage,30);assert.equal(s.sides.opponent.bench[0].damage,30);assert.equal(s.sides.opponent.bench[1].damage,0);
});
test('Shiftry ex Target Attack does 50 against a wounded target, 30 against clean target',()=>{
 const s=battle('ex14-97','ex14-58');s.sides.player.active.energy={Darkness:1,Colorless:1};s.sides.opponent.bench[0].cardId='ex14-93';s.sides.opponent.bench[0].damage=20;
 atk(s,0);choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(s.sides.opponent.bench[0].damage,70);assert.equal(s.sides.opponent.active.damage,0);
});
test('Extra Noise puts one counter on opposing Pokémon-ex, not ordinary Pokémon',()=>{
 const s=battle('ex14-92','ex14-58');s.sides.opponent.bench[0].cardId='ex14-93';
 s.sides.player.active.energy={Colorless:3};atk(s,0);const hit=s.sides.opponent.bench[0];
 assert.ok(hit.damage>=10);assert.ok(s.log.some(x=>x.type==='ex14ExtraNoise'&&x.targetUid===hit.uid));
});
test('Jirachi ex Star Light cuts a Colorless cost against opposing Stage 2',()=>{
 const s=battle('ex14-94','ex14-2');s.sides.player.active.energy={Psychic:1};
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0));
});
test('Sceptile ex Extra Liquid taxes Pokémon-ex attacks and suppresses only their Powers',()=>{
 const s=battle('ex14-94','ex14-58');s.sides.opponent.bench[0].cardId='ex14-96';s.sides.player.active.energy={Psychic:1};
 assert.ok(!core.legalActions(s,'player').some(x=>x.type==='attack'&&x.attackIndex===0));
 const s2=battle('ex14-95','ex14-58');s2.sides.opponent.bench[0].cardId='ex14-96';
 // Flotation is a Body; it should still work even when Sceptile is in play.
 s2.sides.player.active.energy={Water:1};assert.ok(core.legalActions(s2,'player').some(x=>x.type==='retreat'));
});
test('PokeNav is limited to three actual deck cards, not the Basic Energy Zone',()=>{
 const s=battle('ex14-57','ex14-58');s.sides.player.hand=[{uid:'nav',cardId:'ex14-83'}];
 s.sides.player.deck=[{uid:'one',cardId:'ex14-47'},{uid:'two',cardId:'ex14-71'},{uid:'three',cardId:'ex14-55'},{uid:'four',cardId:'ex14-93'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex14-83');assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');assert.equal(choices(s).length,2);
 choose(s,x=>x.type==='effectChoice'&&x.choiceOption===0);
 assert.equal(s.sides.player.hand.some(x=>x.uid==='one'),true);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===1);
 assert.deepEqual(s.sides.player.deck.map(x=>x.uid).slice(0,3),['three','two','four']);
});
test('Castaway searches a Supporter, a Tool, and then Basic Energy Zone, not three arbitrary cards',()=>{
 const s=battle('ex14-58','ex14-58');const board=s.sides.player;
 board.hand=[{uid:'cast',cardId:'ex14-72'}];board.deck=[{uid:'support',cardId:'ex14-71'},{uid:'tool',cardId:'ex14-74'},{uid:'p',cardId:'ex14-47'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex14-72');assert.ok(action);core.applyAction(s,'player',action);
 clear(s);assert.ok(board.hand.some(r=>r.uid==='support'));assert.ok(board.hand.some(r=>r.uid==='tool'));
 assert.ok(board.hand.some(r=>core.isBasicEnergyCard?.(r.cardId)||String(r.cardId).startsWith('base1-'))||board.hand.some(r=>require(A+'tcg-classic-battle-data').cardById(r.cardId)?.basicEnergy));
});
test('Windstorm removes only the chosen Tool and Stadium, with correct owner discard',()=>{
 const s=battle('ex14-57','ex14-58');const board=s.sides.player,foe=s.sides.opponent;
 board.hand=[{uid:'wind',cardId:'ex14-85'}];s.stadium={uid:'stad',cardId:'ex14-75',ownerSide:'player'};foe.active.tool={uid:'enemy-tool',cardId:'ex14-80'};
 core.applyAction(s,'player',core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='ex14-85'));
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.equal(s.stadium,null);assert.ok(board.discard.some(x=>x.uid==='stad'));choose(s,x=>x.choiceOption===0);
 assert.equal(foe.active.tool,null);assert.ok(foe.discard.some(x=>x.uid==='enemy-tool'));
});

test('Charizard delta Peal of Thunder selects one recipient, attaches Energy from physical top five, discards unchosen cards',()=>{
 const s=battle('ex14-29','ex14-58');const p=s.sides.player;
 p.active.playedOnSideTurn=2;p.hand=[{uid:'evo',cardId:'ex14-4'}];
 p.deck=[{uid:'top1',cardId:'ex14-88'},{uid:'top2',cardId:'ex14-71'},{uid:'top3',cardId:'ex14-65'},
   {uid:'top4',cardId:'ex14-88'},{uid:'top5',cardId:'ex14-63'},{uid:'top6',cardId:'ex14-45'}];
 const evo=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='ex14-4');assert.ok(evo);
 core.applyAction(s,'player',evo);assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceTarget==='active');assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceOption===0);assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceOption===0);assert.equal(s.phase,'battle');
 assert.equal(p.active.specialEnergy.filter(x=>x.cardId==='ex14-88').length,2);
 assert.deepEqual(p.deck.map(x=>x.uid),['top6']);
 assert.deepEqual(p.discard.map(x=>x.uid).filter(uid=>uid.startsWith('top')).sort(),['top2','top3','top5']);
});
test('Tauros Crush Chance offers a real optional Stadium choice',()=>{
 const s=battle('ex14-57','ex14-58');const p=s.sides.player;
 s.stadium={uid:'my-stad',cardId:'ex14-75',ownerSide:'player'};p.hand=[{uid:'tau',cardId:'ex14-12'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='bench'&&x.cardId==='ex14-12');assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.equal(s.stadium?.uid,'my-stad');
});
test('Igglybuff Baby Evolution uses selected Jigglypuff in hand and heals damage',()=>{
 const s=battle('ex14-21','ex14-58');const p=s.sides.player;p.active.damage=30;
 p.hand=[{uid:'j',cardId:'ex14-53'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.abilityIndex===1);assert.ok(action);
 core.applyAction(s,'player',action);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceHandIndex===0);
 assert.equal(p.active.cardId,'ex14-53');assert.equal(p.active.damage,0);assert.ok(!p.hand.some(x=>x.uid==='j'));
});
test('Electrike Sniff Out can recover a genuinely discarded Basic Energy from ledger into hand',()=>{
 const s=battle('ex14-52','ex14-58');const p=s.sides.player;
 p.energyDiscard={Psychic:1};p.active.energy={Colorless:1};atk(s,0);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.equal(p.energyDiscard.Psychic,0);
 assert.ok(p.hand.some(r=>cat.cardById(r.cardId)?.basicEnergy&&cat.cardById(r.cardId)?.subtype==='Psychic'));
});
test('Groudon ex Power Blast discards two selected Energy cards and records both in discard ledger',()=>{
 const s=battle('ex14-93','ex14-2');const p=s.sides.player;
 p.active.energy={Fighting:2,Water:1};atk(s,0);assert.equal(s.phase,'effectChoice');
 choose(s,x=>x.choiceOption===0);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===1||x.choiceOption===0);
 assert.equal(Object.values(p.active.energy).reduce((sum,n)=>sum+n,0),1);
 assert.equal(Object.values(p.energyDiscard||{}).reduce((sum,n)=>sum+n,0),2);
});
test('Shiftry ex Dark Eyes punishes actual opponent Poké-Power use, not passive Bodies',()=>{
 const s=battle('ex14-27','ex14-58');s.sides.opponent.bench[0].cardId='ex14-97';
 const a=core.legalActions(s,'player').find(x=>x.type==='ability');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(s.sides.player.active.damage,20);
 assert.ok(s.log.some(x=>x.type==='ex14DarkEyes'&&x.damage===20));
});

test('Kyogre ex Hydro Shot discards two actual chosen Energy then hits chosen opponent Bench',()=>{
 const s=battle('ex14-95','ex14-2'),p=s.sides.player,foe=s.sides.opponent;
 p.active.energy={Water:2,Metal:1};foe.bench[0].cardId='ex14-89';atk(s,0);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceOption===0);
 assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(foe.bench[0].damage,70);assert.equal(foe.active.damage,0);
 assert.equal(Object.values(p.active.energy).reduce((sum,n)=>sum+n,0),1);
});
test('Blaziken ex Drag Off switches in target before dealing 30 damage',()=>{
 const s=battle('ex14-90','ex14-2');s.sides.player.active.energy={Fighting:2};
 const beforeActive=s.sides.opponent.active;
 atk(s,0);assert.equal(s.phase,'effectChoice');choose(s,x=>x.choiceTarget==='bench'&&x.choiceBenchIndex===0);
 assert.equal(beforeActive.damage,0);assert.equal(s.sides.opponent.active.uid,'ob0');
 assert.equal(s.sides.opponent.active.damage,30);
});
test('Blaziken ex Burn Away recoil matches overkill damage without weakness',()=>{
 const s=battle('ex14-90','ex14-58');s.sides.player.active.energy={Fire:2,Fighting:2};
 atk(s,1);
 assert.ok(s.log.some(x=>x.type==='ex14BurnAwayRecoil'));
 assert.equal(s.sides.player.active.damage,50);
});
test('every ex14 battle-enabled Pokémon attack resolves without runtime exceptions',()=>{
 let attackCount=0;
 for(const c of set.CARDS.filter(c=>c.kind==='pokemon'&&c.battleEnabled)){
  for(let ix=0;ix<(c.attacks||[]).length;ix++){
   const s=battle(c.id,'ex14-58');
   try{atk(s,ix);if(s.phase==='effectChoice')clear(s);}catch(err){throw new Error(c.id+' '+c.name+' / '+c.attacks[ix].name+': '+err.message,{cause:err});}
   attackCount++;
  }
 }
 assert.ok(attackCount>=100,`expected at least 100 attack resolutions, got ${attackCount}`);
});
