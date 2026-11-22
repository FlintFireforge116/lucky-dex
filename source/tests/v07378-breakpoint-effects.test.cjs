'use strict';
// BREAKpoint: DSL validation and actual physical-zone attack outcome regression.
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets'),fx=require(path.join(assets,'tcgp-battle-effects.js'));
function py(script){const r=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
const mappings=py('import sys,json;sys.path.insert(0,sys.argv[1]);import xy9_verified as v;print(json.dumps({"attacks":list(v.ATK.values()),"trainers":[x[1] for x in v.TRAINERS.values()],"abilities":[x["effect"] for x in v.ABILITIES.values()],"n":len(v.ATK)}))');
const mon={id:'mon',kind:'pokemon',stage:'Basic',hp:150,name:'Monster',types:['Water'],subtype:'Water'};
const energy={id:'waterEnergy',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water'};
function scene(){const a={uid:'a',cardId:'mon',energy:{Water:3},specialEnergy:[],damage:0,conditions:{}},b={uid:'b',cardId:'mon',energy:{},specialEnergy:[],damage:0,conditions:{}};
const p={active:a,bench:[],hand:[],deck:[],discard:[],prizes:[],energySupply:[],energyDiscard:{}},o={active:b,bench:[],hand:[],deck:[],discard:[],prizes:[],energySupply:[],energyDiscard:{}};
const state={format:'classic',activeSide:'player',turnNumber:3,sides:{player:p,opponent:o},log:[]};
const prompts=[],ctx={state,side:'player',foeSide:'opponent',attacker:a,defender:b,cardById:id=>({mon,waterEnergy:energy}[id]||null),requestChoice:q=>prompts.push(q),random:(()=>{let i=0;return()=>[.1,.9][i++%2]})(),shuffle:()=>{},onEnergyAttached:()=>{},isAttack:true};
return {a,b,p,state,prompts,ctx};}
test('All mapped BREAKpoint DSL actions validate against shared engine',()=>{
 assert.ok(mappings.n>=85);
 for(const e of [...mappings.attacks,...mappings.trainers,...mappings.abilities])assert.deepEqual(fx.validateEffect(e),[],JSON.stringify(e));
});
test('Stormy Seas selects and attaches a real Water Energy card from the deck',()=>{
 const s=scene();s.a.energy={};s.p.deck=[{uid:'realwater',cardId:'waterEnergy'}];
 fx.applyEffect({type:'neoRule',rule:'xy9:stormySeas'},s.ctx);
 assert.equal(s.prompts.at(-1)?.kind,'deckCard');
 const q=s.prompts.pop();
 fx.applyEffect(q.effect,{...s.ctx,resolvingChoice:true,action:{choiceDeckIndex:0}});
 assert.equal(s.a.energy.Water,1);assert.equal(s.p.deck.length,0);
 assert.ok(s.state.log.some(x=>x.type==='attachEnergy'&&x.cardId==='waterEnergy'));
});
test('Stormy Seas searches Classic Energy Zone when Basic Energy is not in physical deck',()=>{
 const s=scene();s.a.energy={};s.p.deck=[];s.p.energySupply=['Grass','Water','Water','Fire'];
 fx.applyEffect({type:'neoRule',rule:'xy9:stormySeas'},s.ctx);
 assert.equal(s.a.energy.Water,1);
 assert.deepEqual(s.p.energySupply,['Grass','Water','Fire']);
 assert.equal(s.p.deck.length,0);
 assert.equal(s.prompts.length,0);
 assert.ok(s.state.log.some(x=>x.type==='attachEnergy'&&x.source==='energyZone'));
});
test('Blast Geyser has an optional +20 per Water Energy and exactly 2 top-deck discards',()=>{
 const s=scene(),attack={name:'Blast Geyser',damage:120,effect:{type:'neoRule',rule:'xy9:blastGeyser'}};
 const plain=fx.resolveAttack(attack,s.ctx);assert.equal(plain.damage,120);
 const enhanced=fx.resolveAttack(attack,{...s.ctx,action:{effectSelection:'boost'}});
 assert.equal(enhanced.damage,180);assert.ok(enhanced.pendingEffects?.some(e=>e.type==='discardTop'&&e.amount===2));
});
test('Manaphy Aqua Tube is conditional on actual attached Water Energy',()=>{
 const cards={m:{id:'m',name:'Manaphy-EX',stage:'Basic',types:['Water'],abilities:[{name:'Aqua Tube',type:'passive',effect:{type:'modifier',stat:'retreatCost',amount:-99,scope:'team',duration:'whileInPlay',filter:{hasEnergyType:'Water'}}}]},t:{id:'t',name:'Test',stage:'Basic',types:['Fire']}};
 const slot=(id,uid,energy={})=>({uid,cardId:id,stack:[id],energy,specialEnergy:[],damage:0,conditions:{}});
 const teammate=slot('t','water',{Water:1});const state={format:'classic',turnNumber:4,sides:{player:{active:slot('m','m'),bench:[teammate]},opponent:{active:slot('t','foe'),bench:[]}},log:[]};
 assert.equal(fx.modifierAmount(state,'player',teammate,'retreatCost',id=>cards[id]),-99);
 teammate.energy={Fire:1};assert.equal(fx.modifierAmount(state,'player',teammate,'retreatCost',id=>cards[id]),0);
});
test('Trevenant Nervous Seed applies the Colorless surcharge only to an opposing Basic',()=>{
 const cards={t:{id:'t',name:'Trevenant',stage:'Stage 1',types:['Psychic'],abilities:[{name:'Nervous Seed',type:'passive',effect:{type:'modifier',stat:'attackCostColorless',amount:1,scope:'opponentActive',duration:'whileActive',filter:{stage:'Basic'}}}]},basic:{id:'basic',name:'Basic',stage:'Basic'},evolved:{id:'evolved',name:'Evolved',stage:'Stage 1'}};
 const slot=(id,uid)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{}});
 const foe=slot('basic','foe'),state={format:'classic',turnNumber:4,sides:{player:{active:slot('t','trevenant'),bench:[]},opponent:{active:foe,bench:[]}},log:[]};
 assert.equal(fx.modifierAmount(state,'opponent',foe,'attackCostColorless',id=>cards[id]),1);
 foe.cardId='evolved';assert.equal(fx.modifierAmount(state,'opponent',foe,'attackCostColorless',id=>cards[id]),0);
});
test('Shared BREAK evolution references existing audited LV.X infrastructure',()=>{
 const source=require('node:fs').readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 assert.match(source,/breakEvolution/);assert.match(source,/isLevelX/);
});
test('Printed effects requiring distinct unresolved mechanics remain gated by mapping',()=>{
 const q=py('import sys,json;sys.path.insert(0,sys.argv[1]);import xy9_verified as v;print(json.dumps({"ability":v.ABILITIES.get("Garbotoxin"),"energy":v.ENERGIES.get("113"),"stadium":v.TRAINERS.get("110"),"slowbro":v.ATK.get(("20","Walk-Off Homer"))}))');
 assert.equal(q.ability,null);assert.equal(q.energy,null);assert.equal(q.stadium,null);assert.equal(q.slowbro,null);
});
