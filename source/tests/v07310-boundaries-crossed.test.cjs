'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),set=require(path.join(assets,'tcg-classic-boundaries-crossed.js')),fx=require(path.join(assets,'tcgp-battle-effects.js')),core=require(path.join(assets,'tcgp-battle-core.js')),cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const id=n=>'bw7-'+n,ref=(cardId,uid)=>({cardId,uid:uid||cardId}),slot=(n,uid)=>core.makePokemonSlot(id(n),4,uid||'slot-'+n);
function scene(){const d=cpu.generate({sets:['bw7'],type:'Grass',seed:31});assert.ok(d.ok,JSON.stringify(d.errors));
 const s=core.createBattle({format:'classic',seed:31,firstSide:'player',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal'],opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.modifiers=[];s.stadium=null;
 for(const [who,p] of Object.entries(s.sides)){p.turnCount=4;p.active=slot(who==='player'?89:101,who+'-active');p.active.energy={Fire:2,Grass:3,Fighting:2,Water:2};p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.energyDiscard={};p.energySupply=[];p.prizes=[ref('bw7-1',who+'-p1'),ref('bw7-2',who+'-p2'),ref('bw7-3',who+'-p3')];p.prizesTaken=0;}
 return s;}
function bench(ss,n,uid){const p=slot(n,uid||'b'+ss.bench.length);p.benchSlot=ss.bench.length;ss.bench.push(p);return p;}
function apply(s,e,{action={},resolve=false,attacker=s.sides.player.active,defender=s.sides.opponent.active,random=()=>.1}={}){
 let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker,defender,cardById:data.cardById,action,resolvingChoice:resolve,isAttack:true,random,
 requestChoice:ch=>choice=ch,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r&&ss.hand.length<Number(ss.handLimit||8))ss.hand.push(r);return r;},
 onEnergyAttached:()=>{},maxHp:(who,p)=>core.maxHp(s,who,p),effectiveEnergy:p=>core.effectiveEnergy(s,p===s.sides.player.active?'player':'opponent',p)});return choice;}
function attack(s,n,name,{random=()=>.1,action={}}={}){const a=set.cardById(id(n)).attacks.find(x=>x.name===name);assert.ok(a,n+':'+name);return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,random,isAttack:true,effectiveEnergy:p=>core.effectiveEnergy(s,'player',p),retreatCost:which=>data.cardById(s.sides[which].active.cardId)?.retreat,maxHp:(which,p)=>core.maxHp(s,which,p)});}

test('153 distinct prints, 216 attacks, 21 Abilities, EX full art and ACE SPEC metadata',()=>{
 assert.equal(set.CARDS.length,153);assert.equal(new Set(set.CARDS.map(x=>x.id)).size,153);
 assert.ok(set.CARDS.every(x=>x.battleEnabled));assert.equal(set.CARDS.reduce((a,x)=>a+(x.attacks||[]).length,0),216);assert.equal(set.CARDS.reduce((a,x)=>a+(x.abilities||[]).length,0),21);
 for(const n of [9,49,67,89,101,103,141,142,143,144,145,146])assert.equal(set.cardById(id(n)).prizeCards,2);
 for(const n of [137,138,139,140])assert.equal(set.cardById(id(n)).aceSpec,true);
});
test('ACE SPEC restriction applies across different print names, but allows exactly one',()=>{
 const base=Array(29).fill('bw7-1'); // other copy restriction expected; inspect ACE error explicitly
 const bad=data.validateDeck([...base.slice(0,28),'bw7-137','bw7-138']);assert.ok(bad.errors.some(x=>x.includes('ACE SPEC')));
 const good=data.validateDeck([...base,'bw7-137']);assert.ok(!good.errors.some(x=>x.includes('ACE SPEC')));
});
test('Crystal Wall sets Black Kyurem-EX to 300 HP; Aspertia City Gym buffs Colorless',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(101);assert.equal(core.maxHp(s,'player',p.active),180);
 p.active.tool=ref('bw7-139','wall');assert.equal(core.maxHp(s,'player',p.active),300);
 p.active=slot(109);const h=core.maxHp(s,'player',p.active);s.stadium=ref('bw7-127','stadium');assert.equal(core.maxHp(s,'player',p.active),h+20);
});
test('Crystal Edge boosts White Kyurem-EX attack only, before Weakness',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(103);o.active=slot(20);o.active.weaknessOverride='Dragon';
 assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,60,data.cardById),120);
 p.active.tool=ref('bw7-138','edge');assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,60,data.cardById),220);
});
test('Allergy Panic changes Weakness to ×4 for either player and suppresses under Garbotoxin',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(89);o.active=slot(101);o.active.weaknessOverride='Fighting';
 assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,30,data.cardById),60);
 bench(p,3,'vile');assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,30,data.cardById),120);
 bench(o,3,'vile2');assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,30,data.cardById),120);
 const lock=bench(o,3,'garbo-temp');lock.cardId='bw6-54';lock.tool=ref('bw6-114','cape');assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,30,data.cardById),60);
});
test('Stoutland Sentinel blocks opposing Supporters but not Items',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;o.active=slot(122);p.hand=[ref('bw7-148','c'),ref('bw7-128','energy')];p.deck=[ref('bw7-9','p')];p.energySupply=['Water'];
 const a=core.legalActions(s,'player');assert.ok(!a.some(x=>x.type==='trainer'&&x.cardId==='bw7-148'));assert.ok(a.some(x=>x.type==='trainer'&&x.cardId==='bw7-128'));
});
test('Jellicent Stickiness adds one retreat cost for opposing Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(89);const x=core.retreatCost(s,'player');bench(o,45,'jelly');assert.equal(core.retreatCost(s,'player'),x+1);
});
test('Grass Knot and Hundred Furious Lashes calculate damage before matching',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(4);s.sides.opponent.active=slot(109);assert.equal(attack(s,4,'Grass Knot').damage,10+20*Number(data.cardById(id(109)).retreat));
 p.active=slot(6);p.active.energy={Grass:3};const r=attack(s,6,'Hundred Furious Lashes');assert.equal(r.damage,90);assert.ok(r.pendingEffects.length);
});
test('Super Fang leaves defending Pokémon on exactly 10 HP and does not heal',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(105);o.active=slot(101);o.active.damage=40;
 const r=attack(s,105,'Super Fang');assert.equal(r.damage,0);apply(s,r.pendingEffects[0]);assert.equal(o.active.damage,170);
 o.active.damage=175;apply(s,r.pendingEffects[0]);assert.equal(o.active.damage,175);
});
test('Giga Horn logs two flips, both tails prevents damage',()=>{
 const s=scene();s.sides.player.active=slot(8);
 assert.equal(attack(s,8,'Giga Horn',{random:()=>.9}).damage,0);
 assert.equal(attack(s,8,'Giga Horn',{random:()=>.1}).damage,80);assert.ok(s.log.some(x=>x.type==='coin'&&x.results.length===2));
});
test('Land Judgment optional Energy discard applies +70 damage and tracks Energy',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(89);p.active.energy={Fighting:2};
 const opt=fx.choicesForEffect(set.cardById(id(89)).attacks[1].effect,{state:s,side:'player',foeSide:'opponent',attacker:p.active,cardById:data.cardById});assert.equal(opt.length,2);
 let r=attack(s,89,"Land's Judgment");assert.equal(r.damage,80);
 r=attack(s,89,"Land's Judgment",{action:{effectSelection:'discard'}});assert.equal(r.damage,150);apply(s,r.pendingEffects[0],{action:{effectSelection:'discard'}});
 assert.equal(p.active.energy.Fighting,0);assert.equal(p.energyDiscard.Fighting,2);
});
test('Draw In attaches actual discarded Fire Energy, not a newly minted Zone unit',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(18);p.active.energy={};p.energyDiscard={Fire:2};p.energySupply=['Water'];
 const eff=set.cardById(id(18)).attacks[0].effect;let ch=apply(s,eff);assert.equal(ch.kind,'option');
 ch=apply(s,ch.effect,{action:{choiceOption:0},resolve:true});assert.equal(p.active.energy.Fire,1);assert.equal(p.energyDiscard.Fire,1);
 assert.equal(ch.kind,'option');apply(s,ch.effect,{action:{choiceOption:0},resolve:true});assert.equal(p.active.energy.Fire,2);assert.equal(p.energyDiscard.Fire,0);assert.deepEqual(p.energySupply,['Water']);
});
test('Dragon Stream heads attaches discarded Basic Energy to attacker, not Bench',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(103);p.active.energy={};p.energyDiscard.Lightning=1;const b=bench(p,89);
 const eff=set.cardById(id(103)).attacks[0].effect;const ch=apply(s,eff);assert.equal(ch.kind,'option');apply(s,ch.effect,{action:{choiceOption:0},resolve:true});
 assert.equal(p.active.energy.Lightning,1);assert.equal(b.energy.Lightning||0,0);assert.equal(p.energyDiscard.Lightning,0);
});
test('Gnaw Through discards a physical opposing Tool and not the top card of any deck',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(105);o.active.tool=ref('bw7-139','wall');o.deck=[ref('bw7-1','top')];
 const r=attack(s,105,'Gnaw Through');const ch=apply(s,r.pendingEffects[0]);assert.equal(ch.kind,'option');apply(s,ch.effect,{action:{choiceOption:0},resolve:true});
 assert.equal(o.active.tool,null);assert.equal(o.discard[0].uid,'wall');assert.equal(o.deck[0].uid,'top');
});
test('Rush In switches real Benched Keldeo-EX with Active',()=>{
 const s=scene(),p=s.sides.player;const k=bench(p,49,'keldeo'),before=p.active;
 assert.ok(core.legalActions(s,'player').some(x=>x.type==='ability'&&x.cardId===id(49)));
 apply(s,set.cardById(id(49)).abilities[0].effect,{attacker:k});assert.equal(p.active.uid,k.uid);assert.ok(p.bench.some(x=>x.uid===before.uid));
});
test('Dusknoir Sinister Hand moves exactly one damage counter among opponent Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;const x=bench(o,109,'target');p.active=slot(63);o.active.damage=40;
 let ch=apply(s,set.cardById(id(63)).abilities[0].effect);assert.equal(ch.kind,'pokemon');ch=apply(s,ch.effect,{action:{choiceTarget:'active'},resolve:true});assert.equal(ch.kind,'pokemon');apply(s,ch.effect,{action:{choiceTarget:'bench',choiceBenchIndex:0},resolve:true});
 assert.equal(o.active.damage,30);assert.equal(x.damage,10);
});
test('Audino Busybody is a real hand action: heals and discards Audino',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('bw7-126','audino')];p.active.damage=20;p.active.conditions={poison:true};
 const a=core.legalActions(s,'player').find(x=>x.type==='bw7Busybody');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(p.hand.length,0);assert.ok(p.discard.some(r=>r.uid==='audino'));assert.equal(p.active.damage,10);assert.deepEqual(p.active.conditions,{});
});
test('Crustle Sturdy prevents KO only at full HP and when Ability active',()=>{
 const s=scene(),o=s.sides.opponent,p=s.sides.player;p.active=slot(89);o.active=slot(85);
 assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,300,data.cardById),Number(data.cardById(o.active.cardId).hp)-10);
 o.active.damage=10;assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,300,data.cardById),300);
});
test('Town Map turns each current Prize face up (not shuffle or draw)',()=>{
 const s=scene(),p=s.sides.player;apply(s,set.cardById(id(136)).effect);assert.ok(p.prizes.every(r=>r.faceUp));assert.equal(p.prizes.length,3);
});
test('Rocky Helmet retaliates only to a real opponent Active attack hit',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(89);p.active.energy={Fighting:3};o.active=slot(101);o.active.tool=ref('bw7-133','rocky');
 // Pending direct battle attacks go through the shared event pipeline.
 const act=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.cardId==='bw7-89'&&x.attackIndex===1&&x.effectSelection==='');assert.ok(act);
 core.applyAction(s,'player',act);assert.ok(p.active.damage>=20,'Rocky Helmet places 2 counters on Attacker');
});

test('Musharna Dream Waltz is legal while Asleep and adds its printed 30 damage',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(69);p.active.conditions={sleep:true};p.active.energy={Psychic:3};
 assert.ok(set.cardById(id(69)).attacks[1].allowAsleep);
 const a=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===1&&a.attackCardId===id(69));assert.ok(a,'Dream Waltz attack is offered while Asleep');
 assert.equal(attack(s,69,'Dream Waltz').damage,90);
});
test('Fluffy Tag only buffs the selected new Active during its next own turn',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(15);p.active.energy={Grass:1};const target=bench(p,7,'scyther');
 const eff=set.cardById(id(15)).attacks[0].effect;const ch=apply(s,eff);assert.equal(ch.kind,'pokemon');apply(s,ch.effect,{action:{choiceTarget:'bench',choiceBenchIndex:0},resolve:true});
 assert.equal(p.active.uid,target.uid);assert.equal(p.active.bw7FluffyTagPrimedAt,s.turnNumber);
 assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,10,data.cardById),10);
 s.turnNumber+=2;assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,10,data.cardById),50);
 s.turnNumber+=2;assert.equal(fx.attackDamageWithState(s,'player',p.active,'opponent',o.active,10,data.cardById),10);
});
test('Liepard Assist copies an actual Benched attack rather than consuming a Supporter',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(91);p.active.energy={Darkness:3};bench(p,7,'helper');p.deck=[ref('bw7-130','hugh')];
 s.rngState=1;const act=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackCardId===id(91)&&a.attackIndex===1);assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
 assert.ok(s.pendingChoice.options.some(x=>x.includes('Sharp Scythe')));
 const ci=s.pendingChoice.options.findIndex(x=>x.includes('Sharp Scythe'));
 const choice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===ci);assert.ok(choice);
 core.applyAction(s,'player',choice);
 assert.equal(o.active.damage,20);assert.equal(p.deck[0].uid,'hugh','a Supporter cannot be consumed by Assist');
 assert.ok(s.log.some(x=>x.type==='copyAttack'&&x.attack==='Sharp Scythe'));
});

test('Hugh makes the opponent discard by choice first, then player; both use the real discard',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.hand=[ref('bw7-130','hugh'),...Array.from({length:6},(_,i)=>ref('bw7-1','own-'+i))];
 o.hand=Array.from({length:6},(_,i)=>ref('bw7-7','foe-'+i));
 const act=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId==='bw7-130');assert.ok(act);
 core.applyAction(s,'player',act);assert.equal(s.choiceSide,'opponent');assert.equal(s.phase,'effectChoice');
 const oppChoice=core.legalActions(s,'opponent').find(a=>a.type==='effectChoice'&&a.choiceOption===2);assert.ok(oppChoice);
 core.applyAction(s,'opponent',oppChoice);assert.equal(o.hand.length,5);assert.equal(o.discard[0].uid,'foe-2');
 assert.equal(s.choiceSide,'player');assert.equal(s.pendingChoice.kind,'option');
 const selfChoice=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===1);assert.ok(selfChoice);
 core.applyAction(s,'player',selfChoice);assert.equal(p.hand.length,5);assert.ok(p.discard.some(r=>r.uid==='own-1'));
 assert.ok(!p.deck.some(r=>r.uid==='own-1'),'discard is not shuffle into deck');
});
test('Audino Busybody can be played from the visible hand action sheet',()=>{
 const ui=require(path.join(assets,'tcgp-battle-ui.js'));
 const s=scene(),p=s.sides.player;p.hand=[ref('bw7-126','audino')];p.active.damage=20;
 const actions=core.legalActions(s,'player');ui._test.setCurrentBattleForTests(s,actions);
 const i=actions.findIndex(a=>a.type==='bw7Busybody');assert.ok(i>=0);
 assert.ok(ui._test.handActionIndices(0).includes(i));
 assert.ok(ui.centerHandActionIndices(actions,0).includes(i));
 assert.equal(ui.directHandDropActionIndex(actions,s,0,'active',0),i);
 assert.match(ui.actionLabel(actions[i],s,'player'),/BUSYBODY/);
});

test('Busybody chooses exactly one Condition to clear and keeps the other',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('bw7-126','aud')];p.active.damage=20;p.active.conditions={poison:true,burn:true};
 const act=core.legalActions(s,'player').find(a=>a.type==='bw7Busybody');assert.ok(act);core.applyAction(s,'player',act);
 assert.equal(p.active.damage,10);assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
 const option=core.legalActions(s,'player').find(a=>a.type==='effectChoice'&&a.choiceOption===0);assert.ok(option);
 core.applyAction(s,'player',option);assert.ok(!p.active.conditions.poison);assert.equal(p.active.conditions.burn,true);
});
