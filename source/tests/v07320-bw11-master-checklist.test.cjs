'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const ref=(cardId,uid=cardId)=>({cardId,uid});
const slot=(id,uid=id)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],conditions:{},damage:0,locks:[],tool:null,benchSlot:null});
const board=()=>({active:slot('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,prizes:[],turnCount:4});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:1,rules:{benchSize:3},sides:{player:board(),opponent:board()},log:[]});
const R=key=>({type:'neoRule',rule:'bw11:'+key});
const mkctx=(s,options={})=>({state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,
  isAttack:true,random:()=>.1,action:{},resolvingChoice:false,cardById:id=>data.cardById(id),shuffle:()=>{},drawCard:()=>{},onEnergyAttached:()=>{},
  requestChoice:()=>{},...options});

test('BW11 Eternal Radiance redistributes actual counters and locks only that move for the following own turn',()=>{
  const s=scene(),a=s.sides.player.active,d=s.sides.opponent.active;a.cardId='bw11-RC10';a.damage=40;d.damage=20;
  fx.applyEffect(R('eternalRadiance'),mkctx(s,{cardById:id=>id==='bw11-RC10'?{id,kind:'pokemon',name:'Gardevoir',hp:140}:data.cardById(id)}));
  assert.equal(a.damage,0);assert.equal(d.damage,60);
  assert.equal(fx.isLocked(s,a,'attack','Eternal Radiance'),true);
  assert.equal(fx.isLocked(s,a,'attack','Psybeam'),false);
  s.turnNumber+=2;assert.equal(fx.isLocked(s,a,'attack','Eternal Radiance'),true);
  s.turnNumber++;assert.equal(fx.isLocked(s,a,'attack','Eternal Radiance'),false);
});

test('BW11 X Ball counts a physical multi-unit Special Energy, without summing every Rainbow type',()=>{
  const s=scene(),a=s.sides.player.active,d=s.sides.opponent.active;
  a.specialEnergy=[ref('audit-triple','three')];d.energy.Water=1;
  let ctx=mkctx(s,{cardById:id=>id==='audit-triple'?{id,effect:{provides:{Colorless:3}}}:data.cardById(id)});
  assert.equal(fx.resolveAttack({name:'X Ball',damage:0,cost:['C','C'],effect:R('xBall')},ctx).damage,80);
  a.specialEnergy=[ref('audit-rainbow','rainbow')];
  ctx=mkctx(s,{cardById:id=>id==='audit-rainbow'?{id,effect:{provides:{Grass:1,Water:1,Fire:1,Lightning:1}}}:data.cardById(id)});
  assert.equal(fx.resolveAttack({name:'X Ball',damage:0,cost:['C','C'],effect:R('xBall')},ctx).damage,40);
});

test('BW11 dynamic Energy counts follow Crystal Beach and conditional Special Energy rules from Core',()=>{
  const s=scene(),a=s.sides.player.active,d=s.sides.opponent.active;
  a.specialEnergy=[ref('bw11-113','dce')];d.energy.Water=1;
  const atk={name:'X Ball',damage:0,cost:['C','C'],effect:R('xBall')};
  const ctx=mkctx(s,{effectiveEnergy:p=>p===a?{Colorless:1}:p===d?{Water:1}:{}});
  assert.equal(fx.resolveAttack(atk,ctx).damage,40,'Crystal Beach must reduce DCE to one unit');
  ctx.effectiveEnergy=p=>p===a?{Miracle:3}:p===d?{Water:1}:{};
  assert.equal(fx.resolveAttack(atk,ctx).damage,80,'activated Scramble Energy must supply three units');
  const press={name:'Energy Press',damage:20,cost:['G','C'],effect:R('energyPress')};
  assert.equal(fx.resolveAttack(press,ctx).damage,40,'Energy Press must count effective units on the defender');
});

test('BW11 Altaria Cleave does not discard without two heads, and sends exact Special Energy UID to owner discard on success',()=>{
  const s=scene(),d=s.sides.opponent.active;d.energy.Fire=2;d.specialEnergy=[ref('bw10-91','plasma-01')];
  let r=fx.resolveAttack({name:'Cleave',damage:0,cost:['C'],effect:R('cleave')},mkctx(s,{random:()=>.9}));
  assert.equal(r.pendingEffects.length,0);assert.equal(d.energy.Fire,2);assert.equal(d.specialEnergy[0].uid,'plasma-01');
  r=fx.resolveAttack({name:'Cleave',damage:0,cost:['C'],effect:R('cleave')},mkctx(s,{random:()=>.1}));
  assert.equal(r.pendingEffects.length,1);
  fx.applyEffect(r.pendingEffects[0],mkctx(s));
  assert.equal(d.energy.Fire,0);assert.equal(d.specialEnergy.length,0);
  assert.equal(s.sides.opponent.energyDiscard.Fire,2);
  assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['plasma-01']);
});

test('BW11 Carnivine Ambush Bite only permits discard on heads, with a real option for multiple attached Energy sources',()=>{
  const s=scene(),d=s.sides.opponent.active;d.energy.Grass=1;d.specialEnergy=[ref('bw10-91','plasma')];
  const attack={name:'Ambush Bite',damage:20,cost:['G','C'],effect:R('ambushBite')};
  let r=fx.resolveAttack(attack,mkctx(s,{random:()=>.9}));
  assert.equal(r.damage,20);assert.equal(r.pendingEffects.length,0);
  r=fx.resolveAttack(attack,mkctx(s,{random:()=>.1}));assert.equal(r.damage,40);assert.equal(r.pendingEffects.length,1);
  let choice;
  fx.applyEffect(r.pendingEffects[0],mkctx(s,{requestChoice:v=>choice=v}));
  assert.equal(choice?.kind,'option');assert.equal(choice.options.length,2);
  fx.applyEffect(choice.effect,mkctx(s,{resolvingChoice:true,action:{choiceOption:1}}));
  assert.equal(d.energy.Grass,1);assert.equal(d.specialEnergy.length,0);
  assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['plasma']);
});

test('BW11 Energy Switch rejects Special Energy and moves one selected Basic unit only',()=>{
  const s=scene(),a=s.sides.player.active,b=slot('bw9-2','bench');b.benchSlot=0;s.sides.player.bench=[b];
  a.energy.Psychic=2;a.specialEnergy=[ref('bw11-113','dce')];
  let choice;
  fx.applyEffect(R('energySwitch'),mkctx(s,{requestChoice:v=>choice=v}));
  assert.equal(choice?.kind,'option');assert.equal(choice.options.length,1);
  fx.applyEffect(choice.effect,mkctx(s,{requestChoice:v=>choice=v,action:{choiceOption:0},resolvingChoice:true}));
  assert.equal(choice?.kind,'pokemon');
  fx.applyEffect(choice.effect,mkctx(s,{action:{choiceTarget:'bench',choiceBenchIndex:0},resolvingChoice:true}));
  assert.equal(a.energy.Psychic,1);assert.equal(b.energy.Psychic,1);assert.equal(a.specialEnergy[0].uid,'dce');
});

test('BW11 Garbotoxin suppresses a different Ability only while a Tool remains attached',()=>{
  const s=scene(),garb=slot('bw11-68','garb');garb.tool=ref('bw10-88','tool');s.sides.opponent.bench.push(garb);
  assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,id=>{
    if(id==='bw11-68')return {id,abilities:[{name:'Garbotoxin',printedPowerType:'ability',type:'passive'}]};
    return {id,abilities:[{name:'A',printedPowerType:'ability',type:'passive'}]};
  }),true);
  garb.tool=null;
  assert.equal(fx.abilitiesSuppressed(s,'player',s.sides.player.active,id=>({id,abilities:[]})),false);
});

test('BW11 Meloetta Brilliant Voice obeys immunity and replaces the previous exclusive Special Condition',()=>{
  const s=scene(),d=s.sides.opponent.active;
  d.conditions={sleep:true};
  fx.applyEffect(R('brilliantVoice'),mkctx(s,{random:()=>.9}));
  assert.equal(d.conditions.confusion,true);
  assert.equal(d.conditions.sleep,undefined);
  d.conditions={sleep:true};d.statusGuard={status:'confusion'};
  fx.applyEffect(R('brilliantVoice'),mkctx(s,{random:()=>.9}));
  assert.equal(d.conditions.sleep,true);
  assert.equal(d.conditions.confusion,undefined);
  assert.equal(s.log.filter(x=>x.reason==='Brilliant Voice').length,2);
});

test('BW11 Servine Wring Out applies paralysis only on heads, respects status immunity and never re-flips during Energy selection',()=>{
  const s=scene(),d=s.sides.opponent.active;d.energy.Water=2;d.specialEnergy=[ref('bw10-91','plasma')];
  let flips=0,choice;
  const context=opts=>mkctx(s,{random:()=>{flips++;return .1;},requestChoice:q=>{choice=q;},...opts});
  const at={name:'Wring Out',damage:30,effect:R('wringOut'),cost:['G']};
  const result=fx.resolveAttack(at,context());assert.equal(result.pendingEffects.length,1);assert.equal(flips,1);
  assert.equal(d.conditions.paralysis,undefined,'condition must wait until pending attack resolution');
  d.conditions={sleep:true};
  fx.applyEffect(result.pendingEffects[0],context());
  assert.ok(d.conditions.paralysis);assert.equal(d.conditions.sleep,undefined);
  assert.equal(choice?.kind,'option');
  fx.applyEffect(choice.effect,context({resolvingChoice:true,action:{choiceOption:1}}));
  assert.equal(flips,1);assert.equal(d.energy.Water,2);assert.equal(d.specialEnergy.length,0);
  d.statusGuard={status:'paralysis'};d.conditions={sleep:true};
  fx.applyEffect(R('wringOut'),context());
  assert.equal(d.conditions.sleep,true);assert.equal(d.conditions.paralysis,undefined);
});

test('BW11 RC19 Echoed Voice adds 50 only to the following own-turn use',()=>{
  const s=scene(),a=s.sides.player.active;
  fx.applyEffect(R('echoedVoice'),mkctx(s));
  assert.equal(a.bw11EchoedVoiceUntil,9);
  s.turnNumber=9;
  assert.equal(fx.resolveAttack({name:'Echoed Voice',damage:50,cost:['C'],effect:R('echoedVoice')},mkctx(s)).damage,100);
  s.turnNumber=10;
  assert.equal(fx.resolveAttack({name:'Echoed Voice',damage:50,cost:['C'],effect:R('echoedVoice')},mkctx(s)).damage,50);
});

test('BW11 Phione Aqua Boomerang preserves actual Tool and Special Energy identities when bouncing self to hand',()=>{
  const s=scene(),a=s.sides.player.active;
  a.cardId='bw11-36';a.stack=['bw11-36'];a.tool=ref('bw10-88','tool-unique');a.specialEnergy=[ref('bw11-113','dce-unique')];a.energy.Grass=1;
  s.sides.player.handLimit=8;
  fx.applyEffect(R('aquaBoomerang'),mkctx(s,{cardById:id=>id==='bw11-36'?{id,name:'Phione',kind:'pokemon'}:data.cardById(id)}));
  assert.equal(s.sides.player.active,null);
  assert.ok(s.sides.player.hand.some(r=>r.uid==='tool-unique'));
  assert.ok(s.sides.player.hand.some(r=>r.uid==='dce-unique'));
  assert.ok(s.sides.player.hand.some(r=>r.cardId==='bw11-36'));
});

test('BW11 official generated source enables the printed Relaxed Roll and Echoed Voice RC cards',{
  skip:!require('node:fs').existsSync(path.resolve(__dirname,'../data/classic/bw11-print-compact.json'))},()=>{
  const set=require(path.join(assets,'tcg-classic-legendary-treasures.js'));
  for(const n of ['RC17','RC19']){
    const c=set.cardById('bw11-'+n);
    assert.ok(c?.battleEnabled,n+' unexpectedly gated');
    for(const a of c.attacks)assert.notEqual(a.effect?.type,'unsupported',n+':'+a.name);
  }
});

test('BW11 real-source CPU builder produces legal, owned single-set decks without gated cards', {
  skip:!require('node:fs').existsSync(path.resolve(__dirname,'../data/classic/bw11-print-compact.json'))},()=>{
  const cards=require(path.join(assets,'tcg-classic-legendary-treasures.js')).CARDS;
  const builder=require(path.join(assets,'tcg-classic-deck-builder.js'));
  const decks=require(path.join(assets,'tcg-classic-decks.js'));
  const rows=cards.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
  for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Colorless']){
    const r=builder.buildDeck(rows,{sets:['bw11'],types:[type],style:'competitive'});
    assert.equal(r.ok,true,type+': '+(r.errors||[]).join('; '));
    assert.equal(r.cards.length,30,type);
    assert.ok(r.cards.every(id=>data.cardById(id)?.battleEnabled&&data.cardById(id)?.setId==='bw11'),type+' gated/off-set');
    assert.ok(data.validateDeck(r.cards).ok,type+' deck validator');
    assert.ok(decks.validateDraft(r.cards,rows,{requireFull:true}).ok,type+' owned-card validator');
    assert.equal(r.cards.filter(id=>data.cardById(id)?.aceSpec).length<=1,true,type+' ACE SPEC cap');
  }
});
