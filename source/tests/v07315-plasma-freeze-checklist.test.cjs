'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const bw9=require(path.join(assets,'tcg-classic-plasma-freeze.js'));
const R=(id,uid)=>({cardId:id,uid:uid||id}),M=(id,uid)=>({...core.makePokemonSlot(id,1,uid||id),benchSlot:0,damage:0,tool:null,extraTools:[],energy:{},specialEnergy:[],conditions:{}});
function scene(){const S=()=>({active:M('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[R('bw9-1')],prizesTaken:0,turnCount:4,handLimit:8,benchLimit:3,trainerUsed:false,supporterUsed:false});return {format:'classic',phase:'battle',activeSide:'player',turnNumber:10,stadium:null,sides:{player:S(),opponent:S()},rules:{benchSize:3,winMode:'prizes'},log:[],rngState:12};}
function effect(s,e,opts={}){let choice;fx.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:opts.action||{},isAttack:opts.isAttack||false,resolvingChoice:opts.resume||false,requestChoice:c=>{choice=c;},random:()=>.1,shuffle:(_s,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},onEnergyAttached:()=>{},trainerRef:opts.trainerRef,...opts.ctx});return choice;}
function attack(s,n,name){const a=bw9.cardById('bw9-'+n).attacks.find(x=>x.name===name);return fx.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action:{},isAttack:true,random:()=>.1,effectiveEnergy:p=>p.energy,retreatCost:()=>2});}
test('Miltank Max Milk heals chosen Bench but discards only the attacking Miltank Energy',()=>{const s=scene(),us=s.sides.player;us.active=M('bw9-93','milk');us.active.energy={Water:2};us.active.specialEnergy=[R('bw9-106','plasma')];const b=M('bw9-1','target');b.damage=40;b.energy={Grass:2};us.bench=[b];const r=attack(s,93,'Max Milk');for(const e of r.pendingEffects){const q=effect(s,e,{isAttack:true});assert.equal(q?.kind,'pokemon');effect(s,{...q.effect},{isAttack:true,resume:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});}assert.equal(b.damage,0);assert.equal(b.energy.Grass,2);assert.equal(us.active.energy.Water,0);assert.equal(us.active.specialEnergy.length,0);assert.equal(us.energyDiscard.Water,2);assert.deepEqual(us.discard.map(x=>x.uid),['plasma']);});
test('Ultra Ball pays two distinct physical hand cards and retrieves selected Pokémon',()=>{const s=scene(),us=s.sides.player;us.hand=[R('bw9-1','cost-A'),R('bw9-99','cost-B')];us.deck=[R('bw9-2','find-me'),R('bw9-3','not-me')];let q=effect(s,bw9.cardById('bw9-122').effect,{trainerRef:R('bw9-122','played')});assert.equal(q?.kind,'option');q=effect(s,{...q.effect},{resume:true,action:{choiceOption:0},trainerRef:R('bw9-122','played')});assert.equal(q?.kind,'option');q=effect(s,{...q.effect},{resume:true,action:{choiceOption:0},trainerRef:R('bw9-122','played')});assert.equal(q?.kind,'option');effect(s,{...q.effect},{resume:true,action:{choiceOption:0},trainerRef:R('bw9-122','played')});assert.equal(us.hand.length,1);assert.equal(us.hand[0].uid,'find-me');assert.deepEqual(us.discard.map(x=>x.uid),['cost-A','cost-B']);});
test('Superior Energy Retrieval pays two distinct cards; recovers physical and ledger Basic Energy, not its own costs',()=>{const s=scene(),us=s.sides.player;us.hand=[R('bw9-99','tool-cost'),R('bw9-101','trainer-cost')];us.discard=[R('neo1-107','fire-one')];us.energyDiscard={Water:2,Fire:1};let q=effect(s,bw9.cardById('bw9-103').effect,{trainerRef:R('bw9-103','played')});assert.equal(q?.kind,'option');q=effect(s,{...q.effect},{resume:true,action:{choiceOption:0},trainerRef:R('bw9-103','played')});assert.equal(q?.kind,'option');q=effect(s,{...q.effect},{resume:true,action:{choiceOption:0},trainerRef:R('bw9-103','played')});assert.equal(q?.kind,'option');for(let i=0;i<4&&q;i++){q=effect(s,q.effect,{resume:true,action:{choiceOption:0},trainerRef:R('bw9-103','played')});}assert.equal(us.hand.length,4);assert.equal(us.energyDiscard.Fire,0);assert.equal(us.energyDiscard.Water,0);assert.ok(us.hand.some(x=>x.uid==='fire-one'));assert.ok(us.hand.every(x=>!['tool-cost','trainer-cost'].includes(x.uid)));});
test('Thundurus-EX Raiden Knuckle attaches actual discarded Zone Energy to chosen Team Plasma Bench',()=>{const s=scene(),us=s.sides.player;us.active=M('bw9-38');us.bench=[M('bw9-53','plasma-bench')];us.energyDiscard={Lightning:2};const r=attack(s,38,'Raiden Knuckle');let q=effect(s,r.pendingEffects[0],{isAttack:true});assert.equal(q?.kind,'option');q=effect(s,{...q.effect},{resume:true,isAttack:true,action:{choiceOption:0}});assert.equal(q?.kind,'pokemon');effect(s,{...q.effect},{resume:true,isAttack:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});assert.equal(us.bench[0].energy.Lightning,1);assert.equal(us.energyDiscard.Lightning,1);});
test('Kingdra Dragon Vortex returns Basic Energy ledger cards to physical draw deck',()=>{const s=scene(),us=s.sides.player;us.active=M('bw9-84');us.energyDiscard={Water:2,Lightning:1};us.discard=[R('neo1-111','physical-water'),R('bw9-99','tool')];const r=attack(s,84,'Dragon Vortex');assert.equal(r.damage,80);for(const e of r.pendingEffects)effect(s,e,{isAttack:true});assert.equal(us.energyDiscard.Water,0);assert.equal(us.energyDiscard.Lightning,0);assert.equal(us.deck.length,4);assert.ok(us.deck.some(x=>x.uid==='physical-water'));assert.ok(us.deck.every(x=>data.cardById(x.cardId)?.basicEnergy));assert.deepEqual(us.discard.map(x=>x.uid),['tool']);});
test('Chandelure Flare Navigate searches an older-set Fire Basic Energy print and attaches exactly one',()=>{const s=scene(),us=s.sides.player;us.active=M('bw9-16');us.deck=[R('neo1-107','fire-ref'),R('bw9-1','other')];let q=effect(s,bw9.cardById('bw9-16').abilities[0].effect);assert.equal(q?.kind,'option');q=effect(s,q.effect,{resume:true,action:{choiceOption:0}});assert.equal(q?.kind,'pokemon');effect(s,q.effect,{resume:true,action:{choiceTarget:'active'}});assert.equal(us.active.energy.Fire,1);assert.equal(us.active.damage,10);assert.deepEqual(us.deck.map(r=>r.uid),['other']);});
test('Muk Sludge Crash presents exact Energy choice for each heads, preserving other attached Energy',()=>{const s=scene(),d=s.sides.opponent.active;d.energy={Water:1};d.specialEnergy=[R('bw9-106','my-plasma')];let i=0;const results=[0.1,0.1,0.9];let q=effect(s,{type:'neoRule',rule:'bw9:sludgeCrash'},{isAttack:true,ctx:{random:()=>results[i++]??0.9}});assert.equal(q?.kind,'option');assert.equal(q.options.length,2);const x=q.options.findIndex(x=>x.includes('Plasma Energy'));assert.notEqual(x,-1);q=effect(s,q.effect,{resume:true,isAttack:true,action:{choiceOption:x}});assert.equal(d.specialEnergy.length,0);assert.equal(s.sides.opponent.discard[0].uid,'my-plasma');assert.equal(q?.kind,'option');effect(s,q.effect,{resume:true,isAttack:true,action:{choiceOption:0}});assert.equal(d.energy.Water,0);assert.equal(s.sides.opponent.energyDiscard.Water,1);assert.equal(s.log.find(l=>l.reason==='Sludge Crash').heads,2);});
test('Every battle-enabled BW9 effect is valid against the shared engine schema',()=>{
 for(const c of bw9.CARDS){if(!c.battleEnabled)continue;
  const effects=[...(c.attacks||[]).map(x=>x.effect),...(c.abilities||[]).map(x=>x.effect),...(c.kind==='trainer'||c.kind==='energy'?[c.effect]:[])];
  for(const e of effects){assert.ok(e,c.id+' missing effect');assert.deepEqual(fx.validateEffect(e),[],`${c.id}: ${JSON.stringify(e)}`);}
 }
});
test('Cryogonal Call Sign selects Water Pokémon only; Pachirisu Basic search accepts Zone and physical cards',()=>{
 const s=scene(),us=s.sides.player;us.active=M('bw9-30');us.deck=[R('bw9-20','vaporeon'),R('bw9-1','weedle')];
 let q=effect(s,bw9.cardById('bw9-30').attacks[0].effect,{isAttack:true});assert.equal(q.kind,'deckCard');
 assert.equal(q.filter.subtype,'Water');
 effect(s,q.effect,{isAttack:true,resume:true,action:{choiceDeckIndex:0}});
 assert.deepEqual(us.hand.map(x=>x.uid),['vaporeon']);assert.deepEqual(us.deck.map(x=>x.uid),['weedle']);
 us.active=M('bw9-37');us.energySupply=['Water','Lightning'];
 q=effect(s,bw9.cardById('bw9-37').attacks[0].effect,{isAttack:true});assert.equal(q.kind,'option');
 assert.ok(q.options.some(o=>o.includes('Water Energy')));
 q=effect(s,q.effect,{isAttack:true,resume:true,action:{choiceOption:0}});
 assert.equal(us.hand.length,2);assert.equal(data.cardById(us.hand[1].cardId).subtype,'Water');assert.deepEqual(us.energySupply,['Lightning']);
});
test('BW9 full-art prints preserve corresponding normal effect and ability text',()=>{
 for(const [normal,full] of [[13,109],[38,110],[53,111],[85,112],[86,113],[98,114],[101,115]]){
  const a=bw9.cardById('bw9-'+normal),b=bw9.cardById('bw9-'+full);
  assert.equal(a.name,b.name);assert.deepEqual(a.attacks,b.attacks);assert.deepEqual(a.abilities,b.abilities);
  if(a.kind==='trainer')assert.deepEqual(a.effect,b.effect);
 }
});
test('BW9 Trainer cost gate requires two additional hand cards before Ultra Ball and Superior Retrieval',()=>{
 for(const n of [103,122]){
  const s=scene(),us=s.sides.player;us.hand=[R('bw9-'+n,'played'),R('bw9-1','single')];
  assert.equal(core.legalActions(s,'player').some(x=>x.type==='trainer'&&x.cardId==='bw9-'+n),false);
  us.hand.push(R('bw9-2','second'));
  assert.equal(core.legalActions(s,'player').some(x=>x.type==='trainer'&&x.cardId==='bw9-'+n),true);
 }
});
test('Kingdra Tri Bullet chooses three distinct opposing Pokémon and hits each once',()=>{
 const s=scene(),us=s.sides.player,foe=s.sides.opponent;us.active=M('bw9-84');foe.active=M('bw9-1','a');foe.bench=[M('bw9-2','b'),M('bw9-3','c')];foe.bench[0].benchSlot=0;foe.bench[1].benchSlot=1;
 const out=attack(s,84,'Tri Bullet');assert.equal(out.damage,0);let q=effect(s,out.pendingEffects[0],{isAttack:true});assert.equal(q.kind,'pokemon');
 q=effect(s,q.effect,{isAttack:true,resume:true,action:{choiceTarget:'active'}});assert.equal(foe.active.damage,30);
 assert.ok(q.excludeUids.includes('a'));q=effect(s,q.effect,{isAttack:true,resume:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(foe.bench[0].damage,30);assert.ok(q.excludeUids.includes('b'));
 q=effect(s,q.effect,{isAttack:true,resume:true,action:{choiceTarget:'bench',choiceBenchIndex:1}});
 assert.equal(foe.bench[1].damage,30);assert.equal(q,undefined);
});
