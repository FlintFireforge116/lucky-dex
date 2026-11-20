'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const deck=require(path.join(asset,'tcg-classic-decks.js'));
const builder=require(path.join(asset,'tcg-classic-deck-builder.js'));
const core=require(path.join(asset,'tcgp-battle-core.js'));
const set=require(path.join(asset,'tcg-classic-xy-base.js'));
const ref=(cardId,uid=cardId)=>({cardId,uid});
const mon=(id,uid=id)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,locks:[]});
const side=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:3,energyTypes:['Grass'],nextEnergyType:'Grass',prizes:[ref('bw9-1')],prizesTaken:0});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rules:{benchSize:3},sides:{player:side(),opponent:side()},log:[],rngState:1});
const R=(name,extra={})=>({type:'neoRule',rule:'xy1:'+name,...extra});
function ctx(s,opts={}){let chosen;
 const context={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:id=>data.cardById(id),
   isAttack:true,action:{},resolvingChoice:false,random:()=>.1,requestChoice:v=>chosen=v,shuffle:()=>{},drawCard:()=>{},onEnergyAttached:()=>{},...opts};
 return {context,choice:()=>chosen};
}
function fire(s,e,opts={}){const c=ctx(s,opts);fx.applyEffect(e,c.context);return c.choice();}
function addBench(s,owner,id,uid){const p=mon(id,uid),b=s.sides[owner];p.benchSlot=b.bench.length;b.bench.push(p);return p;}

test('XY Base registers Fairy as real Basic Energy and exposes Mega set metadata',()=>{
 assert.equal(fx.ENERGY_CODE.Y,'Fairy');assert.ok(deck.ENERGY_TYPES.includes('Fairy'));
 assert.ok(builder.SET_IDS.includes('xy1'));assert.ok(data.SETS.some(x=>x.id==='xy1'));
 assert.equal(set.SET.cardCount,146);assert.equal(data.ENERGY_CODE.Fairy,'Y');
});

test('XY core Mega Evolution ends the own turn after hand evolution (not just a description)',{skip:!fs.existsSync(path.join(root,'data/classic/xy1-print-compact.json'))},()=>{
 const s=scene(),p=s.sides.player;p.active=core.makePokemonSlot('xy1-1',1,'venusaur-ex');p.active.playedOnSideTurn=1;
 p.hand=[ref('xy1-2','mega-from-hand')];
 const evolve=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='xy1-2');
 assert.ok(evolve,'Mega must be an evolution of Venusaur-EX from hand');core.applyAction(s,'player',evolve);
 assert.equal(p.active.cardId,'xy1-2');assert.ok(s.log.some(x=>x.type==='megaEvolutionEndTurn'));
 assert.notEqual(s.activeSide,'player','Mega evolution ends the player turn');
});

test('XY base source conserves all 146 official numbered prints and printed attack/Ability counts', {skip:!fs.existsSync(path.join(root,'data/classic/xy1-print-compact.json'))},()=>{
 const src=JSON.parse(fs.readFileSync(path.join(root,'data/classic/xy1-print-compact.json'),'utf8'));
 assert.equal(src.length,146);assert.equal(set.CARDS.length,146);
 assert.deepEqual(set.CARDS.map(x=>x.number),Array.from({length:146},(_,i)=>String(i+1)));
 assert.equal(src.reduce((n,r)=>n+r[7].length,0),202);
 assert.equal(src.reduce((n,r)=>n+r[8].length,0),12);
 assert.equal(data.coverage().xyBase.printed,146);
 assert.equal(set.cardById('xy1-140').energyType,'Fairy');
 assert.equal(set.cardById('xy1-140').basicEnergy,true);
 assert.deepEqual(set.cardById('xy1-130').effect.provides,{Colorless:2});
 assert.equal(set.cardById('xy1-131').specialEnergy,true);
 for(const id of ['xy1-2','xy1-30']){
  const c=set.cardById(id);assert.equal(c.megaEvolution,true);assert.equal(c.stage,'Stage 1');assert.equal(c.prizeCards,2);
 }
 for(const [i,c] of set.CARDS.entries()){
  assert.equal(c.name,src[i][1],c.id);assert.equal(data.cardById(c.id),c);
  assert.equal(c.attacks?.length||0,src[i][7].length,c.id);
  if(c.battleEnabled){assert.equal(c.deckEligible,true);for(const a of c.attacks||[]){
   assert.notEqual(a.effect?.type,'unsupported',c.id+':'+a.name);
   assert.deepEqual(fx.validateEffect(a.effect),[],c.id+':'+a.name);
  }for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],c.id+':'+ab.name);
   if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id+':trainer');
  }
 }
});

test('Hard Charm and Fur Coat reduce post-matchup attack damage; Muscle Band only boosts opposing Active',()=>{
 const s=scene(),p=s.sides.player.active,o=s.sides.opponent.active;
 p.cardId='bw9-1';o.cardId='bw9-1';o.tool=ref('xy1-119','hard-charm');
 const lookup=id=>id==='xy1-119'?{id,name:'Hard Charm',kind:'trainer'}:id==='xy1-121'?{id,name:'Muscle Band',kind:'trainer'}:
 id==='xy1-114'?{id,kind:'pokemon',types:['Colorless'],hp:100,abilities:[{name:'Fur Coat',type:'passive'}]}:data.cardById(id);
 assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',o,60,lookup),40);
 o.cardId='xy1-114';assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',o,60,lookup),20);
 p.tool=ref('xy1-121','muscle');assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',o,60,lookup),40);
});

test('Shadow Circle removes Weakness only when defending Pokemon has Darkness Energy',()=>{
 const s=scene(),p=s.sides.player.active,o=s.sides.opponent.active;s.stadium=ref('xy1-126','shadow');
 const cardById=id=>id==='audit-attacker'?{id,kind:'pokemon',types:['Fighting'],hp:90}:id==='audit-defender'?{id,kind:'pokemon',types:['Darkness'],weakness:'Fighting',weaknessValue:'×2',hp:90}:data.cardById(id);
 p.cardId='audit-attacker';o.cardId='audit-defender';o.energy.Darkness=1;
 assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',o,30,cardById),30);
 o.energy.Darkness=0;assert.equal(fx.attackDamageWithState(s,'player',p,'opponent',o,30,cardById),60);
});

test('Great Ball selects only a Pokemon from top seven and preserves physical UID',()=>{
 const s=scene(),p=s.sides.player;p.deck=[ref('bw9-1','not-a-pokemon'),ref('bw11-113','special'),ref('bw9-2','eligible'),...Array.from({length:6},(_,i)=>ref('bw9-1','a'+i))];
 // Exact source-dependent metadata is not needed for old BW cards.
 const q=fire(s,R('greatBall'));assert.equal(q.kind,'option');assert.equal(q.options.length,7);
 // Choose a known Pokemon; its UID must leave deck and enter hand.
 const pick=1;assert.ok(q.options[1].startsWith('Take '));
 assert.ok(pick>=0);fire(s,q.effect,{resolvingChoice:true,action:{choiceOption:pick}});
 assert.ok(p.hand.some(r=>r.uid==='eligible'));assert.ok(!p.deck.some(r=>r.uid==='eligible'));
});

test('Team Flare Grunt selects exact Energy; source owners retain their discard',()=>{
 const s=scene(),o=s.sides.opponent;o.active.energy.Fire=2;o.active.specialEnergy=[ref('bw11-113','dce-a')];
 let q=fire(s,R('teamFlareGrunt'));assert.equal(q?.kind,'option');assert.equal(q.options.length,2);
 const i=q.options.findIndex(x=>x.includes('bw11-113')||x.includes('Double Colorless'));
 assert.ok(i>=0);fire(s,q.effect,{resolvingChoice:true,action:{choiceOption:i}});
 assert.equal(o.active.energy.Fire,2);assert.equal(o.active.specialEnergy.length,0);
 assert.deepEqual(o.discard.map(x=>x.uid),['dce-a']);
});

test('Fairy Transfer moves the selected physical Fairy Energy without duplicating or discarding',()=>{
 const s=scene(),p=s.sides.player,a=p.active,b=addBench(s,'player','bw9-2','bench-fairy');
 a.energy.Fairy=2;
 let q=fire(s,R('fairyTransfer'));assert.equal(q.kind,'option');assert.ok(q.options.length>=2);
 q=fire(s,q.effect,{resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(q.kind,'pokemon');fire(s,q.effect,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(a.energy.Fairy,1);assert.equal(b.energy.Fairy,1);assert.equal(p.discard.length,0);
});

test('Greninja Water Shuriken discards the chosen physical Water Energy and damages the chosen Bench target',()=>{
 const s=scene(),o=addBench(s,'opponent','bw9-2','opponent-bench');s.sides.player.hand=[ref('xy1-134','water-energy-uid')];
 const lookup=id=>id==='xy1-134'?{id,basicEnergy:true,energyType:'Water',subtype:'Water',name:'Water Energy'}:data.cardById(id);
 let q=fire(s,R('waterShuriken'),{cardById:lookup});assert.equal(q?.kind,'option');
 q=fire(s,q.effect,{cardById:lookup,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(q?.kind,'pokemon');assert.equal(q.selectionSide,'opponent');
 fire(s,q.effect,{cardById:lookup,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(o.damage,30);assert.ok(s.sides.player.discard.some(r=>r.uid==='water-energy-uid'));
 assert.equal(s.sides.player.hand.length,0);
});

test('Sweet Veil protects only Pokemon with Fairy Energy, and respects suppression',()=>{
 const s=scene(),p=s.sides.player;
 addBench(s,'player','xy1-95','slurpuff');
 const holder=p.active;holder.energy.Fairy=1;
 const byId=id=>id==='xy1-95'?{id,kind:'pokemon',abilities:[{name:'Sweet Veil',type:'passive'}]}:data.cardById(id);
 assert.equal(fx.statusIsPrevented(s,holder,byId,'poison'),true);
 holder.energy.Fairy=0;assert.equal(fx.statusIsPrevented(s,holder,byId,'poison'),false);
});

test('XY next-own-turn Metal Wallop doubles only the next usage, without infinite bonus',()=>{
 const s=scene(),a=s.sides.player.active,c=ctx(s).context;
 const at={name:'Metal Wallop',damage:40,cost:['M','C'],effect:R('metalWallop')};
 assert.equal(fx.resolveAttack(at,c).damage,40);
 fx.applyEffect(R('metalWallop'),c);s.turnNumber=9;
 assert.equal(fx.resolveAttack(at,ctx(s).context).damage,80);
 s.turnNumber=10;assert.equal(fx.resolveAttack(at,ctx(s).context).damage,40);
});

test('XY-only rescue never creates unowned or disabled cards; no cross-set override',()=>{
 assert.equal(builder.rescueXY1Deck([],{sets:['bw11'],types:['Grass']}),null);
 assert.equal(builder.rescueXY1Deck([],{sets:['xy1'],types:['Grass']}),null);
});

test('XY-only legal CPU recovery preserves 30 cards, actual ownership and Fairy Energy', {skip:!fs.existsSync(path.join(root,'data/classic/xy1-print-compact.json'))},()=>{
 const rows=set.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 let any=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless']){
  const b=builder.rescueXY1Deck(rows,{sets:['xy1'],types:[type]});
  if(!b)continue;
  any++;
  assert.equal(b.cards.length,30,type);assert.equal(data.validateDeck(b.cards).ok,true,type);
  assert.equal(deck.validateDraft(b.cards,rows,{requireFull:true}).ok,true,type);
  assert.ok(b.cards.every(id=>data.cardById(id)?.setId==='xy1'),type);
  // Every included evolution has its matching parent in the same deck;
  // Basics with evolution dependencies are only included as complete lines.
  const pokemon=b.cards.map(id=>data.cardById(id)).filter(c=>c?.kind==='pokemon');
  for(const mon of pokemon){
   if(mon.stage==='Basic')continue;
   assert.ok(pokemon.some(parent=>parent.name===mon.evolvesFrom),`${type}: orphan ${mon.name}`);
  }
  for(const mon of pokemon.filter(c=>c.stage==='Basic')){
   const descendants=set.CARDS.filter(c=>c.battleEnabled&&c.evolvesFrom===mon.name);
   if(descendants.length)assert.ok(pokemon.some(x=>descendants.some(d=>d.id===x.id)),`${type}: unpaired ${mon.name}`);
  }

  if(type==='Fairy')assert.equal(b.energyTypes.includes('Fairy'),true,type);
 }
 assert.ok(any>=4,'at least four types should have fully owned, legal single-set rescues');
});
