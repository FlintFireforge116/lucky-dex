'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const xy=require('../app/src/main/assets/tcg-classic-steam-siege.js');
const fs=require('node:fs'),path=require('node:path');
const slot=(id,uid,benchSlot=0)=>({cardId:id,uid,benchSlot,stack:[id],energy:{},specialEnergy:[],conditions:{},locks:[],damage:0});
const board=active=>({active,bench:[],hand:[],deck:[],discard:[],energySupply:[],energyDiscard:{},prizes:[],turnCount:1});
const create=()=>({format:'classic',turnNumber:8,firstSide:'player',activeSide:'player',sides:{player:board(slot('xy11-11','p')),opponent:board(slot('xy11-1','o'))},modifiers:[],log:[]});
const cardById=id=>id==='basic-fire'?{id,kind:'energy',basicEnergy:true,subtype:'Fire'}:id==='basic-dark'?{id,kind:'energy',basicEnergy:true,subtype:'Darkness'}:xy.cardById(id);
const context=(s,more={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById,isAttack:true,random:()=>0.8,shuffle:()=>{},drawCard:p=>{if(p.deck.length)p.hand.push(p.deck.shift());},...more});
const attack=(n,name)=>{const c=xy.cardById('xy11-'+n);assert.equal(c?.battleEnabled,true);const a=c.attacks.find(x=>x.name===name);assert.ok(a,name);return a;};
const power=(n,name)=>{const c=xy.cardById('xy11-'+n);assert.equal(c?.battleEnabled,true);const a=c.abilities.find(x=>x.name===name);assert.ok(a,name);return a.effect;};
const trainer=n=>xy.cardById('xy11-'+n).effect;
const use=(e,s,more={})=>effects.applyEffect(e,context(s,more));
const hit=(n,name,s,more={})=>effects.resolveAttack(attack(n,name),context(s,more));
const pick=(s,e,action,more={})=>use(e,s,{...more,resolvingChoice:true,action});
function collect(s,e,more={}){let choice;use(e,s,{...more,requestChoice:c=>choice=c});assert.ok(choice,'expected a gameplay choice');return choice;}

test('all 116 Steam Siege prints, legal costs, and source-mapped effect validators are enabled',()=>{
 const rows=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/classic/xy11-print-compact.json'),'utf8'));
 assert.equal(rows.length,116);assert.equal(xy.CARDS.filter(c=>c.battleEnabled).length,116);
 for(const [num,,supertype,,,,,attacks] of rows){const c=xy.cardById('xy11-'+num);
  assert.equal(c.battleEnabled,true,'gated '+num);
  if(supertype==='Pokémon')assert.deepEqual(c.attacks.map(a=>Array.isArray(a.cost)?a.cost.join(''):String(a.cost)),attacks.map(a=>a[1].join('')),'printed energy '+num);
  for(const a of c.attacks||[])assert.deepEqual(effects.validateEffect(a.effect),[],num+'/'+a.name);
  for(const ab of c.abilities||[])assert.deepEqual(effects.validateEffect(ab.effect),[],num+'/'+ab.name);
 }
});
test('Wicked Wind stops attached Tools and Stadium effects but leaves the physical cards',()=>{
 const s=create(),p=s.sides.player.active;
 p.tool={uid:'tool',cardId:'xy11-101'};s.stadium={cardId:'xy9-110',xy9DownSide:'player'};
 use(attack(11,'Wicked Wind').effect,s);
 assert.equal(s.xy11WickedWindUntil,9);assert.equal(p.tool.cardId,'xy11-101');assert.equal(s.stadium.cardId,'xy9-110');
});
test('Flare Up fails cleanly without 10 discarded Fire, then moves exactly 10 from discard without touching hand',()=>{
 const s=create();s.sides.player.active=slot('xy11-20','infernape');
 s.sides.player.energyDiscard.Fire=9;assert.equal(hit(20,'Flare Up',s).damage,0);
 s.sides.player.energyDiscard.Fire=10;const r=hit(20,'Flare Up',s);assert.equal(r.damage,200);
 for(const e of r.pendingEffects)use(e,s);
 assert.equal(s.sides.player.energyDiscard.Fire,0);assert.equal(s.sides.player.energySupply.filter(x=>x==='Fire').length,10);
});
test('Ultimate Blade triggers only after damage and KOs target when remaining HP <=60',()=>{
 const s=create(),p=s.sides.opponent.active;const a=attack(32,'Ultimate Blade');
 p.damage=25;use(a.effect,s,{dealtDamage:40});assert.equal(p.damage,xy.cardById(p.cardId).hp);
 p.damage=25;use(a.effect,s,{dealtDamage:0});assert.equal(p.damage,25);
});
test('Clawitzer BREAK Lock-On prevents retreat and records next-turn 120 boost',()=>{
 const s=create(),target=s.sides.opponent.active;s.sides.player.active=slot('xy11-35','break');
 use(attack(35,'Lock-On').effect,s);assert.equal(target.xy11LockOn.sourceSide,'player');assert.equal(target.xy11LockOn.turn,10);
 assert.ok(target.locks.some(x=>x.action==='retreat'));
});
test('Nidoking Power Lariat counts evolved Bench only; King Palace buffs Nidoqueen',()=>{
 const s=create(),p=s.sides.player;p.active=slot('xy11-45','king');p.bench=[slot('xy11-31','dewott',0),slot('xy11-1','basic',1)];
 assert.equal(hit(45,'Power Lariat',s).damage,90);
 const n=slot('xy10-1','queen');const lookup=id=>id==='xy10-1'?{name:'Nidoqueen',stage:'Stage 2',types:['Psychic']}:cardById(id);
 assert.equal(effects.modifierAmount(s,'player',n,'attackDamage',lookup),0,'bench Nidoqueen not active');
 p.active=n;p.bench.push(slot('xy11-45','kingbench',2));assert.equal(effects.modifierAmount(s,'player',n,'attackDamage',lookup),20);
});
test('Drifloon Transfer Pain moves one counter off friendly Pokémon onto enemy',()=>{
 const s=create(),own=s.sides.player.active;own.damage=20;const c=collect(s,attack(46,'Transfer Pain').effect);
 assert.equal(c.kind,'pokemon');let next;
 pick(s,c.effect,{choiceTarget:'active'},{requestChoice:x=>next=x});assert.equal(next.kind,'pokemon');
 pick(s,next.effect,{choiceTarget:'active'});assert.equal(own.damage,10);assert.equal(s.sides.opponent.active.damage,10);
});
test('Burst Curse discards two attached Energy and distributes eight counters via choices',()=>{
 const s=create(),p=s.sides.player.active;p.energy={Psychic:2};let c=collect(s,attack(47,'Burst Curse').effect);
 assert.equal(p.energy.Psychic,0);assert.equal(s.sides.player.energyDiscard.Psychic,2);
 assert.equal(c.kind,'pokemon');for(let i=0;i<8;i++){let next;pick(s,c.effect,{choiceTarget:'active'},{requestChoice:x=>next=x});c=next;}
 assert.equal(s.sides.opponent.active.damage,80);
});
test('Mirror Mirror resolves opponent down to four before friendly hand',()=>{
 const s=create(),p=s.sides.player,foe=s.sides.opponent;
 foe.hand=Array.from({length:5},(_,i)=>({uid:'foe'+i,cardId:'xy11-3'}));p.hand=Array.from({length:5},(_,i)=>({uid:'own'+i,cardId:'xy11-3'}));
 let c=collect(s,attack(49,'Mirror Mirror').effect);assert.equal(c.selectionSide,'opponent');
 let next;pick(s,c.effect,{choiceHandIndex:0},{requestChoice:x=>next=x});assert.equal(foe.hand.length,4);assert.equal(next.selectionSide,'player');
 pick(s,next.effect,{choiceHandIndex:0});assert.equal(p.hand.length,4);
});
test('Armaldo Rushing Water preserves owner and switches a physical attached Energy to opposing Bench',()=>{
 const s=create(),foe=s.sides.opponent;foe.active.energy.Water=1;foe.bench=[slot('xy11-3','bench',0)];
 let c=collect(s,attack(57,'Rushing Water').effect);assert.equal(c.kind,'option');
 let next;pick(s,c.effect,{choiceOption:0},{requestChoice:x=>next=x});assert.equal(next.kind,'pokemon');
 pick(s,next.effect,{choiceTarget:'bench',choiceBenchIndex:0});assert.equal(foe.active.energy.Water,0);assert.equal(foe.bench[0].energy.Water,1);
});
test('Spiritomb Damage Play moves opposing Bench counters repeatedly, not as attack damage',()=>{
 const s=create(),foe=s.sides.opponent;foe.bench=[slot('xy11-1','hurt',0),slot('xy11-3','healthy',1)];foe.bench[0].damage=20;
 let c=collect(s,attack(62,'Damage Play').effect);assert.equal(c.kind,'pokemon');
 let next;pick(s,c.effect,{choiceTarget:'bench',choiceBenchIndex:0},{requestChoice:x=>next=x});
 pick(s,next.effect,{choiceTarget:'active'},{requestChoice:()=>{}});
 assert.equal(foe.bench[0].damage,10);assert.equal(foe.active.damage,10);
});
test('Bastiodon Counter Head and Klinklang Gear Spinner persist in the correct turn window',()=>{
 const s=create();s.sides.player.active=slot('xy11-70','bast');use(attack(70,'Counter Head').effect,s);
 assert.equal(s.sides.player.active.xy11CounterHead.turn,9);
 s.sides.player.active=slot('xy11-73','gear');use(attack(73,'Gear Spinner').effect,s);
 assert.equal(hit(73,'Gear Spinner',s).damage,70);s.turnNumber=10;assert.equal(hit(73,'Gear Spinner',s).damage,140);
});
test('Klinklang Heavy Bumper reduces damage by 10 per opponent retreat cost only if unsuppressed',()=>{
 const s=create(),p=s.sides.player.active;s.sides.player.active=slot('xy11-73','klang');
 const raw=Number(cardById(s.sides.opponent.active.cardId).retreat||0);
 assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',cardById),raw*10);
 s.xy7HexManiacUntil=8;assert.equal(effects.modifierAmount(s,'player',s.sides.player.active,'damageReduction',cardById),0);
});
test('Magearna-EX Soul Blaster becomes base 60 next turn, both arts share printed behaviour',()=>{
 const s=create();s.sides.player.active=slot('xy11-75','mage');
 assert.equal(hit(75,'Soul Blaster',s).damage,120);use(attack(75,'Soul Blaster').effect,s);
 s.turnNumber=10;assert.equal(hit(75,'Soul Blaster',s).damage,60);
 assert.deepEqual(attack(110,'Soul Blaster').effect,attack(75,'Soul Blaster').effect);
});
test('Mystic Heart prevents additional effects on Metal Energy Pokémon, not attacks damage',()=>{
 const s=create(),foe=s.sides.opponent;foe.bench=[slot('xy11-75','mage',0)];foe.active.energy.Metal=1;
 use({type:'status',target:'opponentActive',status:'poison'},s);
 assert.equal(foe.active.conditions.poison,undefined);
});
test('Dark Burn counts selected physical Darkness Energy then discards only selected Energy',()=>{
 const s=create(),p=s.sides.player;s.sides.player.active=slot('xy11-86','hydreigon');p.active=s.sides.player.active;p.active.energy.Darkness=3;
 const e=attack(86,'Dark Burn').effect;
 const options=effects.choicesForEffect(e,context(s));
 assert.ok(options.length>=3,'player can choose how many Darkness Energy to discard');
 const r=hit(86,'Dark Burn',s,{action:{effectSelection:'hydreigon:basic:0,hydreigon:basic:1'}});
 assert.equal(r.damage,100);for(const fx of r.pendingEffects)use(fx,s);
 assert.equal(p.active.energy.Darkness,1);assert.equal(p.energyDiscard.Darkness,2);
});
test('Meowth Stall is only effective on first turn when going second',()=>{
 const s=create(),foe=s.sides.opponent;s.turnNumber=2;s.firstSide='opponent';foe.active.energy.Fire=1;
 let c=collect(s,attack(88,'Stall').effect);assert.equal(c.kind,'pokemon');
 pick(s,c.effect,{choiceTarget:'active'});assert.equal(foe.active.energy.Fire,0);
 foe.active.energy.Fire=1;s.turnNumber=4;
 use(attack(88,'Stall').effect,s);assert.equal(foe.active.energy.Fire,1);
});
test('Talonflame Aero Blitz searches two individually chosen cards from deck',()=>{
 const s=create(),p=s.sides.player;p.deck=[{uid:'one',cardId:'xy11-1'},{uid:'two',cardId:'xy11-3'},{uid:'three',cardId:'xy11-4'}];
 let c=collect(s,attack(96,'Aero Blitz').effect);assert.equal(c.kind,'deckCard');
 let next;pick(s,c.effect,{choiceDeckIndex:2},{requestChoice:x=>next=x});assert.equal(p.hand[0].uid,'three');
 pick(s,next.effect,{choiceDeckIndex:1});assert.deepEqual(p.hand.map(x=>x.uid),['three','two']);
});
test('Greedy Dice cannot be used as a normal Item; both Ranger prints share same effect',()=>{
 assert.deepEqual(trainer(104),trainer(113));
 assert.equal(trainer(102).rule,'greedyDice');assert.equal(trainer(103).rule,'ninjaBoy');
});
test('Ninja Boy swaps own Basic for Basic from deck without losing attachments',()=>{
 const s=create(),p=s.sides.player;p.active=slot('xy11-1','base');p.active.energy.Grass=1;p.active.damage=20;
 p.deck=[{uid:'replacement',cardId:'xy11-3'},{uid:'evolution',cardId:'xy11-2'}];
 let c=collect(s,trainer(103),{isAttack:false});assert.equal(c.kind,'pokemon');
 let next;pick(s,c.effect,{choiceTarget:'active'},{isAttack:false,requestChoice:x=>next=x});assert.equal(next.kind,'deckCard');
 pick(s,next.effect,{choiceDeckIndex:0},{isAttack:false});assert.equal(p.active.cardId,'xy11-3');
 assert.equal(p.active.energy.Grass,1);assert.equal(p.active.damage,20);
 assert.ok(p.deck.some(x=>x.cardId==='xy11-1'));
});
test('Pokémon Ranger removes temporary attack effects while preserving other modifiers',()=>{
 const s=create(),target=s.sides.opponent.active;
 use(attack(11,'Wicked Wind').effect,s);target.xy11LockOn={turn:10};
 s.modifiers=[{stat:'attackDamage',ownerSide:'player',amount:30,fromAttack:true},{stat:'attackDamage',ownerSide:'player',amount:10,fromAttack:false}];
 use(trainer(104),s,{isAttack:false});assert.equal(s.xy11WickedWindUntil,undefined);
 assert.equal(target.xy11LockOn,undefined);assert.equal(s.modifiers.length,1);
});
test('Wonder Lock transfers Klefki from Bench as one Tool and discards attachments',()=>{
 const s=create(),p=s.sides.player;p.active=slot('xy11-1','target');p.bench=[slot('xy11-80','klefki',0)];p.bench[0].energy.Metal=1;
 let c=collect(s,power(80,'Wonder Lock'),{isAttack:false,attacker:p.bench[0]});assert.equal(c.kind,'pokemon');
 pick(s,c.effect,{choiceTarget:'active'},{isAttack:false,attacker:p.bench[0]});assert.equal(p.bench.length,0);
 assert.equal(p.active.tool.cardId,'xy11-80');assert.equal(p.energyDiscard.Metal,1);
});
const core=require('../app/src/main/assets/tcgp-battle-core.js');
const fixtureDeck=['xy11-96','xy11-94','xy11-95','xy11-6','xy11-1','xy11-3','xy11-76'].flatMap(id=>Array(4).fill(id)).concat(['xy11-114','xy11-114']);
test('Gale Wings Talonflame is a legal opening Active from hand but cannot be benched as a Basic',()=>{
 const s=core.createBattle({format:'classic',playerDeck:fixtureDeck,opponentDeck:fixtureDeck,manualPlayerSetup:true,seed:2});
 assert.ok(s.sides.player.hand.some(c=>c.cardId==='xy11-96'));
 const active=core.legalActions(s,'player');assert.ok(active.some(a=>a.type==='setupActive'&&a.cardId==='xy11-96'));
 const chosen=active.find(a=>a.type==='setupActive'&&a.cardId==='xy11-96');core.applyAction(s,'player',chosen);
 assert.equal(s.sides.player.active.cardId,'xy11-96');
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='setupBench'&&a.cardId==='xy11-96'),false);
});
test('Stall is available in core attack actions only on the second player opening turn',()=>{
 const s=core.createBattle({format:'classic',playerDeck:fixtureDeck,opponentDeck:fixtureDeck,seed:3,firstSide:'opponent'});
 s.sides.player.active=core.makePokemonSlot('xy11-88',0,'meow');s.sides.player.active.energy.Fire=1;
 s.turnNumber=2;s.sides.player.turnCount=1;s.activeSide='player';s.phase='battle';
 const stall=a=>a.type==='attack'&&a.attackCardId==='xy11-88'&&a.attackIndex===0;
 assert.equal(core.legalActions(s,'player').some(stall),true);
 s.turnNumber=4;s.sides.player.turnCount=2;assert.equal(core.legalActions(s,'player').some(stall),false);
});
