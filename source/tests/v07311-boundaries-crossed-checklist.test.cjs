'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js')),
  set=require(path.join(assets,'tcg-classic-boundaries-crossed.js')),
  fx=require(path.join(assets,'tcgp-battle-effects.js')),
  core=require(path.join(assets,'tcgp-battle-core.js')),
  cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const ref=(cardId,uid)=>({cardId,uid:uid||cardId}), slot=(n,uid)=>core.makePokemonSlot('bw7-'+n,4,uid||'bw7-'+n);
function scene(){const deck=cpu.generate({sets:['bw7'],type:'Grass',seed:34});assert.ok(deck.ok);
 const s=core.createBattle({format:'classic',seed:34,firstSide:'player',playerDeck:deck.cards,opponentDeck:deck.cards,
  playerEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal'],
  opponentEnergyTypes:['Fire','Water','Lightning','Darkness','Grass','Psychic','Fighting','Metal']});
 s.phase='battle';s.activeSide='player';s.turnNumber=9;s.log=[];s.modifiers=[];s.stadium=null;
 for(const [who,p] of Object.entries(s.sides)){p.turnCount=4;p.active=slot(who==='player'?89:101,who+'-active');p.active.energy={};p.active.specialEnergy=[];p.bench=[];p.hand=[];p.deck=[];p.discard=[];p.energyDiscard={};p.energySupply=[];p.prizes=[ref('bw7-1',who+'-prize')];p.prizesTaken=0;}return s;
}
function bench(ss,n,uid){const p=slot(n,uid);p.benchSlot=ss.bench.length;ss.bench.push(p);return p;}
function apply(s,e,{action={},resolve=false,attacker=s.sides.player.active,defender=s.sides.opponent.active,random=()=>.1}={}){
 let choice=null;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker,defender,cardById:data.cardById,action,resolvingChoice:resolve,isAttack:true,random,
 requestChoice:ch=>choice=ch,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},
 onEnergyAttached:()=>{},maxHp:(who,p)=>core.maxHp(s,who,p),effectiveEnergy:p=>core.effectiveEnergy(s,'player',p)});return choice;
}
function attack(s,number,name,action={}){const card=set.cardById('bw7-'+number),a=card.attacks.find(x=>x.name===name);assert.ok(a);
 return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,random:()=>.1,isAttack:true,effectiveEnergy:p=>core.effectiveEnergy(s,'player',p),retreatCost:who=>data.cardById(s.sides[who].active.cardId)?.retreat,maxHp:(who,p)=>core.maxHp(s,who,p)});}

test('Charizard Split Bomb: opposing Active takes Weakness and Bench takes printed 40',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(20,'charizard');o.active=slot(3,'vileplume');o.active.weaknessOverride='Fire';const b=bench(o,109,'target-bench');
 const e=set.cardById('bw7-20').attacks[0].effect;
 assert.equal(e.type,'multiTargetDamage');assert.equal(e.activeWeaknessResistance,true);
 let ch=apply(s,e);assert.equal(ch.kind,'pokemon');assert.equal(o.active.damage,0);
 ch=apply(s,ch.effect,{resolve:true,action:{choiceTarget:'opponentActive'}});
 assert.equal(o.active.damage,160);assert.equal(b.damage,0);assert.equal(ch.kind,'pokemon');
 apply(s,ch.effect,{resolve:true,action:{choiceTarget:'opponentBench',choiceBenchIndex:b.benchSlot}});
 assert.equal(o.active.damage,160);assert.equal(b.damage,40);
});

test('Psyduck Firefighting discards a physical Blend Energy providing Fire with original UID',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(33,'duck');o.active.specialEnergy=[ref('bw6-117','blend-fire')];
 const effect=set.cardById('bw7-33').attacks[0].effect;apply(s,effect);
 assert.equal(o.active.specialEnergy.length,0);assert.deepEqual(o.discard.map(r=>r.uid),['blend-fire']);assert.equal(o.energyDiscard.Fire||0,0);
});

test('Firefighting asks which Fire Energy to discard when Basic and Blend are both attached',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(33,'duck');o.active.energy.Fire=1;o.active.specialEnergy=[ref('bw6-117','blend-fire')];
 const effect=set.cardById('bw7-33').attacks[0].effect;let ch=apply(s,effect);
 assert.equal(ch.kind,'option');assert.equal(ch.options.length,2);
 const specialIndex=ch.options.findIndex(x=>/Blend Energy/.test(x));assert.ok(specialIndex>=0);
 apply(s,ch.effect,{resolve:true,action:{choiceOption:specialIndex}});
 assert.equal(o.active.energy.Fire,1);assert.equal(o.active.specialEnergy.length,0);assert.equal(o.discard[0].uid,'blend-fire');
});

test('Landorus-EX Land Judgment has 150-damage optional choice for physical Blend Fighting',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(89,'lando');p.active.specialEnergy=[ref('bw6-118','blend-fighting')];
 const e=set.cardById('bw7-89').attacks[1].effect;
 const choices=fx.choicesForEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:p.active,cardById:data.cardById});
 assert.equal(choices.length,2);
 const r=attack(s,89,"Land's Judgment",{effectSelection:'discard'});assert.equal(r.damage,150);
 assert.equal(r.pendingEffects.length,1);apply(s,r.pendingEffects[0],{action:{effectSelection:'discard'}});
 assert.equal(p.active.specialEnergy.length,0);assert.deepEqual(p.discard.map(r=>r.uid),['blend-fighting']);
});

test('Energy Search offers physical deck and Energy Zone separately, preserving physical card UID',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('bw1-106','physical-fire')];p.energySupply=['Fire'];const e=set.cardById('bw7-128').effect;
 let ch=apply(s,e);assert.equal(ch.kind,'option');assert.equal(ch.options.length,2);
 const deckIdx=ch.options.findIndex(x=>/physical deck/.test(x));assert.ok(deckIdx>=0);
 apply(s,ch.effect,{resolve:true,action:{choiceOption:deckIdx}});
 assert.deepEqual(p.hand.map(r=>r.uid),['physical-fire']);assert.deepEqual(p.energySupply,['Fire']);
 ch=apply(s,e);assert.equal(ch.options.length,1);assert.match(ch.options[0],/Energy Zone/);
 apply(s,ch.effect,{resolve:true,action:{choiceOption:0}});
 assert.equal(p.hand.length,2);assert.equal(p.hand[1].cardId,'bw1-106');assert.equal(p.energySupply.length,0);
});

test('Flygon Flying Beatdown can discard separate physical Grass and Fighting Blend Energy cards',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(99,'flygon');
 p.active.specialEnergy=[ref('bw6-117','grass-blend'),ref('bw6-118','fighting-blend')];
 const e=set.cardById('bw7-99').attacks[0].effect;
 const choices=fx.choicesForEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:p.active,cardById:data.cardById});
 assert.equal(choices.length,2);const hit=attack(s,99,'Flying Beatdown',{effectSelection:'discard'});assert.equal(hit.damage,80);
 apply(s,hit.pendingEffects[0],{action:{effectSelection:'discard'}});
 assert.equal(p.active.specialEnergy.length,0);assert.deepEqual(p.discard.map(r=>r.uid).sort(),['fighting-blend','grass-blend']);
 assert.ok(o.active.conditions.paralysis);
});

test('Flygon requires two distinct Energy cards; a single Rainbow does not fund both discards',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(99,'flygon');p.active.specialEnergy=[{...ref('bw4-93','rainbow'),provides:{Rainbow:1}}];
 const e=set.cardById('bw7-99').attacks[0].effect;
 assert.equal(fx.choicesForEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:p.active,cardById:data.cardById}).length,1);
});

test('Land Judgment discards all Fighting sources together (basic counter and real Special)',()=>{
 const s=scene(),p=s.sides.player;p.active=slot(144,'lando-full-art');p.active.energy.Fighting=2;
 p.active.specialEnergy=[ref('bw6-118','blend-both')];
 const eff=set.cardById('bw7-144').attacks[1].effect;
 assert.equal(fx.choicesForEffect(eff,{state:s,side:'player',foeSide:'opponent',attacker:p.active,cardById:data.cardById}).length,2);
 const result=attack(s,144,"Land's Judgment",{effectSelection:'discard'});assert.equal(result.damage,150);
 apply(s,result.pendingEffects[0],{action:{effectSelection:'discard'}});
 assert.equal(p.active.energy.Fighting,0);assert.equal(p.energyDiscard.Fighting,2);
 assert.equal(p.active.specialEnergy.length,0);assert.deepEqual(p.discard.map(r=>r.uid),['blend-both']);
});

test('Flygon asks for exact distinct Energy choices when Basic and Blend sources coexist',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=slot(99,'flygon');
 p.active.energy={Grass:1,Fighting:1};p.active.specialEnergy=[ref('bw6-117','grpd'),ref('bw6-118','wlfm')];
 const e=set.cardById('bw7-99').attacks[0].effect;
 let choice=apply(s,e,{action:{effectSelection:'discard'}});assert.equal(choice.kind,'option');assert.equal(choice.options.length,4);
 const bothSpecial=choice.options.findIndex(label=>label.includes('Blend Energy Grass')&&label.includes('Blend Energy Water'));
 assert.ok(bothSpecial>=0);
 apply(s,choice.effect,{resolve:true,action:{choiceOption:bothSpecial}});
 assert.equal(p.active.energy.Grass,1);assert.equal(p.active.energy.Fighting,1);
 assert.deepEqual(p.discard.map(r=>r.uid).sort(),['grpd','wlfm']);assert.ok(o.active.conditions.paralysis);
});

test('Computer Search ACE SPEC actually discards two selected hand cards then searches the physical deck',()=>{
 const s=scene(),p=s.sides.player;
 p.hand=[ref('bw7-137','ace'),ref('bw7-1','cost-a'),ref('bw7-2','cost-b')];p.deck=[ref('bw7-89','wanted'),ref('bw7-4','spare')];
 const a=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='bw7-137');assert.ok(a,'Computer Search must be legal when two discardable hand cards exist');
 core.applyAction(s,'player',a);assert.equal(s.phase,'effectChoice');assert.equal(s.pendingChoice.kind,'option');
 let choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceOption===0);assert.ok(choice);core.applyAction(s,'player',choice);
 assert.ok(p.discard.some(r=>r.uid==='cost-a'));assert.equal(s.phase,'effectChoice');
 choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceOption===0);assert.ok(choice);core.applyAction(s,'player',choice);
 assert.ok(p.discard.some(r=>r.uid==='cost-b'));assert.equal(s.phase,'effectChoice');
 choice=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceOption===0);assert.ok(choice);core.applyAction(s,'player',choice);
 assert.ok(p.hand.some(r=>r.uid==='wanted'));assert.ok(p.discard.some(r=>r.uid==='ace'));
});
