'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const data=require(path.join(assets,'tcg-classic-battle-data.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const catalog={
  'test-normal':{id:'test-normal',name:'Rattata',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Colorless'],attacks:[{name:'Pounce',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-alpha':{id:'test-alpha',name:'Swampert',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:170,types:['Water'],ancientTrait:{name:'α Growth'},attacks:[{name:'Splash',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-recovery':{id:'test-recovery',name:'Ludicolo',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:140,types:['Water'],ancientTrait:{name:'α Recovery'},attacks:[{name:'Splash',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-barrage':{id:'test-barrage',name:'Nidoqueen',kind:'pokemon',stage:'Stage 2',battleEnabled:true,hp:150,types:['Psychic'],ancientTrait:{name:'Ω Barrage'},attacks:[{name:'Jab',cost:[],damage:10,effect:{type:'noop'}}]},
  'test-basic-water':{id:'test-basic-water',name:'Kyogre-EX',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:160,types:['Water'],pokemonEX:true,attacks:[]},
  'xy5-55':{id:'xy5-55',name:'Primal Kyogre-EX',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Kyogre-EX',battleEnabled:true,megaEvolution:true,pokemonEX:true,hp:240,types:['Water'],ancientTrait:{name:'α Growth'},attacks:[]},
  'xy5-132':{id:'xy5-132',name:'Kyogre Spirit Link',kind:'trainer',trainerType:'Tool',battleEnabled:true,effect:{type:'noop'}},
  'test-metal':{id:'test-metal',name:'Registeel',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Metal'],attacks:[]},
  'test-fairy':{id:'test-fairy',name:'Xerneas',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:100,types:['Fairy'],attacks:[]},
  'test-energy-water':{id:'test-energy-water',name:'Water Energy',kind:'energy',basicEnergy:true,subtype:'Water',energyType:'Water'},
  'test-energy-fire':{id:'test-energy-fire',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
  'xy5-143':{id:'xy5-143',name:'Shield Energy',kind:'energy',specialEnergy:true,battleEnabled:true,subtype:'Metal',energyType:'Metal',effect:{type:'specialEnergy',provides:{Metal:1}}},
  'xy5-144':{id:'xy5-144',name:'Wonder Energy',kind:'energy',specialEnergy:true,battleEnabled:true,subtype:'Fairy',energyType:'Fairy',effect:{type:'specialEnergy',provides:{Fairy:1}}},
  'test-freshwater':{id:'test-freshwater',name:'Fresh Water Set',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'heal',target:'selfAll',amount:20}},
  'test-attack-poison':{id:'test-attack-poison',name:'Ekans',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:90,types:['Psychic'],attacks:[{name:'Toxic',cost:[],damage:20,effect:{type:'status',target:'opponentActive',status:'poison'}}]},
  'test-attack-plain':{id:'test-attack-plain',name:'Vulpix',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:90,types:['Fire'],attacks:[{name:'Claw',cost:[],damage:40,effect:{type:'noop'}}]}
};
const ref=(cardId,uid)=>({cardId,uid});
const mk=(cardId,uid,benchSlot=null)=>({cardId,uid,benchSlot,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],conditions:{},temporaryTrainers:[],playedOnSideTurn:1});
const side=w=>({id:w,active:mk('test-normal',w+'a'),bench:[mk('test-normal',w+'b',0)],hand:[],deck:[],discard:[],energyDiscard:{},handLimit:8,benchLimit:3,turnCount:5,energyTypes:['Colorless'],prizes:[ref('test-normal',w+'p1')],handEnergyUsed:false,energyUsed:false});
const scene=()=>({format:'classic',phase:'battle',activeSide:'player',turnNumber:7,rngState:2,log:[],sides:{player:side('player'),opponent:side('opponent')},modifiers:[]});
function withCards(fn){const orig=data.cardById;data.cardById=id=>catalog[id]||orig(id);try{return fn();}finally{data.cardById=orig;}}
function use(s,side,match){const act=core.legalActions(s,side).find(match);assert.ok(act,'No legal action: '+JSON.stringify(core.legalActions(s,side)));core.applyAction(s,side,act);return act;}

test('Alpha Growth grants exactly two physical hand attachments to the same Pokémon, not others or three',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-alpha','g');p.hand=[ref('test-energy-water','w1'),ref('test-energy-water','w2'),ref('test-energy-fire','f1')];
 use(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='test-energy-water'&&a.target==='active');
 assert.equal(p.handEnergyUsed,true);assert.equal(p.xy5GrowthBonus.targetUid,'g');
 assert.equal(core.legalActions(s,'player').filter(a=>a.type==='attachSpecial'&&a.target==='bench').length,0);
 use(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='test-energy-water'&&a.target==='active');
 assert.equal(p.xy5GrowthBonus,undefined);assert.equal(core.legalActions(s,'player').some(a=>a.type==='attachSpecial'),false);
 assert.equal(p.active.energy.Water,2);assert.equal(p.hand.length,1);
}));

test('Alpha Recovery doubles the HEAL on its real physical slot, without healing unrelated Pokémon',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-recovery','l');p.active.damage=70;p.bench[0].damage=70;p.hand=[ref('test-freshwater','h')];
 use(s,'player',a=>a.type==='trainer'&&a.cardId==='test-freshwater');
 assert.equal(p.active.damage,30);assert.equal(p.bench[0].damage,50);
 assert.ok(s.log.some(x=>x.type==='xy5AlphaRecovery'&&x.extraHealed===20));
}));

test('Omega Barrage grants a genuine second attack, locks out Trainer/bench/attachments and ends after the second',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-barrage','n');p.hand=[ref('test-freshwater','t')];
 use(s,'player',a=>a.type==='attack');
 assert.equal(s.activeSide,'player','first attack must NOT advance turn');
 assert.equal(s.turnNumber,7);assert.equal(s.xy5BarrageSecond.sourceUid,'n');
 assert.deepEqual([...new Set(core.legalActions(s,'player').map(a=>a.type))].sort(),['attack','endTurn']);
 use(s,'player',a=>a.type==='attack');
 assert.equal(s.activeSide,'opponent','second attack advances turn');
 assert.equal(s.xy5BarrageSecond,undefined);
 assert.equal(s.sides.opponent.active.damage,20);
}));

test('Primal Kyogre Spirit Link permits the exact evolution without ending the turn',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-basic-water','k');p.active.tool=ref('xy5-132','sl');p.hand=[ref('xy5-55','pr')];
 use(s,'player',a=>a.type==='evolve'&&a.cardId==='xy5-55'&&a.target==='active');
 assert.equal(p.active.cardId,'xy5-55');assert.equal(s.activeSide,'player');
 assert.equal(s.turnNumber,7);
}));

test('Shield and Wonder Energy are attachable only to matching Pokémon types',()=>withCards(()=>{
 const s=scene(),p=s.sides.player;p.active=mk('test-metal','m');p.bench=[mk('test-fairy','y',0)];p.hand=[ref('xy5-143','sm'),ref('xy5-144','wf')];
 const choices=core.legalActions(s,'player').filter(a=>a.type==='attachSpecial');
 assert.deepEqual(choices.map(a=>[a.cardId,a.target]).sort(),[['xy5-143','active'],['xy5-144','bench']]);
 use(s,'player',a=>a.cardId==='xy5-143'&&a.type==='attachSpecial');
 assert.equal(p.active.specialEnergy[0].uid,'sm');
}));

test('Shield Energy mitigates actual opponent attack damage but not own attacks',()=>withCards(()=>{
 const s=scene();s.sides.opponent.active=mk('test-metal','m');s.sides.opponent.active.specialEnergy=[ref('xy5-143','sm')];s.sides.player.active=mk('test-attack-plain','f');
 use(s,'player',a=>a.type==='attack');
 assert.equal(s.sides.opponent.active.damage,30,'40 damage -10 Metal Shield Energy');
}));

test('Wonder Energy prevents attack effects but not damage on attached Fairy Pokémon',()=>withCards(()=>{
 const s=scene();s.sides.opponent.active=mk('test-fairy','y');s.sides.opponent.active.specialEnergy=[ref('xy5-144','wf')];s.sides.player.active=mk('test-attack-poison','p');
 use(s,'player',a=>a.type==='attack');
 assert.equal(s.sides.opponent.active.damage,20);
 assert.equal(!!s.sides.opponent.active.conditions.poison,false);
}));

test('Ninetales Barrier Shrine blocks both players playing Stadiums from hand, until Ability suppressed',()=>withCards(()=>{
 catalog['xy5-21']={id:'xy5-21',name:'Ninetales',kind:'pokemon',stage:'Stage 1',battleEnabled:true,hp:90,types:['Fire'],abilities:[{name:'Barrier Shrine',type:'passive',effect:{type:'noop'}}],attacks:[]};
 catalog['test-stadium']={id:'test-stadium',name:'Practice Field',kind:'trainer',trainerType:'Stadium',battleEnabled:true,effect:{type:'noop'}};
 const s=scene();s.sides.opponent.bench[0]=mk('xy5-21','ninetales',0);
 s.sides.player.hand=[ref('test-stadium','st1')];s.sides.opponent.hand=[ref('test-stadium','st2')];
 assert.equal(core.legalActions(s,'player').some(a=>a.type==='trainer'&&a.cardId==='test-stadium'),false);
 s.activeSide='opponent';assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='trainer'&&a.cardId==='test-stadium'),false);
 s.sides.opponent.bench[0].cardId='test-normal';
 assert.equal(core.legalActions(s,'opponent').some(a=>a.type==='trainer'&&a.cardId==='test-stadium'),true);
}));

test('Wailord Water Veil removes statuses ONLY on an Energy attached from hand',()=>withCards(()=>{
 catalog['xy5-38']={id:'xy5-38',name:'Wailord-EX',kind:'pokemon',stage:'Basic',battleEnabled:true,hp:250,types:['Water'],abilities:[{name:'Water Veil',type:'triggered',event:'energyAttached',fromHandOnly:true,effect:{type:'removeStatuses',target:'self',statuses:['poison','burn','sleep','paralysis','confusion']}}],attacks:[]};
 const s=scene(),p=s.sides.player;p.active=mk('xy5-38','w');p.active.conditions={poison:{amount:10},confusion:true};p.hand=[ref('test-energy-water','we')];
 use(s,'player',a=>a.type==='attachSpecial'&&a.cardId==='test-energy-water');
 assert.deepEqual(p.active.conditions,{});assert.ok(s.log.some(x=>x.ability==='Water Veil'));
 p.active.conditions={sleep:true};p.energyUsed=false;p.energyAvailable=true;p.energyType='Water';
 use(s,'player',a=>a.type==='attach'&&a.target==='active');
 assert.ok(p.active.conditions.sleep,'Energy Zone attachment must not trigger Water Veil');
}));

test('Energy Retrieval supports physical discard cards and Basic Energy zone discard without duplicates',()=>withCards(()=>{
 catalog['xy5-126']={id:'xy5-126',name:'Energy Retrieval',kind:'trainer',trainerType:'Item',battleEnabled:true,effect:{type:'energyRetrieval',amount:2,energyCardIds:{Water:'test-energy-water',Fire:'test-energy-fire'}}};
 const s=scene(),p=s.sides.player;p.hand=[ref('xy5-126','retr')];p.discard=[ref('test-energy-water','realw')];p.energyDiscard.Fire=1;
 use(s,'player',a=>a.type==='trainer'&&a.cardId==='xy5-126');
 assert.equal(s.phase,'effectChoice');
 // Real physical Water is selected by printed type; the Fire counter is
 // consumed separately and projected as a genuine hand Energy card.
 let opts=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');
 assert.ok(opts.length>=2);const water=opts.find(a=>s.pendingChoice.options?.[a.choiceOption]==='Water');assert.ok(water,JSON.stringify(s.pendingChoice));
 core.applyAction(s,'player',water);
 assert.equal(p.hand.some(x=>x.uid==='realw'),true);assert.equal(p.discard.some(x=>x.uid==='realw'),false);
 opts=core.legalActions(s,'player').filter(a=>a.type==='effectChoice');const fire=opts.find(a=>s.pendingChoice.options?.[a.choiceOption]==='Fire');assert.ok(fire,JSON.stringify(s.pendingChoice));
 core.applyAction(s,'player',fire);assert.equal(p.energyDiscard.Fire,0);
 assert.equal(p.hand.filter(x=>x.cardId==='test-energy-water'||x.cardId==='test-energy-fire').length,2);
}));

test('Omega Barrage survives defending Active KO and promotion before the second attack',()=>withCards(()=>{
 const s=scene(),p=s.sides.player,f=s.sides.opponent;p.active=mk('test-barrage','n');catalog['test-barrage'].attacks[0].damage=105;
 s.rules={winMode:'prizes',prizeCount:3,handLimit:8};
 p.prizes=Array.from({length:3},(_,i)=>ref('test-normal','pp'+i));
 f.prizes=Array.from({length:3},(_,i)=>ref('test-normal','fp'+i));
 use(s,'player',a=>a.type==='attack');
 assert.ok(s.phase==='promote'||s.phase==='effectChoice'||s.phase==='battle',`Expected promotion/prize/second attack, got ${s.phase}`);
 for(let i=0;i<5&&s.phase!=='battle'&&s.phase!=='finished';i++){
   const owner=s.choiceSide||s.promotionSide;
   const actions=core.legalActions(s,owner),pick=actions.find(a=>a.type==='promote'||a.type==='effectChoice');
   assert.ok(pick,'Must offer mandatory promotion/prize choice: '+JSON.stringify(actions));
   core.applyAction(s,owner,pick);
 }
 assert.equal(s.phase,'battle');assert.equal(s.activeSide,'player');
 assert.equal(s.xy5BarrageSecond?.sourceUid,'n');
 assert.equal(f.active.uid,'opponentb','Opponent must promote actual bench Pokemon');
 assert.ok(core.legalActions(s,'player').some(a=>a.type==='attack'));
}));
