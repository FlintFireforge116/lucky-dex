'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.resolve(__dirname,'../app/src/main/assets');
const fx=require(path.join(base,'tcgp-battle-effects.js'));
const data=require(path.join(base,'tcg-classic-battle-data.js'));
const C=(cardId,uid)=>({cardId,uid:uid||cardId});
const P=(cardId,uid)=>({cardId,uid:uid||cardId,stack:[cardId],energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},damage:0,locks:[]});
const S=()=>({active:P('bw9-1','a'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},prizes:[C('bw9-1')],prizesTaken:0,handLimit:8,benchLimit:3,turnCount:3});
const state=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,sides:{player:S(),opponent:S()},log:[],rngState:1,rules:{benchSize:3}});
const extras={
 'xy1-140':{name:'Fairy Energy',kind:'energy',basicEnergy:true,energyType:'Fairy'},
 'xy1-135':{name:'Lightning Energy',kind:'energy',basicEnergy:true,energyType:'Lightning'},
 'xy1-139':{name:'Metal Energy',kind:'energy',basicEnergy:true,energyType:'Metal'},
 'xy1-133':{name:'Fire Energy',kind:'energy',basicEnergy:true,energyType:'Fire'},
 'xy1-137':{name:'Fighting Energy',kind:'energy',basicEnergy:true,energyType:'Fighting'},
 'xy1-134':{name:'Water Energy',kind:'energy',basicEnergy:true,energyType:'Water'},
 'xy1-123':{name:"Professor's Letter",kind:'trainer',trainerType:'Item'},
 'xy1-116':{name:'Evosoda',kind:'trainer',trainerType:'Item'},
 'xy1-119':{name:'Hard Charm',kind:'trainer',trainerType:'Tool'},
 'xy1-121':{name:'Muscle Band',kind:'trainer',trainerType:'Tool'},
 'xy1-57':{name:'Gourgeist',kind:'pokemon',hp:100},
 'xy1-89':{name:'Wigglytuff',kind:'pokemon',hp:100},
 'xy1-80':{name:'Skarmory-EX',kind:'pokemon',hp:180},
};
const lookup=id=>extras[id]||data.cardById(id)||{id,name:id,kind:'pokemon',hp:100};
const r=name=>({type:'neoRule',rule:'xy1:'+name});
function ctx(s,over={}){let q;const x={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:lookup,random:()=>.1,isAttack:true,action:{},shuffle:()=>{},drawCard:()=>{},onEnergyAttached:()=>{},requestChoice:c=>{q=c;},...over};return [x,()=>q];}
function effect(s,name,over={}){const [c,q]=ctx(s,over);fx.applyEffect(r(name),c);return q();}
function continueChoice(s,q,selection){let out;const [c]=ctx(s,{resolvingChoice:true,action:selection,requestChoice:v=>out=v});fx.applyEffect(q.effect,c);return out;}
function run(s,name,base=0,over={}){return fx.resolveAttack({name,damage:base,effect:r(name)},ctx(s,over)[0]);}

// All printed attacks' unconditional effects must not throw when battle-enabled.
test('Gogoat Charge Dash provides a real optional recoil choice and never crashes',()=>{
 let s=state();let x=fx.choicesForEffect(r('chargeDash'),ctx(s)[0]);assert.equal(x.length,2);
 let a=run(s,'chargeDash',60,{action:{effectSelection:'boost'}});assert.equal(a.damage,80);
 assert.equal(a.pendingEffects.length,1);fx.applyEffect(a.pendingEffects[0],ctx(s)[0]);assert.equal(s.sides.player.active.damage,20);
 assert.equal(run(s,'chargeDash',60,{action:{effectSelection:''}}).damage,60);
});
test('Rhyhorn Dig Out moves exactly one deck card, matching Fighting Energy or physical discard',()=>{
 const s=state(),a=s.sides.player.active,p=s.sides.player;
 p.deck=[C('xy1-137','physical-fighting'),C('xy1-123','physical-item')];
 let n=run(s,'digOut');n.pendingEffects.forEach(e=>fx.applyEffect(e,ctx(s)[0]));
 assert.equal(a.energy.Fighting,1);assert.equal(p.deck.length,1);
 n=run(s,'digOut');n.pendingEffects.forEach(e=>fx.applyEffect(e,ctx(s)[0]));
 assert.equal(p.discard[0].uid,'physical-item');assert.equal(p.deck.length,0);
});
test('Beedrill Flash Needle three heads blocks next attack and does 120 damage',()=>{
 const s=state(),z=run(s,'flashNeedle',0);assert.equal(z.damage,120);assert.equal(z.pendingEffects[0].type,'preventDamage');
 assert.equal(s.log.filter(x=>x.type==='coin').length,1);
});
test('Vivillon Conversion Powder selects sleep or poison, not both',()=>{
 const s=state(),opts=fx.choicesForEffect(r('conversionPowder'),ctx(s)[0]);assert.deepEqual(opts.map(x=>x.effectSelection),['sleep','poison']);
 const n=run(s,'conversionPowder',0,{action:{effectSelection:'sleep'}});n.pendingEffects.forEach(e=>fx.applyEffect(e,ctx(s)[0]));
 assert.ok(s.sides.opponent.active.conditions.sleep);assert.equal(s.sides.opponent.active.conditions.poison,undefined);
});
test('Magcargo Magma Mantle discards a physical Fire card only when selected',()=>{
 const s=state(),p=s.sides.player;p.deck=[C('xy1-133','fire-one'),C('xy1-123','item-two')];
 assert.equal(run(s,'magmaMantle',30,{action:{effectSelection:'keep'}}).damage,30);assert.equal(p.deck.length,2);
 assert.equal(run(s,'magmaMantle',30,{action:{effectSelection:'discard'}}).damage,80);
 assert.deepEqual(p.discard.map(x=>x.uid),['fire-one']);assert.equal(p.deck.length,1);
});
test('Rhyperior Rock Black flips per effective Fighting Energy not per attached card',()=>{
 const s=state();s.sides.player.active.energy.Fighting=3;
 assert.equal(run(s,'rockBlack',0).damage,150);
});
test('Conkeldurr Wake-Up Slap adds damage before clearing status',()=>{
 const s=state();s.sides.opponent.active.conditions.poison={amount:10};
 const n=run(s,'wakeUpSlap',30);assert.equal(n.damage,90);n.pendingEffects.forEach(e=>fx.applyEffect(e,ctx(s)[0]));
 assert.deepEqual(s.sides.opponent.active.conditions,{});
});
test('Skarmory-EX Joust discards all Tools before any damage calculation',()=>{
 const s=state(),d=s.sides.opponent.active;d.tool=C('xy1-119','charm');d.extraTools=[C('xy1-121','band')];
 const n=run(s,'joust',70);assert.equal(n.damage,70);assert.equal(d.tool,null);assert.deepEqual(s.sides.opponent.discard.map(x=>x.uid),['charm','band']);
});
test('Spirit Scream places counters until both active Pokemon have 10 HP remaining',()=>{
 const s=state();s.sides.player.active.cardId='xy1-57';s.sides.opponent.active.cardId='xy1-89';
 s.sides.player.active.damage=30;s.sides.opponent.active.damage=10;
 effect(s,'spiritScream');assert.equal(s.sides.player.active.damage,90);assert.equal(s.sides.opponent.active.damage,90);
});
test('Eerie Voice adds two damage counters to every opposing Pokemon',()=>{
 const s=state();s.sides.opponent.bench=[P('xy1-89','bench0')];
 effect(s,'eerieVoice');assert.equal(s.sides.opponent.active.damage,20);assert.equal(s.sides.opponent.bench[0].damage,20);
});
test('XY Mine reveals only top card and grants optional opponent shuffle',()=>{
 const s=state(),f=s.sides.opponent;f.deck=[C('xy1-123','top')];const q=effect(s,'mine');
 assert.equal(q.kind,'option');assert.ok(q.options[0].includes("Professor's Letter"));
 continueChoice(s,q,{choiceOption:0});assert.equal(f.deck.length,1);
});
test('Recover asks which attached Energy to discard then heals the attacker',()=>{
 const s=state(),a=s.sides.player.active;a.damage=70;a.energy.Water=2;a.specialEnergy=[C('bw11-113','dce')];
 const q=effect(s,'recover');assert.equal(q.options.length,2);
 continueChoice(s,q,{choiceOption:1});assert.equal(a.damage,0);assert.equal(a.specialEnergy.length,0);
 assert.equal(s.sides.player.discard[0].uid,'dce');
});
test('Energy Salon picks up to three distinct printed Basic types with physical UIDs',()=>{
 const s=state(),p=s.sides.player;p.deck=[C('xy1-140','f1'),C('xy1-140','f2'),C('xy1-133','fire'),C('xy1-134','water')];
 let q=effect(s,'energySalon');q=continueChoice(s,q,{choiceOption:0});
 assert.equal(p.hand.length,1);assert.ok(q.options.every(x=>!x.includes('Fairy Energy')));
 q=continueChoice(s,q,{choiceOption:0});assert.equal(p.hand.length,2);
 q=continueChoice(s,q,{choiceOption:0});assert.equal(p.hand.length,3);
 assert.deepEqual(new Set(p.hand.map(x=>lookup(x.cardId).energyType)).size,3);
});
test('Pickup returns selected physical Item cards from discard',()=>{
 const s=state(),p=s.sides.player;p.discard=[C('xy1-123','letter'),C('xy1-116','soda'),C('xy1-140','fairy')];
 let q=effect(s,'pickup');assert.equal(q.options.length,3);
 q=continueChoice(s,q,{choiceOption:1});assert.equal(p.hand[0].uid,'soda');
 continueChoice(s,q,{choiceOption:0});assert.deepEqual(p.hand.map(x=>x.uid),['soda','letter']);assert.equal(p.discard[0].uid,'fairy');
});
test('Super Potion heals 60 only after selected attached Energy discarded',()=>{
 const s=state(),a=s.sides.player.active;a.damage=80;a.energy.Water=1;a.specialEnergy=[C('bw11-113','dce')];
 let q=effect(s,'superPotion');assert.equal(q.kind,'pokemon');
 q=continueChoice(s,q,{choiceTarget:'active'});assert.equal(q.kind,'option');
 continueChoice(s,q,{choiceOption:1});assert.equal(a.damage,20);assert.equal(a.specialEnergy.length,0);
 assert.equal(s.sides.player.discard[0].uid,'dce');
});
test('Geomancy requires distinct Bench recipients and physical Fairy cards',()=>{
 const s=state(),p=s.sides.player;p.deck=[C('xy1-140','f1'),C('xy1-140','f2')];
 p.bench=[P('xy1-89','b1'),P('xy1-89','b2')];p.bench[0].benchSlot=0;p.bench[1].benchSlot=1;
 let q=effect(s,'geomancy');assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});assert.equal(p.bench[0].energy.Fairy,1);assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});q=continueChoice(s,q,{choiceOption:0});
 assert.equal(p.bench[1].energy.Fairy,1);assert.equal(p.deck.length,0);
});
test('Electron Crush damage bonus uses only a real attached physical Energy UID',()=>{
 const s=state(),a=s.sides.player.active;a.energy.Fire=1;a.specialEnergy=[C('bw11-113','dce')];
 let n=run(s,'electronCrush',50,{action:{effectSelection:'not-there'}});assert.equal(n.damage,50);
 n=run(s,'electronCrush',50,{action:{effectSelection:'dce'}});assert.equal(n.damage,80);
 n.pendingEffects.forEach(e=>fx.applyEffect(e,ctx(s)[0]));
 assert.equal(a.specialEnergy.length,0);assert.deepEqual(s.sides.player.discard.map(x=>x.uid),['dce']);
});
test('Emolga-EX Energy Glide only switches after selecting and attaching physical Lightning Energy',()=>{
 const s=state(),p=s.sides.player;p.active=P('xy1-46','active-emolga');p.bench=[P('xy1-89','bench')];p.bench[0].benchSlot=0;
 p.deck=[C('xy1-135','lightning-uid')];let q=effect(s,'energyGlide');assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});assert.equal(p.active.energy.Lightning,1);assert.equal(q.kind,'pokemon');
 continueChoice(s,q,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(p.active.uid,'bench');assert.equal(p.bench[0].uid,'active-emolga');
 assert.equal(p.deck.length,0);
});
test('Yveltal Oblivion Wing recovers exact discarded basic Darkness Energy from ledger',()=>{
 const s=state(),p=s.sides.player;p.energyDiscard.Darkness=2;p.bench=[P('xy1-89','benched')];p.bench[0].benchSlot=0;
 let q=effect(s,'oblivionWing');assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});assert.equal(q.kind,'pokemon');
 continueChoice(s,q,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(p.bench[0].energy.Darkness,1);assert.equal(p.energyDiscard.Darkness,1);
});
test('Yveltal EX Y Cyclone moves an exact physical Special Energy card',()=>{
 const s=state(),p=s.sides.player;p.active.specialEnergy=[C('bw11-113','dce')];p.bench=[P('xy1-89','target')];p.bench[0].benchSlot=0;
 let q=effect(s,'yCyclone');assert.equal(q.kind,'option');
 q=continueChoice(s,q,{choiceOption:0});assert.equal(q.kind,'pokemon');
 continueChoice(s,q,{choiceTarget:'bench',choiceBenchIndex:0});
 assert.equal(p.bench[0].specialEnergy[0]?.uid,'dce');assert.equal(p.active.specialEnergy.length,0);
});
test('Pickup considers legacy Pokémon Tools eligible XY-era Item cards',()=>{
 const s=state(),p=s.sides.player;p.discard=[C('xy1-119','hard-charm')];
 let q=effect(s,'pickup');assert.ok(q.options[0].includes('Hard Charm'));
 continueChoice(s,q,{choiceOption:0});assert.equal(p.hand[0]?.uid,'hard-charm');
});
test('release version uses the exact same string in Gradle, title and boot JS',()=>{
 const fs=require('node:fs'),root=path.resolve(__dirname,'..');
 const g=fs.readFileSync(path.join(root,'app/build.gradle'),'utf8'),
       app=fs.readFileSync(path.join(base,'app-v0167.js'),'utf8'),
       html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const version=g.match(/\bversionName\s+['"](\d+\.\d+\.\d+)['"]/)?.[1];
 assert.ok(version);assert.ok(app.includes(`window.__LUCKYDEX_BUILD='${version}'`));
 assert.ok(html.includes(`id="titleBuildVersion">v${version}`));
 assert.ok(html.includes(`id="appBuildVersion">LUCKY DEX · v${version}`));
 const buildCode=Number(g.match(/\bversionCode\s+(\d+)/)?.[1]);
 assert.equal(buildCode,7000+Number(version.split('.').at(-1)),
  'Classic versionCode must match the v0.69.patch release number');
});
