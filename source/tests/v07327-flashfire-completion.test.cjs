'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const flash=require(path.join(asset,'tcg-classic-flashfire.js'));
const fixture=fs.existsSync(path.join(root,'data/classic/xy2-print-compact.json'));
const R=k=>({type:'neoRule',rule:'xy2:'+k});
const ref=(cardId,uid=cardId)=>({uid,cardId});
const mon=(cardId='xy2-23',uid=cardId)=>({uid,cardId,stack:[cardId],energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,benchSlot:null,playedOnSideTurn:0});
const board=()=>({active:mon(),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energyTypes:['Fire','Grass'],handLimit:8,benchLimit:3,turnCount:3,prizes:[ref('bw1-105','prize')],prizesTaken:0});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:9,sides:{player:board(),opponent:board()},log:[],rngState:7});
const cb=(s,e,overrides={})=>{let pending;const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:id=>data.cardById(id),random:()=>.2,isAttack:true,action:{},
 requestChoice:q=>{pending=q},shuffle:(_,arr)=>arr,
 maxHp:(_,p)=>data.cardById(p.cardId)?.hp||100,
 drawCard:owner=>{const r=owner.deck.shift();if(r)owner.hand.push(r);return r},
 benchCard:(owner,physical)=>{if(owner.bench.length>=owner.benchLimit)return null;const p=mon(physical.cardId,physical.uid);p.benchSlot=owner.bench.length;owner.bench.push(p);return p.benchSlot;},
 onEnergyAttached:()=>{},...overrides};fx.applyEffect(e,ctx);return pending;};
const choose=(s,p,i,extra={})=>cb(s,p.effect,{resolvingChoice:true,action:{choiceOption:i},...extra});
const pick=(s,p,target='active',idx=0,extra={})=>cb(s,p.effect,{resolvingChoice:true,action:{choiceTarget:target,...(target==='bench'?{choiceBenchIndex:idx}:{})},...extra});
const energy=id=>({cardId:{Grass:'bw1-105',Fire:'bw1-106',Fighting:'bw1-110'}[id],uid:id+'-'+Math.random()});

test('XY2 completion: all nineteen previously gated printed identities are battle-enabled',{skip:!fixture},()=>{
 assert.equal(flash.CARDS.length,110);assert.equal(flash.coverage().gated.length,0);
 for(const n of [7,9,20,21,23,27,29,34,35,38,39,40,43,49,50,74,82,85,101]){
  const c=flash.cardById('xy2-'+n);assert.ok(c?.battleEnabled&&c.deckEligible,'missing complete '+n);
  for(const a of c.attacks||[])assert.deepEqual(fx.validateEffect(a.effect),[],c.id+':'+a.name);
  for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],c.id+':'+ab.name);
 }
});

test('XY2 completion: Shiftry Leaf Draw discards the chosen physical Grass Energy and draws exactly three',()=>{
 const s=scene(),p=s.sides.player;p.hand=[ref('bw1-105','grass-a'),ref('bw1-105','grass-b'),ref('bw1-106','fire')];
 p.deck=[ref('bw1-105','draw1'),ref('bw1-105','draw2'),ref('bw1-105','draw3')];
 const q=cb(s,R('leafDraw'));assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 choose(s,q,1);assert.deepEqual(p.discard.map(r=>r.uid),['grass-b']);assert.deepEqual(p.hand.map(r=>r.uid),['grass-a','fire','draw1','draw2','draw3']);
});

test('XY2 completion: Roserade Whiplash repeats choices for each heads and discards distinct Energy',()=>{
 const s=scene(),p=s.sides.opponent.active;p.energy={Fire:1,Water:1};p.specialEnergy=[ref('bw8-127','plasma')];
 const flips=[.2,.2,.9];let i=0;const random=()=>flips[i++];
 let q=cb(s,R('whiplash'),{random});assert.equal(q.kind,'option');assert.equal(q.options.length,3);
 q=choose(s,q,0,{random});assert.equal(q.kind,'option');
 choose(s,q,0,{random});assert.equal(i,3);assert.equal(p.energy.Fire,0);assert.equal(p.energy.Water,0);
 assert.equal(s.sides.opponent.energyDiscard.Fire,1);assert.equal(s.sides.opponent.energyDiscard.Water,1);
});

test('XY2 completion: Pyroar Scorching Fang bonuses require a genuine selected Fire Energy discard',{skip:!fixture},()=>{
 const s=scene(),a=s.sides.player.active;a.cardId='xy2-20';a.energy.Fire=1;const rule=R('scorchingFang');
 let ctx={state:s,side:'player',foeSide:'opponent',attacker:a,defender:s.sides.opponent.active,cardById:id=>data.cardById(id),random:()=>.1,
  action:{effectSelection:'basic:Fire'},isAttack:true};
 const choices=fx.choicesForEffect(rule,ctx);assert.equal(choices.length,2);
 const result=fx.resolveAttack({name:'Scorching Fang',damage:60,effect:rule},ctx);assert.equal(result.damage,90);
 assert.equal(a.energy.Fire,1,'discard happens as attack resolves');
 cb(s,result.pendingEffects[0]);assert.equal(a.energy.Fire,0);assert.equal(s.sides.player.energyDiscard.Fire,1);
 const base=fx.resolveAttack({name:'Scorching Fang',damage:60,effect:rule},{...ctx,action:{effectSelection:''}});
 assert.equal(base.damage,60);
});

test('XY2 completion: Qwilfish retaliation works on a fatal opposing attack and not on nonattack damage',()=>{
 const s=scene(),foe=s.sides.opponent.active;foe.damage=0;
 cb(s,R('counterattackQuills'),{isAttack:false,isAbility:true,eventData:{damage:120,attacker:foe,source:{side:'opponent',attack:true}}});
 assert.equal(foe.damage,20);
 cb(s,R('counterattackQuills'),{isAttack:false,isAbility:true,eventData:{damage:120,attacker:foe,source:{side:'opponent',attack:false}}});
 assert.equal(foe.damage,20);
});

test('XY2 completion: Milotic Energy Grace selects a non-EX target and attaches three real discarded Basic Energy units',{skip:!fixture},()=>{
 const s=scene(),ss=s.sides.player;ss.active=mon('xy2-23','milotic');const b=mon('xy2-29','floatzel');b.benchSlot=0;
 const ex=mon('xy2-35','magnezone-ex');ex.benchSlot=1;ss.bench=[b,ex];
 ss.energyDiscard.Fire=2;ss.discard=[ref('bw1-105','grass-energy'),ref('xy2-4','pineco')];
 let q=cb(s,R('energyGrace'),{isAbility:true,isAttack:false});assert.equal(q.kind,'option');assert.equal(q.options.length,1);
 q=choose(s,q,0,{isAbility:true,isAttack:false});assert.equal(q.kind,'option');assert.equal(q.options.length,3);
 assert.ok(ss.active.damage>=100,'Milotic is marked KO before Prize resolution');
 q=choose(s,q,0,{isAbility:true,isAttack:false});q=choose(s,q,0,{isAbility:true,isAttack:false});
 choose(s,q,0,{isAbility:true,isAttack:false});assert.equal(b.energy.Fire+b.energy.Grass,3);assert.equal(ss.energyDiscard.Fire,0);
 assert.equal(ss.discard.some(x=>x.uid==='grass-energy'),false);assert.equal(ex.energy.Fire||0,0);
});

test('XY2 completion: Heart Wink sets a next-turn-only draw lock on heads',()=>{
 const s=scene(),foe=s.sides.opponent;cb(s,R('heartWink'));assert.equal(foe.xy2HeartWinkSkipTurn,10);
 const t=scene();cb(t,R('heartWink'),{random:()=>.9});assert.equal(t.sides.opponent.xy2HeartWinkSkipTurn,undefined);
});

test('XY2 completion: Floatzel Rescue chooses distinct physical Pokémon from discard and shuffles them into deck',{skip:!fixture},()=>{
 const s=scene(),ss=s.sides.player;ss.discard=[ref('xy2-4','pineco'),ref('xy2-5','seedot'),ref('xy2-6','nuzleaf'),ref('bw1-105','energy')];
 let q=cb(s,R('rescue'));assert.equal(q.kind,'option');
 q=choose(s,q,2);q=choose(s,q,0);choose(s,q,0);
 assert.deepEqual(new Set(ss.deck.map(x=>x.uid)),new Set(['nuzleaf','pineco','seedot']));
 assert.deepEqual(ss.discard.map(x=>x.uid),['energy']);
});

test('XY2 completion: Luxray Fang Snipe reveals opponent hand and lets attacker select the Trainer by physical UID',{skip:!fixture},()=>{
 const s=scene(),foe=s.sides.opponent;foe.hand=[ref('xy2-4','pokemon'),ref('xy2-89','torch'),ref('xy2-92','palpad')];
 const q=cb(s,R('fangSnipe'));assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 choose(s,q,1);assert.deepEqual(foe.hand.map(x=>x.uid),['pokemon','torch']);assert.deepEqual(foe.discard.map(x=>x.uid),['palpad']);
});

test('XY2 completion: both Magnezone prints use multiTargetDamage with two distinct choices',{skip:!fixture},()=>{
 for(const n of [35,101]){
  const c=flash.cardById('xy2-'+n),e=c.attacks.find(a=>a.name==='Dual Bullet').effect;
  assert.equal(e.type,'multiTargetDamage');assert.equal(e.count,2);assert.equal(e.amount,50);
  const s=scene();const p=s.sides.opponent;p.active=mon('xy2-21','active');p.bench=[{...mon('xy2-21','bench'),benchSlot:0}];
  let q=cb(s,e);assert.equal(q.kind,'pokemon');q=pick(s,q,'bench',0);assert.equal(q.kind,'pokemon');
  pick(s,q,'active');assert.equal(p.bench[0].damage,50);assert.ok(p.active.damage>=50);
 }
});

test('XY2 completion: Duskull Revival benches an actual Basic from opponent discard but never an evolution',{skip:!fixture},()=>{
 const s=scene(),foe=s.sides.opponent;foe.discard=[ref('xy2-4','pineco'),ref('xy2-6','nuzleaf')];
 let q=cb(s,R('revival'));assert.equal(q.kind,'option');assert.equal(q.options.length,1);
 choose(s,q,0);assert.deepEqual(foe.bench.map(x=>x.uid),['pineco']);assert.deepEqual(foe.discard.map(x=>x.uid),['nuzleaf']);
});

test('XY2 completion: Dusclops Cursed Drop allocates exactly four chosen damage counters',()=>{
 const s=scene(),foe=s.sides.opponent;foe.bench=[{...mon('xy2-4','bench'),benchSlot:0}];
 let q=cb(s,R('cursedDrop'));q=pick(s,q,'bench',0);q=pick(s,q,'active');q=pick(s,q,'bench',0);pick(s,q,'active');
 assert.equal(foe.active.damage,20);assert.equal(foe.bench[0].damage,20);
});

test('XY2 completion: Dusknoir Shadow Void moves one allied counter per activation and Pain Pellets targets Bench',()=>{
 const s=scene(),own=s.sides.player;own.active=mon('xy2-40','dusknoir');own.bench=[{...mon('xy2-4','ally'),damage:50,benchSlot:0}];
 let q=cb(s,R('shadowVoid'),{isAttack:false,isAbility:true});assert.equal(q.kind,'pokemon');pick(s,q,'bench',0,{isAttack:false,isAbility:true});
 assert.equal(own.active.damage,10);assert.equal(own.bench[0].damage,40);
 s.sides.opponent.bench=[{...mon('xy2-21','target'),benchSlot:0}];
 q=cb(s,R('painPellets'));pick(s,q,'bench',0);assert.equal(s.sides.opponent.bench[0].damage,10);
});

test('XY2 completion: Meowstic Ear Influence transfers counters between different opposing Pokémon',()=>{
 const s=scene(),foe=s.sides.opponent;foe.active.damage=30;foe.bench=[{...mon('xy2-4','receiver'),benchSlot:0}];
 let q=cb(s,R('earInfluence'));q=pick(s,q,'active');q=pick(s,q,'bench',0);
 assert.equal(foe.active.damage,20);assert.equal(foe.bench[0].damage,10);assert.equal(q.kind,'option');
 choose(s,q,0);assert.equal(foe.active.damage,20);
});

test('XY2 completion: Barbaracle Rock Rush declares the physical discard subset before damage',{skip:!fixture},()=>{
 const s=scene(),ss=s.sides.player,attacker=ss.active;ss.hand=[ref('bw1-110','fight-one'),ref('bw1-110','fight-two'),ref('bw1-105','grass')];
 const eff=R('rockRush'),ctx={state:s,side:'player',foeSide:'opponent',attacker,defender:s.sides.opponent.active,cardById:id=>data.cardById(id),random:()=>.3,action:{effectSelection:'fight-one,fight-two'}};
 assert.equal(fx.choicesForEffect(eff,ctx).length,4);
 const result=fx.resolveAttack({name:'Rock Rush',damage:0,effect:eff},ctx);assert.equal(result.damage,60);
 cb(s,result.pendingEffects[0]);assert.deepEqual(ss.hand.map(r=>r.uid),['grass']);assert.deepEqual(ss.discard.map(r=>r.uid),['fight-one','fight-two']);
});

test('XY2 completion: Sneasel Flash Claw gives opponent ownership of the hand-discard choice',()=>{
 const s=scene(),ss=s.sides.opponent;ss.hand=[ref('xy2-4','pineco'),ref('xy2-5','seedot')];
 const q=cb(s,R('flashClaw'));assert.equal(q.kind,'handCard');assert.equal(q.side,'opponent');
 cb(s,q.effect,{resolvingChoice:true,action:{choiceHandIndex:1}});
 assert.deepEqual(ss.hand.map(r=>r.uid),['pineco']);assert.deepEqual(ss.discard.map(r=>r.uid),['seedot']);
});

test('XY2 completion: Goodra Gooey Regeneration discards selected special and Basic energy once per action',()=>{
 const s=scene(),ss=s.sides.player,slot=ss.active;slot.damage=120;slot.energy={Fire:1};slot.specialEnergy=[ref('bw8-127','plasma')];
 let q=cb(s,R('gooeyRegeneration'),{isAttack:false,isAbility:true});assert.equal(q.options.length,2);
 choose(s,q,1,{isAttack:false,isAbility:true});assert.equal(slot.damage,60);assert.equal(slot.specialEnergy.length,0);assert.equal(ss.discard[0].uid,'plasma');
 q=cb(s,R('gooeyRegeneration'),{isAttack:false,isAbility:true});choose(s,q,0,{isAttack:false,isAbility:true});
 assert.equal(slot.damage,0);assert.equal(slot.energy.Fire,0);assert.equal(ss.energyDiscard.Fire,1);
});

test('XY2 completion: Furret Buried Treasure Hunt chooses two physical cards from top four and discards the rest',()=>{
 const s=scene(),ss=s.sides.player;ss.deck=['one','two','three','four','five'].map(uid=>ref('xy2-4',uid));
 let q=cb(s,R('buriedTreasureHunt'));q=choose(s,q,3);choose(s,q,0);
 assert.deepEqual(ss.hand.map(r=>r.uid),['four','one']);assert.deepEqual(ss.discard.map(r=>r.uid),['two','three']);
 assert.deepEqual(ss.deck.map(r=>r.uid),['five']);
});

test('XY2 completion: Lopunny Big Jump returns whole stack, attachments and actual Basic Energy units',{skip:!fixture},()=>{
 const s=scene(),ss=s.sides.player;const slot=mon('xy2-85','lopunny');slot.stack=['xy2-84','xy2-85'];slot.energy.Fire=1;
 slot.tool=ref('xy2-95','cube');slot.specialEnergy=[ref('bw8-127','plasma')];ss.active=slot;
 cb(s,{type:'returnToHand',target:'self',returnBasicEnergy:true},{isAttack:false,isAbility:true});
 assert.equal(ss.active,null);
 const ids=ss.hand.map(r=>r.cardId);assert.ok(ids.includes('xy2-84')&&ids.includes('xy2-85')&&ids.includes('xy2-95')&&ids.includes('bw8-127'));
 assert.equal(ids.some(id=>['gym1-128','bw1-106'].includes(id)),true);
});

test('XY2 completion: real Milotic Ability flow keeps Prize resolution after all three Energy choices',{skip:!fixture},()=>{
 const s=scene(),ss=s.sides.player;ss.active=mon('xy2-23','milotic');
 s.rules={winMode:'prizes',prizeCount:2};s.sides.opponent.prizes=[ref('xy2-4','prize-one'),ref('xy2-5','prize-two')];
 ss.bench=[{...mon('xy2-29','floatzel'),benchSlot:0},{...mon('xy2-35','magnezone-ex'),benchSlot:1}];
 ss.energyDiscard.Fire=2;ss.discard=[ref('bw1-105','grass-unit')];
 const act=core.legalActions(s,'player').find(a=>a.type==='ability'&&a.cardId==='xy2-23');
 assert.ok(act,'Milotic ability is legal with three discarded Basic Energy and non-EX destination');
 core.applyAction(s,'player',act);assert.equal(s.choiceSide,'player');
 for(let i=0;i<3;i++){
  const options=core.legalActions(s,'player');assert.ok(options.length,'Milotic awaiting correct stage');
  core.applyAction(s,'player',options[0]);
  assert.equal(s.phase,'effectChoice','self-KO must not resolve before all attachments');
 }
 const last=core.legalActions(s,'player');assert.equal(last.length,1);
 core.applyAction(s,'player',last[0]);
 const dest=ss.bench.find(p=>p.uid==='floatzel');assert.equal((dest.energy.Grass||0)+(dest.energy.Fire||0),3);
 assert.equal(s.phase,'promote','self-KO resolves after all three attachments');
 assert.equal(ss.active,null);assert.equal(s.sides.opponent.prizesTaken,1);
});

test('XY2 completion: real Sneasel Flash Claw action requires the defending player to discard', {skip:!fixture},()=>{
 const s=scene();s.sides.player.active=mon('xy2-50','sneasel');s.sides.player.active.energy.Darkness=4;
 s.sides.opponent.active=mon('xy2-4','defender');
 s.sides.opponent.hand=[ref('xy2-4','hand-a'),ref('xy2-5','hand-b')];
 const action=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);
 assert.ok(action);core.applyAction(s,'player',action);
 assert.equal(s.phase,'effectChoice');assert.equal(s.choiceSide,'opponent');
 const opts=core.legalActions(s,'opponent');assert.equal(opts.length,2);
 core.applyAction(s,'opponent',opts[1]);
 assert.deepEqual(s.sides.opponent.discard.map(r=>r.uid),['hand-b']);
 assert.deepEqual(s.sides.opponent.hand.map(r=>r.uid),['hand-a']);
});
