'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const fx=require(path.join(assets,'tcgp-battle-effects.js'));
const pokemon=(id,uid=id)=>({uid,cardId:id,stack:[id],energy:{},specialEnergy:[],damage:0,conditions:{}});
function fixture(){
 const cards={
  'pl4-AR3':{id:'pl4-AR3',name:'Arceus',kind:'pokemon',stage:'Basic',types:['Fire'],subtype:'Fire',abilities:[],attacks:[]},
  'pl4-AR6':{id:'pl4-AR6',name:'Arceus',kind:'pokemon',stage:'Basic',types:['Lightning'],subtype:'Lightning',abilities:[],attacks:[]},
  'pl4-94':{id:'pl4-94',name:'Arceus LV.X',kind:'pokemon',stage:'Level-Up',types:['Colorless'],subtype:'Colorless',abilities:[],isLevelX:true},
  'base1-99':{id:'base1-99',name:'Grass Energy',kind:'energy',basicEnergy:true,subtype:'Grass'},
  'dp1-124':{id:'dp1-124',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire'},
  'pl4-92':{id:'pl4-92',name:'Dome Fossil',kind:'trainer',effect:{type:'playFossil',hp:50}},
  'pl4-67':{id:'pl4-67',name:'Kabuto',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Dome Fossil',hp:80},
  'pl4-87':{id:'pl4-87',name:'Expert Belt',kind:'trainer',trainerType:'Tool'},
  'pl4-89':{id:'pl4-89',name:'Old Amber',kind:'trainer',effect:{type:'playFossil',hp:50}},
  'pl4-99':{id:'pl4-99',name:'Tangrowth LV.X',kind:'pokemon',stage:'Level-Up',hp:130},
 };
 const player={active:pokemon('pl4-AR3'),bench:[pokemon('pl4-AR6')],deck:[],hand:[],discard:[],lostZone:[],energyDiscard:{},prizes:[{},{}],handLimit:8,turnCount:4},opponent={active:pokemon('pl4-99'),bench:[],deck:[],hand:[],discard:[],energyDiscard:{},prizes:[{},{}],handLimit:8,turnCount:4};
 const state={format:'classic',turnNumber:9,activeSide:'player',sides:{player,opponent},log:[],rngState:12};let pending=null;
 const ctx={state,side:'player',foeSide:'opponent',attacker:player.active,defender:opponent.active,cardById:id=>cards[id]||null,
  random:()=>0.1,shuffle:(_s,a)=>a,requestChoice:spec=>(pending=spec),onEnergyAttached:()=>{},maxHp:(_side,p)=>cards[p.cardId]?.hp||100,drawCard:s=>s.hand.push(s.deck.shift())};
 return {ctx,state,player,opponent,cards,pending:()=>pending};
}
test('Arceus LV.X Multi-type inherits previous Arceus print type',()=>{
 const {ctx,player}=fixture(),lvx=pokemon('pl4-94');lvx.stack=['pl4-AR3','pl4-94'];player.active=lvx;
 assert.deepEqual(fx.effectiveTypes(ctx.state,'player',lvx,ctx.cardById),['Fire']);
});
test('Ultimate Zone moves exactly one chosen Energy from Benched Pokémon to Active Arceus',()=>{
 const f=fixture();f.player.bench[0].energy.Fire=2;
 const effect={type:'neoRule',rule:'pl4:91:ultimateZone'};
 fx.applyEffect(effect,f.ctx);const choice=f.pending();assert.equal(choice.kind,'option');assert.ok(choice.options.some(x=>x.includes('Fire')));
 fx.applyEffect(choice.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(f.player.bench[0].energy.Fire,1);assert.equal(f.player.active.energy.Fire,1);
});
test('Energy Restore gives the player their choice of physical discarded Basic Energy cards after coin results',()=>{
 const f=fixture();f.player.discard.push({uid:'energy-fire',cardId:'dp1-124'},{uid:'energy-grass',cardId:'base1-99'});
 fx.applyEffect({type:'neoRule',rule:'pl4:86:energyRestore'},f.ctx);
 const choice=f.pending();assert.equal(choice.options.length,2);assert.ok(f.state.log.some(x=>x.type==='coin'&&x.heads===3));
 fx.applyEffect(choice.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(f.player.hand[0].cardId,'base1-99');
});
test('Fossil Rock Reaction evolves exact chosen Kabuto, never a different evolutionary line',()=>{
 const f=fixture(),fossil=pokemon('pl4-92');f.player.bench=[fossil];f.player.deck.push({uid:'kabuto-1',cardId:'pl4-67'});
 fx.applyEffect({type:'neoRule',rule:'pl4:fossilReaction',fossilUid:fossil.uid,refUids:['kabuto-1']},{...f.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(fossil.cardId,'pl4-67');assert.equal(f.player.deck.length,0);
});
test('Tumble Down and Primal Scythe expose physical-card discard choices instead of auto-picking',()=>{
 const f=fixture();f.player.hand.push({uid:'fight-a',cardId:'fight-basic'},{uid:'fossil-a',cardId:'pl4-92'});
 f.cards['fight-basic']={name:'Fighting Energy',kind:'energy',subtype:'Fighting',basicEnergy:true};
 const tumble=fx.choicesForEffect({type:'neoRule',rule:'pl4:19:tumbleDown'},f.ctx);
 const scythe=fx.choicesForEffect({type:'neoRule',rule:'pl4:4:primalScythe'},f.ctx);
 assert.equal(tumble.length,2);assert.equal(scythe.length,2);assert.ok(scythe[1].choiceLabel.includes('Dome Fossil'));
});
test('No unknown effect objects are activated merely by marking the set battle-enabled',()=>{
 const script=fs.readFileSync(path.resolve(__dirname,'../scripts/build-arceus.py'),'utf8');
 assert.match(script,/def supported\(e\):/);assert.match(script,/IMPLEMENTED_PL4/);assert.match(script,/if t=='stadiumAction':return supported/);
 assert.match(script,/EXPECTED_GIT_BLOB/);
});

test('Tangrowth LV.X Big Growth selects each discarded Grass Energy and destination, including Done',()=>{
 const f=fixture();f.player.discard.push({uid:'grass-one',cardId:'base1-99'},{uid:'grass-two',cardId:'base1-99'});
 const big={type:'neoRule',rule:'pl4:99:bigGrowth'};
 fx.applyEffect(big,f.ctx);
 const chooseEnergy=f.pending();assert.equal(chooseEnergy.options.length,3);assert.match(chooseEnergy.options.at(-1),/Done/);
 fx.applyEffect(chooseEnergy.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
 const target=f.pending();assert.ok(target.options.some(x=>x.includes('Arceus')));
 fx.applyEffect(target.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(f.player.bench[0].energy.Grass,1);
 assert.equal(f.player.discard.length,1);
 const second=f.pending();assert.equal(second.options.length,2);
 fx.applyEffect(second.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(f.player.discard.length,1,'Done must not consume additional Energy');
});

test('Raticate Recruit chooses an actual Supporter from opponent hand, discards it, resolves the effect on attacker side',()=>{
 const f=fixture();f.cards['test-supporter']={name:'Draw a Card',kind:'trainer',trainerType:'Supporter',effect:{type:'draw',amount:1}};
 f.opponent.hand.push({uid:'other-supporter',cardId:'test-supporter'});f.player.deck.push({uid:'to-draw',cardId:'base1-99'});
 fx.applyEffect({type:'neoRule',rule:'pl4:29:recruit'},f.ctx);
 const choice=f.pending();assert.ok(choice.options[0].includes('Supporter'));
 fx.applyEffect(choice.effect,{...f.ctx,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(f.opponent.hand.length,0);assert.equal(f.opponent.discard[0].cardId,'test-supporter');
 assert.equal(f.player.hand.length,1);assert.equal(f.opponent.hand.length,0);
});

test('Ponyta Ascension chooses the actual eligible evolving card from the deck',()=>{
 const f=fixture();f.cards['test-ponyta']={id:'test-ponyta',name:'Ponyta',kind:'pokemon',stage:'Basic'};
 f.cards['test-rapidash']={id:'test-rapidash',name:'Rapidash',kind:'pokemon',stage:'Stage 1',evolvesFrom:'Ponyta',battleEnabled:true};
 f.player.active=pokemon('test-ponyta');f.player.deck.push({uid:'evo-a',cardId:'test-rapidash'});
 fx.applyEffect({type:'neoRule',rule:'pl4:46:ascension'},{...f.ctx,attacker:f.player.active});
 const pending=f.pending();assert.match(pending.options[0],/Rapidash/);
 fx.applyEffect(pending.effect,{...f.ctx,attacker:f.player.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(f.player.active.cardId,'test-rapidash');assert.equal(f.player.deck.length,0);
 assert.deepEqual(f.player.active.stack,['test-ponyta','test-rapidash']);
});

test('Nosepass Harden establishes the next-opponent-turn damage guard without healing or reducing HP',()=>{
 const f=fixture();f.player.active=pokemon('pl4-69');
 fx.applyEffect({type:'neoRule',rule:'pl4:69:harden'},{...f.ctx,attacker:f.player.active});
 assert.equal(f.player.active.pl4HardenUntil,10);assert.equal(f.player.active.damage,0);
});
