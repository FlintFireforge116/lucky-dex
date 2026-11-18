'use strict';
/** Independent HGSS original print/choice/CPU audit after v0.69.283. */
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const core=require(path.join(assets,'tcgp-battle-core.js'));
const ai=require(path.join(assets,'tcgp-battle-ai.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const slot=(id,uid)=>core.makePokemonSlot(id,3,uid||id+'-slot');
const card=(id,uid)=>({cardId:id,uid:uid||id+'-ref'});
function scene(){const d=cpu.generate({sets:['hgss1'],type:'Grass',seed:2}).cards;
 const s=core.createBattle({format:'classic',firstSide:'player',seed:1037,playerDeck:d,opponentDeck:d,playerEnergyTypes:['Grass','Water','Fire','Lightning','Fighting','Psychic'],opponentEnergyTypes:['Grass','Water','Fire']});
 s.phase='battle';s.activeSide='player';s.turnNumber=8;s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;
 s.sides.player.active=slot('hgss1-65','a');s.sides.opponent.active=slot('hgss1-65','o');
 s.sides.player.bench=[];s.sides.opponent.bench=[];s.sides.player.hand=[];s.sides.opponent.hand=[];
 return s;
}
const pick=(s,pred)=>{const side=s.choiceSide||s.activeSide;const actions=core.legalActions(s,side).filter(a=>a.type==='effectChoice');const action=actions.find(pred)||actions[0];assert.ok(action,JSON.stringify(s.pendingChoice));core.applyAction(s,side,action);return action;};
const attack=(s,id,index)=>{s.sides.player.active=slot(id,'attacker');s.sides.player.active.energy={Grass:8,Fire:8,Water:8,Lightning:8,Psychic:8,Fighting:8,Colorless:8};const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===index);assert.ok(action,`${id} attack ${index} not legal`);core.applyAction(s,'player',action);return action;};
test('Sunkern Cure Kernels lets attacker choose a damaged Bench Pokémon instead of auto-healing Active',()=>{
 const s=scene(),p=s.sides.player;p.bench=[slot('hgss1-6','injured')];p.bench[0].benchSlot=0;p.bench[0].damage=50;attack(s,'hgss1-85',0);
 assert.equal(s.phase,'effectChoice','Cure Kernels must ask who receives healing');
 pick(s,a=>a.choiceTarget==='bench');assert.equal(p.bench[0].damage,30);
});
test('Jumpluff Mass Attack counts both Active and all Bench Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.bench=[slot('hgss1-72','mine')];o.bench=[slot('hgss1-65','theirs')];p.bench[0].benchSlot=o.bench[0].benchSlot=0;
 attack(s,'hgss1-6',0);assert.equal(o.active.damage,40,'Two active plus two bench equals 40');
});
test('Clefable Fairy Power can choose Bench and returns stack and attachments to hand',()=>{
 const s=scene(),p=s.sides.player;const b=slot('hgss1-2','chosen');b.benchSlot=0;b.stack=['hgss1-74','hgss1-2'];b.energy.Water=2;b.specialEnergy=[card('hgss1-103','dce')];p.bench=[b];attack(s,'hgss1-3',0);assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceTarget==='bench');assert.equal(p.bench.length,0);assert.ok(p.hand.some(x=>x.cardId==='hgss1-2'));assert.ok(p.hand.some(x=>x.cardId==='hgss1-103'));
});
test('Pichu Playground offers successive Basic choices for both players and sleeps attacker',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.deck=[card('hgss1-72','mine'),...p.deck];o.deck=[card('hgss1-67','theirs'),...o.deck];attack(s,'hgss1-28',0);
 let steps=0;while(s.phase==='effectChoice'&&steps++<15){const choice=s.pendingChoice;pick(s,a=>!a.choiceSkip&&((choice?.side==='opponent')||a.choiceDeckIndex===0));}
 assert.ok(steps<15,'Playground must finish');assert.ok(p.bench.length>=1&&p.bench.length<=3);assert.ok(o.bench.length>=1&&o.bench.length<=3);assert.ok(p.active.conditions.sleep,'Pichu falls asleep');
});
test('Metal-only HGSS deck remains unavailable; Darkness payoff can use Persian with legitimate Energy',()=>{
 assert.equal(cpu.generate({sets:['hgss1'],type:'Metal',seed:1}).ok,false);
 const d=cpu.generate({sets:['hgss1'],type:'Darkness',seed:1});assert.ok(d.ok);assert.ok(d.cards.includes('hgss1-27'));assert.ok(d.cards.every(id=>db.cardById(id)?.setId==='hgss1'));
});
test('Inert repeatable Prime Powers do not appear when their hand/board has no eligible Energy',()=>{
 for(const id of ['hgss1-108','hgss1-109']){const s=scene(),p=s.sides.player;p.active=slot(id,'prime');p.hand=[];p.active.energy={};p.bench=[];
  assert.equal(core.legalActions(s,'player').some(a=>a.type==='ability'&&a.cardId===id),false,id+' must not offer a no-op ability');}
});
test('Every HGSS printed multiplication attack has zero fixed base damage',()=>{
 const set=require(path.join(assets,'tcg-classic-heartgold-soulsilver.js'));
 const all=set.CARDS.flatMap(c=>(c.attacks||[]).filter(a=>/\d+[×x]$/.test(a.damageText||'')).map(a=>({id:c.id,attack:a})));
 assert.ok(all.length>=10);
 for(const {id,attack:a} of all)assert.equal(a.damage,0,`${id}:${a.name} adds bogus fixed base damage`);
});
test('Phanpy Flail deals exactly 10 damage for each counter (no phantom base damage)',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('hgss1-77','hurt');p.active.energy={Colorless:1};p.active.damage=30;
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(o.active.damage,30);
});
test('Rainbow Energy physically attaches one special unit and adds 10 self-damage only from hand',()=>{
 const s=scene(),p=s.sides.player;p.hand=[card('hgss1-104','rainbow')];
 const action=core.legalActions(s,'player').find(a=>a.type==='attachSpecial'&&a.cardId==='hgss1-104');assert.ok(action);
 core.applyAction(s,'player',action);
 assert.equal(p.active.damage,10);assert.equal(p.active.specialEnergy.length,1);
 assert.equal(core.effectiveEnergy(s,'player',p.active).Miracle,1);
});
test('Moomoo Milk chooses one damaged Pokémon and never heals a different slot',()=>{
 const s=scene(),p=s.sides.player;p.active.damage=60;p.bench=[slot('hgss1-6','sick')];p.bench[0].benchSlot=0;p.bench[0].damage=60;
 p.hand=[card('hgss1-94','milk')];const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='hgss1-94');assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceTarget==='bench');
 assert.equal(p.active.damage,60);assert.ok(p.bench[0].damage<=60);
 assert.ok(s.log.some(x=>x.rule==='hgss1:94:moomooMilk'&&x.targetUid==='sick'));
});
test('Pokémon Communication trades a chosen hand Pokémon for the chosen deck Pokémon',()=>{
 const s=scene(),p=s.sides.player;p.hand=[card('hgss1-98','communication'),card('hgss1-65','growlithe')];p.deck=[card('hgss1-74','marill'),...p.deck];
 core.applyAction(s,'player',core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='hgss1-98'));
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceHandIndex===0);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceDeckIndex===0);
 assert.ok(p.hand.some(r=>r.cardId==='hgss1-74'));assert.ok(!p.hand.some(r=>r.cardId==='hgss1-65'));
 assert.ok(p.deck.some(r=>r.cardId==='hgss1-65'));
});
test('Metapod Green Shield prevents Grass weakness for allies, but only when in play',()=>{
 const fx=require(path.join(assets,'tcgp-battle-effects.js'));const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot('hgss1-65','fire');o.active=slot('hgss1-6','jumpluff');o.bench=[];
 const bare=fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,50,db.cardById);
 o.bench=[slot('hgss1-46','metapod')];o.bench[0].benchSlot=0;
 const shielded=fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,50,db.cardById);
 assert.ok(bare>shielded,`${bare}, ${shielded}`);
 assert.equal(shielded,50);
});
test('Exeggutor Energy Absorption chooses two different physical discarded Energy cards, including DCE',()=>{
 const s=scene(),p=s.sides.player;p.discard=[card('hgss1-103','dce'),card('hgss1-117','water')];p.energyDiscard={};
 attack(s,'hgss1-18',0);assert.equal(s.phase,'effectChoice');
 assert.equal(s.pendingChoice.effect.rule,'hgss1:18:energyAbsorption');pick(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceOption===0);
 assert.ok(p.active.specialEnergy.some(r=>r.uid==='dce'));assert.equal(p.active.energy.Water,9);
 assert.equal(p.discard.length,0);
});
test('Blissey Energy Link can recover a Special Energy card, not only a generic Basic type',()=>{
 const s=scene(),p=s.sides.player;p.discard=[card('hgss1-103','dce')];p.energyDiscard={};attack(s,'hgss1-36',0);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceOption===0);
 assert.ok(p.active.specialEnergy.some(r=>r.uid==='dce'));assert.equal(p.discard.length,0);
});
test('Fire Spin discards two independently selected attached Energy cards',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active=slot('hgss1-109','large');
 attack(s,'hgss1-32',1);assert.equal(s.phase,'effectChoice');
 const before={...p.active.energy};pick(s,a=>a.choiceOption===0);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceOption===1);
 const gone=Object.entries(before).filter(([k,v])=>p.active.energy[k]!==v).map(([k])=>k);
 assert.ok(gone.length===2,JSON.stringify({gone,before,after:p.active.energy}));
 assert.equal(Object.values(p.energyDiscard).reduce((a,b)=>a+b,0),2);
});
test('Gyarados Hyper Beam makes attacker choose opponent Energy and credits correct discard zone',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active=slot('hgss1-109','large');o.active.energy={Fire:1,Water:1};
 attack(s,'hgss1-4',1);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.choiceOption===1);
 assert.equal(o.active.energy.Water,0);assert.equal(o.active.energy.Fire,1);
 assert.equal(o.energyDiscard.Water,1);assert.equal(p.energyDiscard.Water||0,0);
});
test('Typhlosion Prime Flare Destroy separately chooses one attacker and one defender Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active=slot('hgss1-109','large');o.active.energy={Fire:1,Water:1};
 attack(s,'hgss1-110',0);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.choiceOption===0);assert.equal(s.phase,'effectChoice');
 pick(s,a=>a.choiceOption===1);assert.equal(o.active.energy.Water,0);assert.equal(o.energyDiscard.Water,1);
 assert.equal(Object.values(p.energyDiscard).reduce((a,b)=>a+b,0),1);
});
test('Corsola Recover chooses and discards an attached Water Energy before healing',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('hgss1-37','corsola');p.active.energy={Water:2};p.active.damage=50;
 const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceOption===0);
 assert.equal(p.active.damage,0);assert.equal(p.active.energy.Water,1);assert.equal(p.energyDiscard.Water,1);
});

test('HGSS Prime and discard-recovery metadata reflects real synergy, not Energy discards',()=>{
 const set=require(path.join(assets,'tcg-classic-heartgold-soulsilver.js'));
 for(const id of ['hgss1-14','hgss1-18','hgss1-36','hgss1-73','hgss1-108','hgss1-110'])
   assert.ok(set.cardById(id).deckMeta.roles.includes('ramp'),id+' must be acceleration-compatible');
 for(const id of ['hgss1-4','hgss1-10','hgss1-32','hgss1-49'])
   assert.ok(!set.cardById(id).deckMeta.roles.includes('ramp'),id+' only discards/removes Energy');
 assert.ok(set.cardById('hgss1-106').deckMeta.roles.includes('heal'));
 assert.ok(set.cardById('hgss1-7').deckMeta.roles.includes('draw'));
});
test('Beginner, Advanced and Expert CPUs can resolve the new physical Energy recovery choices',()=>{
 for(const level of ['Beginner','Advanced','Expert']){
  const s=scene(),p=s.sides.opponent;s.activeSide='opponent';p.active=slot('hgss1-18','cpu-exeggutor');p.active.energy={Colorless:1};
  p.discard=[card('hgss1-103','dce-cpu'),card('hgss1-117','water-cpu')];p.energyDiscard={};
  const attackChoice=core.legalActions(s,'opponent').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(attackChoice,level);
  core.applyAction(s,'opponent',attackChoice);
  let steps=0;while(s.phase==='effectChoice'&&steps++<5){const choice=ai.chooseAction(s,s.choiceSide||'opponent',level,0);assert.ok(choice?.type==='effectChoice',`${level} has no effect choice`);core.applyAction(s,s.choiceSide||'opponent',choice);}
  assert.ok(steps<=4,`${level} stuck choosing Energy`);
  assert.ok(p.active.specialEnergy.length+Number(p.active.energy?.Water||0)>0,`${level} wasted Energy Absorption`);
 }
});
test('A sample of HGSS CPU decks has complete chains, 30 cards, payable types and matching LEGEND halves',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Colorless','Darkness'])for(const seed of [2,5,9,11,16,21,28,31,38,41]){
  const r=cpu.generate({sets:['hgss1'],type,seed});assert.ok(r.ok,`${type}/${seed}`);const cs=r.cards.map(id=>db.cardById(id)),names=new Set(cs.map(c=>c.name));
  const parents=new Map(cs.filter(c=>c.stage==='Stage 1').map(c=>[c.name,c.evolvesFrom]));
  assert.ok(db.validateDeck(r.cards).ok,`${type}/${seed}`);assert.equal(cs.length,30);
  for(const c of cs){
   assert.equal(c.setId,'hgss1');
   if(c.stage==='Stage 1')assert.ok(names.has(c.evolvesFrom),`${type}/${seed} orphan ${c.name}`);
   if(c.stage==='Stage 2'){assert.ok(names.has(c.evolvesFrom),`${type}/${seed} stage2 ${c.name}`);assert.ok(names.has(parents.get(c.evolvesFrom)),`${type}/${seed} stage2 baseline ${c.name}`);}
  }
  const count=id=>r.cards.filter(x=>x===id).length;
  for(const [l,r] of [['hgss1-111','hgss1-112'],['hgss1-113','hgss1-114']])assert.equal(count(l),count(r),`${type}/${seed} orphan LEGEND`);
 }
});

test('Corsola Recover can discard attached Rainbow Energy as the required Water type',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('hgss1-37','corsola-rainbow');p.active.energy={Water:1};
 p.active.specialEnergy=[card('hgss1-104','rainbow-water')];p.active.damage=40;
 const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(act);core.applyAction(s,'player',act);
 assert.equal(s.phase,'effectChoice');pick(s,a=>a.choiceOption===1);
 assert.equal(p.active.damage,0);assert.equal(p.active.energy.Water,1);assert.equal(p.active.specialEnergy.length,0);
 assert.ok(p.discard.some(r=>r.uid==='rainbow-water'));
});
test('Lugia LEGEND Elemental Blast can use Rainbow as one missing typed Energy without discarding it three times',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=slot('hgss1-113','lugia');p.active.stack=['hgss1-113','hgss1-114'];
 p.active.energy={Water:1,Lightning:1};p.active.specialEnergy=[card('hgss1-104','rainbow-fire')];
 o.active=slot('hgss1-109','large');const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.phase,'effectChoice');
 for(let i=0;i<3;i++){assert.equal(s.pendingChoice?.effect.rule,'hgss1:113:elementalBlast');pick(s,a=>a.choiceOption===0);}
 assert.equal(p.active.energy.Water,0);assert.equal(p.active.energy.Lightning,0);
 assert.equal(p.active.specialEnergy.length,0);assert.ok(p.discard.some(r=>r.uid==='rainbow-fire'));
});
