'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const fx=require(path.join(asset,'tcgp-battle-effects.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const builder=require(path.join(asset,'tcg-classic-deck-builder.js'));
const picker=require(path.join(asset,'tcg-classic-set-picker.js'));
const opponents=require(path.join(asset,'tcg-classic-opponents.js'));
const flash=require(path.join(asset,'tcg-classic-flashfire.js'));
const main=path.join(root,'data/classic/xy2-print-compact.json'),hasSource=fs.existsSync(main);
const ref=(cardId,uid=cardId)=>({cardId,uid});
const mon=(id,uid=id)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,locks:[]});
const side=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:3,energyTypes:['Fire'],prizes:[ref('bw9-1')],prizesTaken:0});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:9,sides:{player:side(),opponent:side()},log:[],rngState:1});
const R=k=>({type:'neoRule',rule:'xy2:'+k});
function context(s){let choice;const c={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,
 defender:s.sides.opponent.active,cardById:id=>data.cardById(id),isAttack:true,action:{},resolvingChoice:false,
 random:()=>.1,requestChoice:x=>choice=x,shuffle:()=>{},drawCard:board=>{if(board.deck.length)board.hand.push(board.deck.shift());}};
 return {ctx:c,choice:()=>choice};}
function effect(s,e,options={}){const c=context(s);Object.assign(c.ctx,options);fx.applyEffect(e,c.ctx);return c.choice();}
function option(s,q,i){return effect(s,q.effect,{resolvingChoice:true,action:{choiceOption:i}});}
function pokemon(s,q,side='player',benchIndex=0){return effect(s,q.effect,{resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:benchIndex}});}

test('Flashfire is registered in all Classic selectors and build metadata',()=>{
 assert.ok(data.SETS.some(x=>x.id==='xy2'));assert.ok(builder.SET_IDS.includes('xy2'));
 assert.ok(opponents.SETS.includes('xy2'));assert.ok(picker.names.xy2==='Flashfire');
 assert.equal(flash.SET.cardCount,109);assert.equal(flash.SET.printedTotal,110);
 assert.equal(data.coverage().flashfire.printed,flash.coverage().printed);
 const gradle=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8');
 const boot=fs.readFileSync(path.join(asset,'app-v0167.js'),'utf8');
 const html=fs.readFileSync(path.join(asset,'index.html'),'utf8');
 const version=gradle.match(/versionName '(0\.69\.\d+)'/)?.[1];assert.match(version||'',/^0\.69\.\d+$/);
 assert.ok(boot.includes(`window.__LUCKYDEX_BUILD='${version}'`));
 assert.ok(html.includes(`v${version}`));
 assert.ok(html.indexOf('tcg-classic-flashfire.js')<html.indexOf('tcg-classic-battle-data.js'));
});

test('Flashfire preserves all 110 official rows, including unique Blacksmith 88a', {skip:!hasSource},()=>{
 const rows=JSON.parse(fs.readFileSync(main,'utf8'));
 assert.equal(rows.length,110);assert.equal(flash.CARDS.length,110);
 assert.equal(rows.reduce((n,r)=>n+r[7].length,0),153);
 assert.equal(rows.reduce((n,r)=>n+r[8].length,0),13);
 assert.deepEqual(rows.map(r=>String(r[0])),[...Array.from({length:88},(_,i)=>String(i+1)),'88a',...Array.from({length:21},(_,i)=>String(i+89))]);
 assert.equal(flash.cardById('xy2-88')?.name,'Blacksmith');
 assert.equal(flash.cardById('xy2-88a')?.name,'Blacksmith');
 assert.notEqual(flash.cardById('xy2-88'),flash.cardById('xy2-88a'));
 for(const [i,c] of flash.CARDS.entries()){
  assert.equal(c.name,rows[i][1],c.id);assert.equal(data.cardById(c.id),c);
  assert.equal(c.attacks?.length||0,rows[i][7].length,c.id);
  if(c.battleEnabled){assert.equal(c.deckEligible,true,c.id);
   for(const a of c.attacks||[]){assert.notEqual(a.effect?.type,'unsupported',c.id+':'+a.name);
     assert.deepEqual(fx.validateEffect(a.effect),[],c.id+':'+a.name);}
   for(const ab of c.abilities||[])assert.deepEqual(fx.validateEffect(ab.effect),[],c.id+':'+ab.name);
   if(c.kind==='trainer')assert.deepEqual(fx.validateEffect(c.effect),[],c.id+':'+c.name);
  }
 }
 for(const n of ['13','69','79','107','108','109']){
  const c=flash.cardById('xy2-'+n);assert.equal(c.megaEvolution,true,c.id);
  assert.equal(c.stage,'Stage 1');assert.equal(c.prizeCards,2);
 }
 for(const n of ['95','98'])assert.equal(flash.cardById('xy2-'+n).battleEnabled,true,`XY2 ${n}`);
});

test('Pyroar Intimidating Mane prevents Basic damage but not evolved damage',()=>{
 const s=scene(),def=s.sides.opponent.active,atk=s.sides.player.active;
 def.cardId='xy2-20';atk.cardId='bw9-1';
 assert.equal(fx.attackIsPrevented(s,'opponent',def,atk,id=>data.cardById(id))?.reason,'Intimidating Mane');
 atk.cardId='bw9-2';
 assert.notEqual(fx.attackIsPrevented(s,'opponent',def,atk,id=>data.cardById(id))?.reason,'Intimidating Mane');
});

test('Magnetic Storm removes Resistance on both sides while attached to Stadium zone',()=>{
 const s=scene(),atk=s.sides.player.active,def=s.sides.opponent.active;
 const lookup=id=>id==='audit-xy2-a'?{id,kind:'pokemon',name:'Test Attacker',types:['Fighting'],hp:90,stage:'Basic'}:
 id==='audit-xy2-d'?{id,kind:'pokemon',name:'Test Defender',types:['Metal'],hp:90,stage:'Basic',resistance:'Fighting',resistanceValue:'-20'}:data.cardById(id);
 atk.cardId='audit-xy2-a';def.cardId='audit-xy2-d';
 const before=fx.attackDamageWithState(s,'player',atk,'opponent',def,50,lookup);
 s.stadium=ref('xy2-91','magnetic');const after=fx.attackDamageWithState(s,'player',atk,'opponent',def,50,lookup);
 assert.equal(after-before,20);
});

test('Blacksmith attaches exactly two discarded Fire Energy from ledger to a Fire Pokemon',()=>{
 const s=scene(),p=s.sides.player;p.energyDiscard.Fire=2;p.active.cardId='base1-4';
 let q=effect(s,R('blacksmith'));
 assert.equal(q.kind,'option');
 q=option(s,q,0);assert.equal(q.kind,'pokemon');
 q=effect(s,q.effect,{resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(q.kind,'option');q=option(s,q,0);
 effect(s,q.effect,{resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(p.active.energy.Fire,2);assert.equal(p.energyDiscard.Fire,0);
});

test('Startling Megaphone removes all opponent physical Tools but leaves own Tools untouched',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active.tool=ref('xy1-119','own');o.active.tool=ref('xy1-121','their-a');
 o.bench.push({...mon('bw9-1','their-bench'),tool:ref('xy1-119','their-b')});
 effect(s,R('megaphone'));
 assert.equal(p.active.tool.uid,'own');assert.equal(o.active.tool,null);
 assert.equal(o.bench[0].tool,null);assert.deepEqual(o.discard.map(x=>x.uid),['their-a','their-b']);
});

test('Pokémon Center Lady chooses a damaged Bench target and removes all statuses',()=>{
 const s=scene(),p=s.sides.player;const b=mon('xy2-8','heal-me');b.damage=80;b.conditions={poison:true,confusion:true};b.benchSlot=0;p.bench=[b];
 const q=effect(s,R('pokemonCenterLady'));assert.equal(q.kind,'pokemon');pokemon(s,q);
 assert.equal(b.damage,20);assert.deepEqual(b.conditions,{});
});

test('Toxicroak-EX Triple Poison carries its printed 30-per-checkup status amount',()=>{
 const s=scene();effect(s,R('triplePoison'));
 assert.deepEqual(s.sides.opponent.active.conditions.poison,{amount:30});
});

test('Trick Shovel preserves UID when keeping the opponent top card, discards exactly when selected',()=>{
 const s=scene();s.sides.opponent.deck=[ref('bw9-1','head'),ref('bw9-2','next')];
 let q=effect(s,R('trickShovel'));assert.equal(q.kind,'option');
 q=option(s,q,1);assert.equal(q.kind,'option');assert.ok(q.options[1].includes('Discard'));
 option(s,q,1);assert.deepEqual(s.sides.opponent.deck.map(x=>x.uid),['next']);
 assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['head']);
});

test('Flashfire-only deck recovery never changes other set-selection or invents owned cards',()=>{
 assert.equal(builder.rescueXY2Deck([],{sets:['xy1'],types:['Fire']}),null);
 assert.equal(builder.rescueXY2Deck([],{sets:['xy2'],types:['Fire']}),null);
});

test('Every enabled Flashfire attack and Trainer declares a validated effect and supported runtime rule', {skip:!hasSource},()=>{
 const implemented=new Set(['psychic','derangedDance','electricounter','bigTusk','flail','ironCrash','wonderBlast',
  'revenge','powerfulFriends','strongGust','peckOff','triplePoison','blacksmith','fieryTorch','palPad',
  'pokemonCenterLady','megaphone','trickShovel','ultraBall','sacredAsh','stoke','callForFamily1','callForFamily2','sneakyPlacement','quiverDance','opponentDiscardEnergy',
  'adaptiveEvolution','flowerVeil','poisonBarrier','stirAndSnooze','thornTempest','chipOff','excitingShake','pricklyNeedles','harden',
  'intimidatingMane','leafDraw','whiplash','scorchingFang','counterattackQuills','energyGrace','heartWink','rescue',
  'fangSnipe','revival','cursedDrop','shadowVoid','painPellets','earInfluence','rockRush',
  'flashClaw','gooeyRegeneration','buriedTreasureHunt']);
 for(const c of flash.CARDS.filter(c=>c.battleEnabled)){
  for(const eff of [...(c.attacks||[]).map(a=>a.effect),...(c.abilities||[]).map(a=>a.effect),...(c.kind==='trainer'?[c.effect]:[])]){
   function walk(e){if(!e)return;
    if(e.type==='neoRule'&&e.rule.startsWith('xy2:'))assert.ok(implemented.has(e.rule.slice(4)),c.id+':'+e.rule);
    for(const key of ['effects'])for(const x of Array.isArray(e[key])?e[key]:[])walk(x);
    for(const key of ['heads','tails'])if(e[key])walk(e[key]);
   }walk(eff);
  }
 }
});

test('Flashfire Mega Charizard evolves from matching Charizard-EX and immediately ends the turn',{skip:!hasSource},()=>{
 const core=require(path.join(asset,'tcgp-battle-core.js'));
 const s=scene(),p=s.sides.player;p.active=core.makePokemonSlot('xy2-11',1,'flashfire-charizard');
 p.active.playedOnSideTurn=1;p.hand=[ref('xy2-13','mega-from-hand')];
 const move=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='xy2-13');
 assert.ok(move,'Mega Charizard must be a real evolution, not a standalone Basic');
 core.applyAction(s,'player',move);
 assert.equal(p.active.cardId,'xy2-13');
 assert.notEqual(s.activeSide,'player','Mega evolution must end its own turn');
});

test('Flashfire CPU rescue constructs only owned 30-card legal on-type lines',{skip:!hasSource},()=>{
 const rows=flash.CARDS.filter(c=>c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 const decks=require(path.join(asset,'tcg-classic-decks.js'));
 let valid=0;
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless']){
  const found=builder.rescueXY2Deck(rows,{sets:['xy2'],types:[type]});if(!found)continue;valid++;
  assert.equal(found.cards.length,30,type);assert.equal(data.validateDeck(found.cards).ok,true,type);
  assert.equal(decks.validateDraft(found.cards,rows,{requireFull:true}).ok,true,type);
  assert.ok(found.cards.every(id=>data.cardById(id)?.setId==='xy2'),type);
  const roster=found.cards.map(id=>data.cardById(id)).filter(c=>c.kind==='pokemon');
  for(const c of roster.filter(c=>c.stage!=='Basic'))assert.ok(roster.some(p=>p.name===c.evolvesFrom),`${type}: missing prerequisite for ${c.name}`);
 }
 assert.ok(valid>=1,'At least one XY2-only, legally owned family deck must be buildable');
});

test('Fiery Torch discards the selected physical Fire Energy before drawing two',()=>{
 const s=scene(),p=s.sides.player;
 p.hand=[ref('test-fire','fire-physical'),ref('bw9-1','keep')];
 p.deck=[ref('bw9-2','draw-a'),ref('bw9-3','draw-b')];
 const byId=id=>id==='test-fire'?{id,kind:'energy',basicEnergy:true,energyType:'Fire',name:'Fire Energy'}:data.cardById(id);
 let q=effect(s,R('fieryTorch'),{cardById:byId});assert.equal(q.kind,'option');
 effect(s,q.effect,{cardById:byId,resolvingChoice:true,action:{choiceOption:0}});
 assert.deepEqual(p.discard.map(r=>r.uid),['fire-physical']);
 assert.deepEqual(p.hand.map(r=>r.uid),['keep','draw-a','draw-b']);
});

test('Call for Family benches exact chosen Basic from deck without changing other refs',()=>{
 const s=scene(),p=s.sides.player;p.benchLimit=3;p.deck=[ref('base1-26','basic-uid'),ref('base1-98','energy-uid')];
 const benchCard=(owner,r)=>{const newMon=mon(r.cardId,r.uid);newMon.benchSlot=owner.bench.length;owner.bench.push(newMon);return newMon.benchSlot;};
 let q=effect(s,R('callForFamily1'),{benchCard});assert.equal(q.kind,'option');assert.ok(q.options[0].includes('Bench'));
 effect(s,q.effect,{resolvingChoice:true,action:{choiceOption:0},benchCard});
 assert.deepEqual(p.bench.map(x=>x.uid),['basic-uid']);assert.deepEqual(p.deck.map(x=>x.uid),['energy-uid']);
});


test('Stoke takes three real Energy Zone units, and Quiver Dance heals only after attachment',()=>{
 const s=scene(),p=s.sides.player;
 p.energySupply=['Fire','Fire','Fire','Grass'];p.active.cardId='xy2-11';
 let q=effect(s,R('stoke'));assert.equal(q.kind,'option');
 q=option(s,q,0);assert.equal(q.kind,'option');
 q=option(s,q,0);assert.equal(q.kind,'option');
 option(s,q,0);
 assert.equal(p.active.energy.Fire,3);assert.deepEqual(p.energySupply,['Grass']);
 p.active.damage=60;
 q=effect(s,R('quiverDance'));assert.equal(q.kind,'option');
 option(s,q,0);
 assert.equal(p.active.energy.Grass,1);assert.equal(p.active.damage,20);
 assert.equal(p.energySupply.length,0);
});
