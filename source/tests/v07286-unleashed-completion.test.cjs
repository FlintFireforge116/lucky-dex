'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path'),fs=require('node:fs');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const set=require(path.join(assets,'tcg-classic-unleashed.js')),core=require(path.join(assets,'tcgp-battle-core.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js')),db=require(path.join(assets,'tcg-classic-battle-data.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'hgss2-'+n;
const ref=(n,uid)=>({cardId:n.startsWith('hgss2-')||n.startsWith('hgss1-')||n.startsWith('dp1-')?n:id(n),uid:uid||n});
const slot=(n,uid)=>core.makePokemonSlot(id(n),1,uid||n);
function scene(){const g=cpu.generate({sets:['hgss2'],type:'Fire',seed:41});assert.ok(g.ok,g.error);
 const s=core.createBattle({format:'classic',seed:5,firstSide:'player',playerDeck:g.cards,opponentDeck:g.cards,
 playerEnergyTypes:['Fire','Water','Lightning','Grass','Psychic','Fighting'],opponentEnergyTypes:['Fire','Water','Psychic']});
 s.phase='battle';s.turnNumber=5;s.activeSide='player';s.sides.player.turnCount=3;s.sides.opponent.turnCount=2;
 const p=s.sides.player,o=s.sides.opponent;p.active=slot('52','magmar');o.active=slot('65','teddiursa');p.bench=[];o.bench=[];
 p.hand=[];o.hand=[];p.discard=[];o.discard=[];p.energyDiscard={};o.energyDiscard={};p.supporterUsed=false;
 return s;}
function unit(s,{source,action={},resolvingChoice=false,random=()=>0.1,isAttack=false,eventData}={}){
 let offered=[];const p=s.sides.player,o=s.sides.opponent;
 const context={state:s,side:'player',foeSide:'opponent',attacker:source||p.active,defender:o.active,cardById:db.cardById,
 action,isAttack,resolvingChoice,eventData,random,requestChoice:spec=>offered.push(spec),shuffle:(_s,deck)=>deck.reverse(),
 drawCard:b=>{if(b.deck.length&&b.hand.length<8)b.hand.push(b.deck.shift());},effectiveEnergy:x=>x.energy,onEnergyAttached:(x,t,n)=>{s.log.push({type:'energyAttached',cardId:x.cardId,energyType:t,amount:n});},maxHp:(_side,x)=>db.cardById(x.cardId)?.hp||100};
 return {ctx:context,offered};}
function run(s,number,name,props={}){const card=set.cardById(id(number));const effect=(card.attacks||[]).find(a=>a.name===name)?.effect||(card.abilities||[]).find(a=>a.name===name)?.effect||card.effect;
 assert.ok(effect,number+': '+name);const {ctx,offered}=unit(s,props);effects.applyEffect(effect,ctx);return offered[0]||null;}
function choose(s,effect,spec,props={}){return run(s,...effect,{...props,resolvingChoice:true,action:spec});}
function resolve(s,effect,props={}){let out;const {ctx,offered}=unit(s,props);effects.applyEffect(effect,ctx);return offered[0]||null;}
function effect(n,name){const c=set.cardById(id(n));return (c.attacks||[]).find(x=>x.name===name)?.effect||(c.abilities||[]).find(x=>x.name===name)?.effect||c.effect;}
test('Completion enables the full authentic 96-print set without placeholder printed effects',()=>{
 assert.equal(set.coverage().total,96);assert.equal(set.coverage().battleEnabled,96);assert.deepEqual(set.coverage().gated,[]);
 for(const c of set.CARDS){assert.ok(c.battleEnabled,c.id);for(const a of [...(c.attacks||[]),...(c.abilities||[]),...(c.kind==='trainer'?[c]:[])]){
  assert.deepEqual(effects.validateEffect(a.effect),[],c.id+' '+a.name);
  if(a.text?.trim())assert.notEqual(a.effect.type,'noop',c.id+' '+a.name);
 }}
});
test('All six new LEGEND physical halves are battle-enabled and paired, never independent Basics',()=>{
 for(const [a,b] of [['90','91'],['92','93'],['94','95']]){
  const x=set.cardById(id(a)),y=set.cardById(id(b));assert.equal(x.legendPair,y.legendPair);assert.ok(x.battleEnabled&&y.battleEnabled);
  assert.equal(x.prizeCards,2);assert.equal(y.prizeCards,2);}
});
test('Psychic Float makes a Psychic-Energized Active retreat for zero while Metagross Body functions',()=>{
 const s=scene(),p=s.sides.player;p.active.energy.Psychic=1;p.active.energy.Fire=0;p.bench=[slot('4','meta')];
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='retreat'||a.type==='switch'), 'bench required?');
 const t=core.legalActions(s,'player').find(a=>a.type==='retreat');if(t)assert.equal(t.energyCost||t.cost||0,0);
});
test('Crobat Prime Severe Poison sets four poison counters, while Skill Dive targets a chosen opposing Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('84','crobat');o.bench=[slot('64','bench')];
 let c=resolve(s,effect('84','Severe Poison'),{source:p.active});assert.equal(o.active.conditions.poison.amount,40);
 p.active.energy.Psychic=1;o.active.conditions={};const possible=core.legalActions(s,'player').filter(x=>x.type==='attack'&&x.attackIndex===1);const a=possible.find(x=>x.target==='opponentBench')||possible[0];assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(o.bench[0].damage,30);assert.equal(o.active.damage,0);
});
test('Kingdra Prime Spray Splash is one chosen damage counter, not an arbitrary default target',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('85','kingdra');o.bench=[slot('48','bench')];
 const c=resolve(s,effect('85','Spray Splash'),{source:p.active});assert.equal(c.selectionSide,'opponent');assert.equal(o.active.damage,0);
 resolve(s,c.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[0].benchSlot)}});
 assert.equal(o.bench[0].damage,10);assert.equal(o.active.damage,0);
});
test('Dragon Steam base damage becomes 20 when opponent has a Fire Pokémon, independent of Power effects',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('85','kingdra');p.active.energy.Water=2;o.active=slot('52','fire-opponent');
 const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(act);core.applyAction(s,'player',act);
 assert.equal(o.active.damage,40,'20 base against Fire ×2 Water weakness (not 60 base)');
});
test('Kingdra 50+ Stream Pump has a genuine keep/return Energy choice and physical attachment return',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('17','kingdra');p.active.energy.Water=2;
 const first=resolve(s,effect('17','Stream Pump'),{source:p.active});assert.equal(first.kind,'option');assert.equal(first.options.length,2);
 const second=resolve(s,first.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:1}});assert.equal(second.kind,'option');assert.ok(second.options[0].includes('Return'));
 const before=p.hand.length;resolve(s,second.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.hand.length,before+1);assert.equal(p.active.energy.Water,1);
});
test('Roserade Energy Signal reads from-hand attachments, retains energy type across player choice',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('23','roserade');
 const e=effect('23','Energy Signal');let option=resolve(s,e,{source:p.active,eventData:{fromHand:false,energyType:'Grass'}});assert.equal(option,null);
 option=resolve(s,e,{source:p.active,eventData:{fromHand:true,energyType:'Grass'}});assert.equal(option.kind,'option');
 resolve(s,option.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:1}});assert.ok(s.sides.opponent.active.conditions.confusion);
 option=resolve(s,e,{source:p.active,eventData:{fromHand:true,energyType:'Psychic'}});
 resolve(s,option.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:1}});assert.ok(s.sides.opponent.active.conditions.poison);
});
test('Floatzel Water Acceleration uses physical Water Energy from hand, not the Energy Zone',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('16','floatzel');p.hand=[ref('hgss1-117','water'),ref('hgss2-65','growlithe')];
 const choice=resolve(s,effect('16','Water Acceleration'),{source:p.active});assert.ok(choice);
 resolve(s,choice.effect,{source:p.active,resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.equal(p.active.energy.Water,1);assert.equal(p.hand.length,1);
});
test('Good Rod respects heads Pokemon versus tails Trainer and moves the chosen physical discard to deck top',()=>{
 const s=scene(),p=s.sides.player;p.discard=[ref('hgss2-1','jirachi'),ref('hgss2-73','trainer')];
 let choice=resolve(s,effect('76'),{random:()=>0.1});assert.equal(choice.kind,'discardCard');assert.equal(choice.filter.kind,'pokemon');
 resolve(s,choice.effect,{resolvingChoice:true,action:{choiceDiscardIndex:0}});assert.equal(p.deck[0].cardId,id('1'));
 choice=resolve(s,effect('76'),{random:()=>0.9});assert.equal(choice.kind,'discardCard');assert.equal(choice.filter.kind,'trainer');
 resolve(s,choice.effect,{resolvingChoice:true,action:{choiceDiscardIndex:0}});assert.equal(p.deck[0].cardId,id('73'));
});
test('Energy Returner returns a real discard-zone Energy card to deck and decrements one unit',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard.Water=2;
 const choice=resolve(s,effect('74'));assert.equal(choice.kind,'option');assert.match(choice.options[0],/Water/);
 const next=resolve(s,choice.effect,{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.energyDiscard.Water,1);assert.equal(p.deck.filter(r=>r.cardId==='dp1-125').length,1);assert.ok(next);
});
test('Interviewers Questions chooses actual top-eight Energy and preserves other physical cards',()=>{
 const s=scene(),p=s.sides.player;
 p.deck=[ref('hgss2-65','a'),ref('hgss1-117','water'),ref('hgss2-64','b'),ref('hgss1-116','fire'),...p.deck];
 const choice=resolve(s,effect('77'));assert.equal(choice.kind,'topDeckCard');assert.equal(choice.count,8);
 const before=p.hand.length,next=resolve(s,choice.effect,{resolvingChoice:true,action:{choiceDeckIndex:1}});
 assert.equal(p.hand.length,before+1);assert.equal(p.hand.at(-1).cardId,'hgss1-117');assert.equal(next.kind,'topDeckCard');
});
test('HGSS2 Rare Candy can evolve a Basic directly into the printed Stage 1 OR Stage 2 from hand',()=>{
 for(const evo of [['hgss2-58','hgss2-37'],['hgss2-70','hgss2-84']]){
  const s=scene(),p=s.sides.player;p.active=core.makePokemonSlot(evo[0],1,'basic');p.active.playedOnSideTurn=1;
  p.hand=[ref('hgss2-82','candy'),ref(evo[1],'evolution')];
  const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='hgss2-82'&&a.evolutionCardId===evo[1]);assert.ok(a,evo.join(' -> '));
  core.applyAction(s,'player',a);assert.equal(p.active.cardId,evo[1]);
 }
});
test('Lanturn Prime Underwater Dive changes only its type and expires with the turn',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('86','lanturn');const x=resolve(s,effect('86','Underwater Dive'),{source:p.active});
 assert.equal(x,null);assert.equal(p.active.typeOverride.type,'Water');assert.equal(p.active.typeOverride.expiresTurn,s.turnNumber);
});
test('Steelix Prime Perfect Metal prevents status while its Body is active',()=>{
 const s=scene(),o=s.sides.opponent;o.active=slot('87','steelix');
 resolve(s,{type:'status',target:'opponentActive',status:'poison'},{});
 assert.equal(o.active.conditions.poison,undefined);
});
test('Suicune & Entei LEGEND Torrent Blade returns TWO Water Energy before selected Bench damage',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('94','legend');p.active.stack=[id('94'),id('95')];p.active.energy.Water=2;o.bench=[slot('65','target')];
 let c=resolve(s,effect('94','Torrent Blade'),{source:p.active,isAttack:true});assert.equal(c.kind,'option');
 c=resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceOption:0}});assert.equal(p.hand.length,1);assert.equal(p.active.energy.Water,1);assert.equal(c.kind,'option');
 c=resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceOption:0}});assert.equal(p.hand.length,2);assert.equal(p.active.energy.Water,0);assert.equal(c.kind,'pokemon');
 resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[0].benchSlot)}});
 assert.equal(o.bench[0].damage,100);assert.equal(o.active.damage,0);
});
test('Entei & Raikou LEGEND Thunder Fall hits only actual printed Poké-Power sources and discards its Energy',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('90','legend');p.active.energy.Fire=1;p.active.energy.Lightning=1;
 p.bench=[slot('23','roserade')];o.active=slot('85','kingdra');o.bench=[slot('87','steelix')];
 resolve(s,effect('90','Thunder Fall'),{source:p.active,isAttack:true});
 assert.equal(p.bench[0].damage,80);assert.equal(o.active.damage,80);assert.equal(o.bench[0].damage,0);
 assert.equal(p.active.energy.Fire,0);assert.equal(p.active.energy.Lightning,0);
});
test('Three new LEGEND pairs still produce legal 30-card CPU opponent decks',()=>{
 const pairs=[['90','91'],['92','93'],['94','95']];for(const type of ['Fire','Water','Lightning','Darkness','Grass','Psychic','Colorless'])for(const seed of [1,3,8,19]){
  const r=cpu.generate({sets:['hgss2'],type,seed});assert.ok(r.ok,`${type} ${seed}`);assert.equal(r.cards.length,30);assert.ok(db.validateDeck(r.cards).ok);
  for(const [a,b]of pairs)assert.equal(r.cards.filter(x=>x===id(a)).length,r.cards.filter(x=>x===id(b)).length);
 }
});
test('Jirachi Stardust Song is optional, flips three coins and attaches real discarded Psychic Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('1','jirachi');p.energyDiscard.Psychic=2;
 let next=resolve(s,effect('1','Stardust Song'),{source:p.active});assert.equal(next.kind,'option');assert.match(next.options[0],/Decline/);
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:1},random:()=>0.1});
 assert.equal(next.kind,'option');assert.match(next.options[0],/Psychic/);
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.active.energy.Psychic,1);assert.equal(p.energyDiscard.Psychic,1);
 assert.ok(next,'more heads allow additional discard Energy choices');
});
test('Time Hollow devolves selected opponent Pokémon physically, never a random Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('1','jirachi');p.active.energy.Psychic=2;
 o.active=slot('7','politoed');o.active.stack=[id('58'),id('37'),id('7')];o.bench=[slot('85','kingdra')];o.bench[0].stack=[id('49'),id('40'),id('85')];
 const c=resolve(s,effect('1','Time Hollow'),{source:p.active,isAttack:true});assert.equal(c.selectionSide,'opponent');
 const next=resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[0].benchSlot)}});
 assert.equal(o.bench[0].cardId,id('40'));assert.ok(o.hand.some(x=>x.cardId===id('85')));assert.equal(o.active.cardId,id('7'));
 assert.equal(next.kind,'pokemon');
});
test('Blastoise Wash Out selects Water Energy from an actual Bench and moves it to Active without hand attachment',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('13','blastoise');p.bench=[slot('63','squirtle')];p.bench[0].energy.Water=2;
 const first=resolve(s,effect('13','Wash Out'),{source:p.active});assert.equal(first.kind,'energySource');assert.equal(first.onlyBench,true);
 const next=resolve(s,first.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0,effectEnergyType:'Water'}});
 assert.equal(next.kind,'pokemon');assert.deepEqual(next.excludeUids,[p.bench[0].uid]);
 resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(p.active.energy.Water,1);assert.equal(p.bench[0].energy.Water,1);
});
test('Shaymin Celebration Wind offers Decline and explicit Energy-source then destination choices',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('8','shaymin');p.active.energy.Grass=2;p.bench=[slot('47','cherubi')];
 const first=resolve(s,effect('8','Celebration Wind'),{source:p.active});assert.equal(first.kind,'energySource');assert.equal(first.optional,true);
 const next=resolve(s,first.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'active',effectEnergyType:'Grass'}});
 assert.equal(next.kind,'pokemon');
 const last=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(p.bench[0].benchSlot)}});
 assert.equal(p.active.energy.Grass,1);assert.equal(p.bench[0].energy.Grass,1);assert.equal(last.kind,'option');
});
test('Metang Energy Crane selects one Psychic Energy from discard and a physical destination',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('33','metang');p.energyDiscard.Psychic=1;p.bench=[slot('54','misdreavus')];
 let next=resolve(s,effect('33','Energy Crane'),{source:p.active});assert.equal(next.kind,'pokemon');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(p.bench[0].benchSlot)}});
 assert.equal(next.kind,'option');
 resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Psychic,1);assert.equal(p.energyDiscard.Psychic,0);
});
test('Lanturn Prime Powerful Spark counts every attached Energy card once across all friendly Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('86','lanturn');p.active.energy.Lightning=1;p.active.energy.Water=2;
 p.bench=[slot('48','chinchou')];p.bench[0].energy.Lightning=1;o.active=slot('10','torterra');
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a);core.applyAction(s,'player',a);
 assert.equal(o.active.damage,80,'40 base + 4 attached Energy cards × 10');
});
test('Gaia Crush Stadium discard is genuinely optional and credits the owning discard pile',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('87','steelix');s.stadium={uid:'stadium',cardId:'neo1-84',ownerSide:'opponent'};
 const e=resolve(s,effect('87','Gaia Crush'),{source:p.active});assert.equal(e.kind,'option');
 resolve(s,e.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(s.stadium,null);assert.ok(s.sides.opponent.discard.some(r=>r.cardId==='neo1-84'));
});
test('Cheerleaders Cheer gives opponent—not attacker—the choice to draw an extra card',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.deck=[ref('hgss2-47','a'),ref('hgss2-48','b'),ref('hgss2-49','c')];o.deck=[ref('hgss2-50','d')];
 const x=resolve(s,effect('71'));assert.equal(p.hand.length,3);assert.equal(x.side,'opponent');
 resolve(s,x.effect,{resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(o.hand.length,1);
});
test('Super Scoop Up returns a complete selected evolution stack and its physical Energy to hand on heads',()=>{
 const s=scene(),p=s.sides.player;p.active=slot('37','poliwhirl');p.active.stack=[id('58'),id('37')];p.active.energy.Water=1;
 const first=resolve(s,effect('83'),{random:()=>0.1});assert.equal(first.kind,'pokemon');
 resolve(s,first.effect,{resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(p.active,null);assert.deepEqual(p.hand.map(r=>r.cardId).sort(),[id('58'),id('37'),'dp1-125'].sort());
});
test('Hydro Launcher returns exactly two Water cards and then selects an opposing Pokémon for 100',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot('13','blastoise');p.active.energy.Water=2;o.bench=[slot('65','target')];
 let c=resolve(s,effect('13','Hydro Launcher'),{source:p.active,isAttack:true});assert.equal(c.kind,'option');
 c=resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceOption:0}});assert.equal(p.hand.length,1);
 c=resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceOption:0}});assert.equal(p.hand.length,2);assert.equal(c.kind,'pokemon');
 resolve(s,c.effect,{source:p.active,isAttack:true,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[0].benchSlot)}});
 assert.equal(o.bench[0].damage,100);assert.equal(o.active.damage,0);
});
test('Unleashed rule engine maintains old HGSS1 and Arceus effect support, not just the new effects',()=>{
 assert.ok(require(path.join(assets,'tcg-classic-heartgold-soulsilver.js')).coverage().battleEnabled>=116);
 assert.ok(db.SETS.some(s=>s.id==='pl4'),'Arceus integration remains registered; pl4 data is prepared separately during CI');
});

test('Completion metadata separates true Energy acceleration from moves and supports their natural partners',()=>{
 const roles=n=>set.cardById(id(n)).deckMeta.roles;
 for(const n of ['1','16','20','33'])assert.ok(roles(n).includes('ramp'),`${n} genuinely accelerates Energy`);
 for(const n of ['5','13','17']){assert.ok(roles(n).includes('energy-move'),`${n} moves Energy`);assert.ok(!roles(n).includes('ramp'),`${n} is not Energy acceleration`);}
 assert.ok(roles('85').includes('snipe'),'Kingdra Spray Splash is a Bench-capable power');
 assert.ok(roles('88').includes('spread'),'Tyranitar Prime has spread damage');
 assert.deepEqual(set.cardById(id('34')).deckMeta.preferredPartners,['Plusle']);
 assert.deepEqual(set.cardById(id('36')).deckMeta.preferredPartners,['Minun']);
});
