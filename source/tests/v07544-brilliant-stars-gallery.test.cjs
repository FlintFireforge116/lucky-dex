'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core.js'),data=require('../app/src/main/assets/tcg-classic-battle-data.js'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const slot=(cardId,uid,energy={})=>({cardId,uid,stack:[cardId],damage:0,energy,specialEnergy:[],conditions:{},tool:null,extraTools:[],playedOnSideTurn:1});
const ref=(cardId,uid)=>({cardId,uid});
let baseBattle;
function setup(side='player',id='sm12-4'){
 const old=data.cardById,dummy={id:'sm6-dummy',name:'Test target',kind:'pokemon',stage:'Basic',hp:1000,types:['Colorless'],subtype:'Colorless',retreat:1,battleEnabled:true,deckEligible:true,attacks:[{name:'Tap',cost:[],damage:10,effect:{type:'noop'}}],abilities:[]};data.cardById=x=>x===dummy.id?dummy:old(x);
 const s=structuredClone(baseBattle||(baseBattle=core.createBattle({format:'classic',playerDeck:data.CLASSIC30_LOANER_DECK,opponentDeck:data.CLASSIC30_LOANER_DECK,seed:32132,firstSide:'player',playerEnergyTypes:['Psychic','Fighting'],opponentEnergyTypes:['Psychic','Fighting']})));s.phase='battle';s.activeSide=side;s.turnNumber=7;
 const foe=side==='player'?'opponent':'player';
 for(const name of ['player','opponent']){let b=s.sides[name];b.turnCount=4;b.hand=[];b.deck=Array.from({length:15},(_,i)=>ref('sm6-1',name+'d'+i));b.prizes=Array.from({length:5},(_,i)=>ref('sm6-1',name+'p'+i));b.discard=[];b.energyDiscard={};b.energySupply=['Psychic','Fighting','Psychic'];b.active=slot(name===side?id:dummy.id,name+'a',{Grass:3,Psychic:3,Fighting:3,Metal:3,Colorless:3});b.bench=[slot(dummy.id,name+'b')];b.bench[0].benchSlot=0;}
 return {s,side,foe,us:s.sides[side],them:s.sides[foe],done:()=>data.cardById=old};
}
function use(h,type,find=()=>true){const a=core.legalActions(h.s,h.s.choiceSide||h.side).find(x=>x.type===type&&find(x));assert.ok(a,`${type}: ${JSON.stringify(core.legalActions(h.s,h.s.choiceSide||h.side))}`);core.applyAction(h.s,h.s.choiceSide||h.side,a);return a;}
function attack(h,name){const idx=data.cardById(h.us.active.cardId).attacks.findIndex(a=>a.name===name);return use(h,'attack',a=>a.attackIndex===idx);}
function choice(h,pred){return use(h,'effectChoice',pred);}
function trainer(h,id){h.us.hand.push(ref(id,'trainer'));return use(h,'trainer',a=>a.cardId===id);}
const allEnergy=Object.fromEntries(['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy','Colorless'].map(t=>[t,5]));

function resolve(h,selector=a=>!a.choiceSkip){let n=0;while(h.s.phase==='effectChoice'&&n++<100){const who=h.s.choiceSide||h.side,choices=core.legalActions(h.s,who).filter(x=>x.type==='effectChoice');assert.ok(choices.length);core.applyAction(h.s,who,choices.find(selector)||choices[0]);}assert.notEqual(h.s.phase,'effectChoice');}
const gallery=data.CARDS.filter(c=>c.setId==='swsh9tg'),builder=require('../app/src/main/assets/tcg-classic-deck-builder.js'),cpu=require('../app/src/main/assets/tcg-classic-opponents.js');
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const packet=fs.readFileSync(path.join(__dirname,'../data/classic/swsh9tg-print-compact.jsonl'));
const rows=packet.toString('utf8').trimEnd().split('\n').map(JSON.parse);
test('Trainer Gallery: exact pinned 30 print metadata and reprint equivalence',()=>{
 assert.equal(crypto.createHash('sha256').update(packet).digest('hex'),'aad1f259b4762489274ea9bda264585a5714b08e1049481a91f0ce0945212dd0');
 assert.equal(rows.length,30);assert.equal(gallery.length,30);assert.equal(new Set(gallery.map(c=>c.id)).size,30);
 const omit=['id','setId','number','rarity','image','imageLarge','reprintOf'];
 const mechanics=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!omit.includes(k)));
 for(const row of rows){const [n,name,sup,subs,hp,types,evolves,attacks,abilities,weak,res,retreat,rarity,rules]=row,c=data.cardById('swsh9tg-'+n);assert.ok(c);assert.ok(c.battleEnabled&&c.deckEligible!==false,c.id);assert.equal(c.name,name);assert.equal(c.rarity,rarity);assert.equal(c.number,n);assert.equal(c.image,'https://images.pokemontcg.io/swsh9tg/'+n+'.png');
  const original=data.cardById(c.reprintOf);assert.ok(original);assert.deepEqual(mechanics(c),mechanics(original));
  const [setId,num]=c.reprintOf.split('-'),source=require('../data/classic/'+setId+'-print-compact.json').find(r=>String(r[0])===num);assert.ok(source);const signature=r=>[r[1],r[2],[...r[3]].sort(),...r.slice(4,12),r[13]];assert.deepEqual(signature(row),signature(source),c.id);
  assert.deepEqual((c.attacks||[]).map(a=>[a.name,Array.isArray(a.cost)?a.cost.join(''):a.cost,a.text]),attacks.map(a=>[a[0],a[1].join(''),a[3]]));
  assert.deepEqual((c.abilities||[]).map(a=>[a.name,a.text]),abilities.map(a=>[a[0],a[2]]));
  if(sup==='Pokémon'){assert.equal(c.hp,Number(hp));assert.deepEqual(c.types,types);assert.equal(c.evolvesFrom??null,evolves);assert.equal(c.weakness??null,weak);assert.equal(c.resistance??null,res);assert.equal(c.retreat,retreat);}
  else{assert.equal(c.trainerType,'Supporter');assert.equal(c.text,rules.join('\n'));}
 }
 assert.deepEqual(data.coverage().brilliantStarsGallery,{total:30,imported:30,battleEnabled:30,gated:[]});
});
test('Gallery ownership retains physical print ID and shared name-copy limit',()=>{
 const owned=data.projectOwnedCards([{id:'library:swsh9tg:TG01',quantity:2},{setId:'swsh9tg',localId:'tg1',quantity:1},{gameplayId:'swsh9-67',quantity:2},{gameplayId:'swsh9tg-TG07',quantity:3}]);
 assert.ok(owned.some(r=>r.gameplayId==='swsh9tg-TG01'&&r.quantity===3));assert.ok(owned.some(r=>r.gameplayId==='swsh9-67'&&r.quantity===2));
 const tooMany=data.validateDeck([...Array(3).fill('swsh9tg-TG01'),...Array(2).fill('swsh4-26')]);assert.ok(!tooMany.ok&&tooMany.errors.some(e=>/Flareon/.test(e)));
 assert.ok(!data.cardById('swsh9tg-TG31'));
});
test('Gallery-only and mixed pools produce legal decks with no missing Energy types',()=>{const decks=require('../app/src/main/assets/tcg-classic-decks.js'),synergy=require('../app/src/main/assets/tcg-deck-synergy.js');
 for(const sets of [['swsh9tg'],['swsh9','swsh9tg']]){const owned=data.CARDS.filter(c=>sets.includes(c.setId)&&c.battleEnabled&&c.deckEligible!==false).map(c=>({gameplayId:c.id,quantity:4}));
 for(const [style,randomSeed] of [['competitive',3],['random',24]]){const r=builder.buildDeck(owned,{sets,style,randomSeed});assert.ok(r.ok,r.errors?.join('; '));assert.equal(r.cards.length,30);assert.ok(decks.validateDraft(r.cards,owned,{requireFull:true}).ok);assert.deepEqual(decks.analyzeDeck(r.cards,r.energyTypes).missingEnergyTypes,[]);assert.deepEqual(synergy.report(r.cards.map(data.cardById),r.energyTypes,'any').dead,[]);assert.ok(r.cards.every(id=>sets.includes(data.cardById(id).setId)));}
 const r=cpu.generate({sets,seed:3});assert.ok(r.ok,r.error);assert.equal(r.cards.length,30);assert.ok(data.validateDeck(r.cards).ok);assert.ok(r.cards.every(id=>sets.includes(data.cardById(id).setId)));}
});
for(const side of ['player','opponent']){
 test(side+' every Gallery attack executes using legal choices',()=>{const failures=[];let count=0;for(const c of gallery.filter(c=>c.kind==='pokemon'))for(const a of c.attacks){const h=setup(side,c.id);try{h.us.active.energy={...allEnergy};h.us.prizes.length=3;h.them.prizes.length=2;h.us.hand=[ref('swsh9-130','support'),ref('neo1-111','water')];h.us.discard=[ref('neo1-111','discard-water'),ref('sm6-1','discard-mon')];h.us.energyDiscard={Water:2,Grass:2,Psychic:2,Fighting:2};h.them.active.energy={Water:2};h.them.active.damage=40;h.them.bench[0].damage=10;h.them.hand=[ref('swsh9-130','foe-trainer')];attack(h,a.name);resolve(h);count++;}catch(e){failures.push(`${c.id} ${a.name}: ${e.message.slice(0,250)}`);}finally{h.done();}}assert.deepEqual(failures,[]);assert.equal(count,gallery.reduce((n,c)=>n+(c.attacks||[]).length,0));});
 test(side+' Awakening requires an effective Memory Capsule and suppresses both boards',()=>{for(const [source,target] of [['swsh9tg-TG01','swsh3-13'],['swsh9tg-TG02','swsh4-25'],['swsh9tg-TG04','swsh3-39']]){const h=setup(side,source);try{
  h.us.bench[0].cardId=target;h.them.active.cardId=target;
  assert.equal(fx.abilitiesSuppressed(h.s,side,h.us.bench[0],data.cardById),false);h.us.active.tool=ref('swsh4-202','memory');
  assert.equal(fx.abilitiesSuppressed(h.s,side,h.us.bench[0],data.cardById),true);assert.equal(fx.abilitiesSuppressed(h.s,h.foe,h.them.active,data.cardById),true);
  h.us.active.abilitySuppressed={duration:'whileActive'};assert.equal(fx.abilitiesSuppressed(h.s,h.foe,h.them.active,data.cardById),false);delete h.us.active.abilitySuppressed;
  h.s.stadium={cardId:'sm6-111',ownerSide:side,uid:'lab'};assert.equal(fx.abilitiesSuppressed(h.s,h.foe,h.them.active,data.cardById),false);
 }finally{h.done();}}});
 test(side+' Awakening chain restores Grass abilities when Flareon is suppressed',()=>{const h=setup(side,'swsh9tg-TG01');try{
  h.us.active.tool=ref('swsh4-155','f');h.them.active.cardId='swsh3-13';h.us.bench[0].cardId='swsh9tg-TG02';h.us.bench[0].tool=ref('swsh4-155','v');assert.equal(fx.abilitiesSuppressed(h.s,h.foe,h.them.active,data.cardById),false);
  h.them.bench[0].cardId='swsh9tg-TG04';h.them.bench[0].tool=ref('swsh4-155','j');assert.equal(fx.abilitiesSuppressed(h.s,h.foe,h.them.active,data.cardById),true);
 }finally{h.done();}});
 test(side+' Spectral Breach changes each attached Special Energy to one Colorless, then restores it',()=>{const h=setup(side,'swsh4-43');try{
  const p=h.us.active,q=h.them.active;h.us.bench[0].cardId='swsh9tg-TG06';p.energy={Lightning:1};p.specialEnergy=[ref('swsh4-162','grass'),{...ref('sm1-136','double'),provides:{Colorless:2}}];q.energy={Fire:1};q.specialEnergy=[ref('swsh4-164','stone')];const original=JSON.stringify(p.specialEnergy);assert.equal(fx.spectralBreachActive(h.s,data.cardById),true);assert.deepEqual(core.effectiveEnergy(h.s,side,p),{Lightning:1,Colorless:2});assert.deepEqual(core.effectiveEnergy(h.s,h.foe,q),{Fire:1,Colorless:1});assert.equal(fx.attachedSpecialProvidesType(p.specialEnergy[0],'Grass',p,data.cardById,h.s),false);assert.equal(fx.attachedSpecialProvidesType(p.specialEnergy[0],'Colorless',p,data.cardById,h.s),true);assert.equal(JSON.stringify(p.specialEnergy),original);
  h.us.bench[0].abilitySuppressed={duration:'permanent'};assert.deepEqual(core.effectiveEnergy(h.s,side,p),{Lightning:1,Grass:1,Colorless:2});assert.deepEqual(core.effectiveEnergy(h.s,h.foe,q),{Fire:1,Fighting:1});assert.equal(JSON.stringify(p.specialEnergy),original);
 }finally{h.done();}});
 test(side+' Rapid Strike Search has a shared once-per-turn limit and filters cards by strike style',()=>{const h=setup(side,'swsh9tg-TG03');try{h.us.bench=[Object.assign(slot('swsh5-178','octillery'),{benchSlot:0})];h.us.deck=[ref('swsh5-36','rapid-mon'),ref('swsh5-128','rapid-supporter'),ref('swsh5-23','single-mon')];use(h,'ability');assert.ok(!core.legalActions(h.s,side).some(a=>a.choiceCardId==='swsh5-23'));resolve(h);assert.equal(h.us.hand.length,1);assert.ok(data.cardById(h.us.hand[0].cardId).rapidStrike);assert.ok(!core.legalActions(h.s,side).some(a=>a.type==='ability'));h.us.turnCount++;assert.ok(core.legalActions(h.s,side).some(a=>a.type==='ability'));}finally{h.done();}});
 test(side+' G-Max Rapid Flow discards all Energy and hits two distinct opposing Pokemon',()=>{const h=setup(side,'swsh9tg-TG21');try{h.us.active.energy={Fighting:2,Colorless:1};attack(h,'G-Max Rapid Flow');resolve(h);assert.equal(h.them.active.damage,120);assert.equal(h.them.bench[0].damage,120);assert.equal(Object.values(h.us.active.energy).reduce((a,b)=>a+b,0),0);}finally{h.done();}});
 test(side+' Single Strike Roar takes an actual Energy card and damages only its chosen recipient; Urn recovers two copies',()=>{const h=setup(side,'swsh9tg-TG10');try{
  h.us.bench=[Object.assign(slot('swsh9tg-TG18','urshifu'),{benchSlot:0}),Object.assign(slot('swsh9tg-TG20','rapid'),{benchSlot:1})];h.us.deck=[ref('swsh5-141','ss1'),ref('swsh5-140','rs1'),ref('swsh5-183','ss2'),ref('sm6-1','filler')];
  use(h,'ability');assert.ok(!core.legalActions(h.s,side).some(x=>x.choiceCardId==='swsh5-140'));choice(h,x=>x.choiceCardId==='swsh5-183');assert.ok(!core.legalActions(h.s,side).some(x=>x.choiceCardId==='swsh9tg-TG20'));choice(h,x=>x.choiceCardId==='swsh9tg-TG18');assert.equal(h.us.bench[0].damage,20);assert.equal(h.us.bench[0].specialEnergy[0].uid,'ss2');assert.equal(h.us.active.damage,0);assert.ok(!core.legalActions(h.s,side).some(x=>x.type==='ability'));
  h.us.discard.push(ref('swsh5-141','recover1'),ref('swsh5-183','recover2'),ref('swsh5-140','leave'));trainer(h,'swsh5-139');resolve(h);assert.ok(h.us.deck.some(x=>x.uid==='recover1'));assert.ok(h.us.deck.some(x=>x.uid==='recover2'));assert.ok(h.us.discard.some(x=>x.uid==='leave'));
 }finally{h.done();}});
 test(side+' Mimikyu VMAX places four or thirteen counters depending on Acerola',()=>{for(const boosted of [false,true]){const h=setup(side,'swsh9tg-TG17');try{if(boosted){h.them.hand=[ref('swsh9-130','support')];trainer(h,'swsh9tg-TG24');resolve(h);}attack(h,'Ominous Numbers');resolve(h);assert.equal(h.them.active.damage+h.them.bench[0].damage,boosted?130:40);}finally{h.done();}}});
 test(side+' Café Master selects distinct Bench Pokémon and Energy types, ends turn unless Active Alcremie has Ability',()=>{for(const mode of ['ordinary','alcremie','suppressed','benched']){const h=setup(side,['alcremie','suppressed'].includes(mode)?'swsh9tg-TG08':'swsh9-17');try{h.us.bench=[Object.assign(slot(mode==='benched'?'swsh9tg-TG08':'swsh9-1','b0'),{benchSlot:0}),Object.assign(slot('swsh9-3','b1'),{benchSlot:1}),Object.assign(slot('swsh9-6','b2'),{benchSlot:2})];h.us.energySupply=[];const old=data.cardById;data.cardById=id=>['test-water','test-fire'].includes(id)?{id,name:id==='test-fire'?'Fire Energy':'Water Energy',kind:'energy',basicEnergy:true,subtype:id==='test-fire'?'Fire':'Water',energyType:id==='test-fire'?'Fire':'Water'}:old(id);h.us.deck=[ref('test-fire','f1'),ref('test-fire','f2'),ref('test-water','w1'),...h.us.deck];if(mode==='suppressed')h.us.active.sm10AbilityLockUntil=h.s.turnNumber;trainer(h,'swsh9tg-TG25');resolve(h);assert.equal(h.us.bench[0].energy.Fire,1);assert.equal(h.us.bench[1].energy.Water,1);assert.equal(Object.values(h.us.bench[2].energy).reduce((n,x)=>n+x,0),0);assert.equal(h.us.deck.filter(r=>r.cardId==='test-fire').length,1);assert.equal(h.s.activeSide,mode==='alcremie'?side:h.foe);}finally{h.done();}}});
}
