'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const data=require(path.join(asset,'tcg-classic-battle-data.js')),core=require(path.join(asset,'tcgp-battle-core.js')),effects=require(path.join(asset,'tcgp-battle-effects.js'));
const ref=(cardId,uid=cardId)=>({cardId,uid}),E=(name,other={})=>({type:'neoRule',rule:'bw10:'+name,...other});
const mon=(cardId,uid=cardId)=>({...core.makePokemonSlot(cardId,1,uid),energy:{},specialEnergy:[],damage:0,tool:null,extraTools:[],conditions:{}});
const side=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],benchLimit:3,handLimit:8,prizes:[ref('bw9-1')],prizesTaken:0,turnCount:3});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,sides:{player:side(),opponent:side()},log:[],rngState:7});
function fire(s,e,action={},isChoice=false,add={}){let choice=null;effects.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:id=>id==='bw10-61'?{name:'Escavalier'}:data.cardById(id),random:()=>0.1,action,resolvingChoice:isChoice,requestChoice:c=>choice=c,shuffle:()=>{},benchCard:(ss,r)=>{const m=mon(r.cardId,r.uid);m.benchSlot=ss.bench.length;ss.bench.push(m);return m;},...add});return choice;}
test('BW10 Tool Reversal returns exactly the chosen physical Pokémon Tool',()=>{const s=scene(),p=s.sides.player.active,b=s.sides.player.bench=[mon('bw9-2','bench')];p.tool=ref('bw9-99','floatstone');b[0].tool=ref('bw9-104','badge');const q=fire(s,E('toolReversal'));assert.deepEqual(q.options.length,2);fire(s,q.effect,{choiceOption:1},true);assert.equal(s.sides.player.hand[0].uid,'badge');assert.equal(b[0].tool,null);assert.equal(p.tool.uid,'floatstone');});
test('BW10 Psypower distributes three counters with repeated target choices',()=>{const s=scene(),b=mon('bw9-2','bench');b.benchSlot=0;s.sides.opponent.bench.push(b);const a=fire(s,E('psypower'));assert.equal(a.kind,'pokemon');const q=fire(s,a.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(b.damage,10);assert.equal(q.effect.remaining,2);const r=fire(s,q.effect,{choiceTarget:'active'},true);assert.equal(s.sides.opponent.active.damage,10);fire(s,r.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(b.damage,20);});
test('BW10 Plasma Transfer moves one exact Special Energy and preserves other cards',()=>{const s=scene(),p=s.sides.player.active,b=mon('bw9-2','b');b.benchSlot=0;s.sides.player.bench.push(b);p.specialEnergy=[ref('bw10-91','from-p'),ref('bw9-106','also-p'),ref('bw7-133','not-p')];const q=fire(s,E('plasmaTransfer'));assert.equal(q.options.length,3);const target=fire(s,q.effect,{choiceOption:0},true);assert.equal(target.kind,'pokemon');fire(s,target.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.deepEqual(b.specialEnergy.map(x=>x.uid),['from-p']);assert.deepEqual(p.specialEnergy.map(x=>x.uid),['also-p','not-p']);});
test('BW10 Sinister Hand moves one counter without deleting or creating damage',()=>{const s=scene();s.sides.opponent.active.damage=30;const b=mon('bw9-2','target');b.benchSlot=0;s.sides.opponent.bench.push(b);const q=fire(s,E('sinisterHand'));assert.equal(q.options.length,2);const x=fire(s,q.effect,{choiceOption:0},true);assert.equal(x.kind,'pokemon');fire(s,x.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(s.sides.opponent.active.damage,20);assert.equal(b.damage,10);});
test('BW10 Retribution checks previous opponent attack KO by exact species, returns attached cards',()=>{const s=scene();const ss=s.sides.player,foe=s.sides.opponent;ss.lastOpponentAttackKoTurn=6;ss.lastKnockedOutCardIds=['bw10-61'];foe.active.energy.Water=2;foe.active.specialEnergy=[ref('bw10-91','plasma')];fire(s,E('retribution'));assert.equal(foe.active.energy.Water,0);assert.equal(foe.active.specialEnergy.length,0);assert.equal(foe.hand.length,3);const other=scene();other.sides.opponent.active.energy.Water=2;fire(other,E('retribution'));assert.equal(other.sides.opponent.active.energy.Water,2);});
test('BW10 Psyjamming offers a choice and transfers unique physical Special Energy without duplication',()=>{
 const s=scene(),foe=s.sides.opponent,b=mon('bw9-2','target');b.benchSlot=0;foe.bench=[b];foe.active.specialEnergy=[ref('bw10-91','plasma-1'),ref('bw9-106','plasma-2')];
 const q=fire(s,E('psyjamming'));assert.equal(q.options.length,3);
 const t=fire(s,q.effect,{choiceOption:0},true);assert.equal(t.kind,'pokemon');
 const n=fire(s,t.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);assert.equal(b.specialEnergy[0].uid,'plasma-1');assert.equal(n.options.length,2);
 const t2=fire(s,n.effect,{choiceOption:0},true);fire(s,t2.effect,{choiceTarget:'bench',choiceBenchIndex:0},true);
 assert.deepEqual(b.specialEnergy.map(x=>x.uid),['plasma-1','plasma-2']);assert.equal(foe.active.specialEnergy.length,0);
});
test('BW10 Red Signal triggers only on a from-hand physical Plasma Energy and offers refusal',()=>{
 const s=scene(),foe=s.sides.opponent,b=mon('bw9-2','reserve');b.benchSlot=0;foe.bench=[b];
 assert.equal(fire(s,E('redSignal'),{},false,{eventData:{fromHand:false,energyCardId:'bw10-91'}}),null);
 const q=fire(s,E('redSignal'),{},false,{eventData:{fromHand:true,energyCardId:'bw10-91'}});
 assert.equal(q.options.length,2);fire(s,q.effect,{choiceOption:0},true,{eventData:{fromHand:true,energyCardId:'bw10-91'}});assert.notEqual(foe.active.uid,'reserve');
});
test('BW10 Stellar Guidance searches Supporter but does not trigger on deck placement',()=>{
 const s=scene();s.sides.player.deck=[ref('bw9-1','pokemon'),ref('bw9-101','supporter')];
 assert.equal(fire(s,E('stellarGuidance'),{},false,{eventData:{fromHand:false}}),null);
 const q=fire(s,E('stellarGuidance'),{},false,{eventData:{fromHand:true}});assert.equal(q.options.length,2);
 fire(s,q.effect,{choiceOption:0},true,{eventData:{fromHand:true}});assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['supporter']);
});
test('BW10 Breakwing discards all opponent Tools when evolved from the hand',()=>{
 const s=scene(),foe=s.sides.opponent,b=mon('bw9-2','b');b.tool=ref('bw9-99','tool-one');foe.bench=[b];foe.active.tool=ref('bw9-104','tool-two');
 fire(s,E('breakwing'),{},false,{eventData:{fromHand:false}});assert.equal(foe.discard.length,0);
 fire(s,E('breakwing'),{},false,{eventData:{fromHand:true}});assert.equal(foe.discard.length,2);assert.equal(b.tool,null);assert.equal(foe.active.tool,null);
});
test('BW10 Verdant Wind removes existing conditions and prevents new ones, including Grass Special Energy',()=>{
 const s=scene(),a=s.sides.player.active,b=mon('bw9-2','ally');const vira=mon('bw9-2','virizion');vira.cardId='bw10-9';s.sides.player.bench=[b,vira];
 a.energy.Grass=1;a.conditions.poison={amount:10};b.conditions.burn=true;b.specialEnergy=[ref('bw10-test-grass','s-grass')];
 const cards=id=>id==='bw10-test-grass'?{effect:{provides:{Grass:1}}}:id==='bw10-9'?{abilities:[{type:'passive',printedPowerType:'ability'}]}:data.cardById(id);
 assert.equal(effects.statusIsPrevented(s,a,cards,'poison'),true);
 assert.equal(effects.statusIsPrevented(s,b,cards,'burn'),true);
 effects.applyContinuousRules(s,cards);assert.deepEqual(a.conditions,{});assert.deepEqual(b.conditions,{});
});
test('BW10 Restored discard abilities use legal actions, exact card references and per-turn protection',()=>{
 const s=scene(),p=s.sides.player;s.rules={benchSize:3,winMode:'prizes'};
 p.discard=[ref('bw10-102','egg'),ref('bw10-27','tirtouga')];p.deck=[ref('bw9-1','deck-top')];
 const acts=core.legalActions(s,'player').filter(x=>x.type==='bw10DiscardAbility');assert.equal(acts.length,2);
 core.applyAction(s,'player',acts.find(x=>x.cardId==='bw10-27'));
 assert.deepEqual(p.deck.map(r=>r.uid),['deck-top','tirtouga']);assert.equal(p.discard.length,1);
 const next=core.legalActions(s,'player').find(x=>x.cardId==='bw10-102'&&x.type==='bw10DiscardAbility');core.applyAction(s,'player',next);
 assert.deepEqual(p.hand.map(r=>r.uid),['egg']);assert.equal(p.discard.length,0);
 // A new physical copy with the same UID cannot activate twice during a turn.
 p.discard.push(ref('bw10-102','egg'));assert.equal(core.legalActions(s,'player').some(x=>x.sourceUid==='egg'&&x.type==='bw10DiscardAbility'),false);
});
test('BW10 Strike of the Champion is prevented by Silver Mirror against a Plasma attacker',()=>{
 const s=scene(),p=s.sides.player.active=mon('bw9-38','attacker'),d=s.sides.opponent.active=mon('bw9-64','defender');
 d.tool=ref('bw10-89','mirror');fire(s,E('strikeOfTheChampion'));assert.equal(d.damage,0,'protection stops an instant KO effect');
 d.tool=null;fire(s,E('strikeOfTheChampion'));assert.ok(d.damage>=Number(data.cardById(d.cardId).hp||0));
});
