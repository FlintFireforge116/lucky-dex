'use strict';
// XY10 Fates Collide Stage 4: real battle state and strict printed-effect contracts.
const {test}=require('node:test'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path'),fs=require('node:fs');
const root=path.resolve(__dirname,'..'),fx=require('../app/src/main/assets/tcgp-battle-effects.js');
const code=String.raw`import sys,json;sys.path.insert(0,sys.argv[1]);import xy10_verified as m
print(json.dumps({'attacks':{n+':'+t:e for (n,t),e in m.ATK.items()},'abilities':m.ABILITIES}))`;
const out=spawnSync('python3',['-c',code,path.join(root,'scripts')],{encoding:'utf8'});assert.equal(out.status,0,out.stderr);const m=JSON.parse(out.stdout);
function scene(){
 const cards={
  barb:{id:'xy10-23',name:'Barbaracle',kind:'pokemon',stage:'Stage 1',types:['Fighting'],abilities:[{name:'Hand Block',...m.abilities['Hand Block']}]},
  bron:{id:'xy10-61',name:'Bronzong',kind:'pokemon',stage:'Stage 1',types:['Metal'],abilities:[{name:'Metal Fortress',...m.abilities['Metal Fortress']}]},
  omni:{id:'xy10-19',name:'Omastar BREAK',kind:'pokemon',stage:'BREAK',breakEvolution:true,abilities:[{name:'Dangerous Tentacle',...m.abilities['Dangerous Tentacle']}]},
  moth:{id:'xy10-4',name:'Mothim',kind:'pokemon',stage:'Stage 1',abilities:[{name:'Wormadam First',...m.abilities['Wormadam First']}]},
  worm:{id:'worm',name:'Wormadam',kind:'pokemon',stage:'Stage 1',types:['Grass']},
  friend:{id:'friend',name:'Friend',kind:'pokemon',stage:'Basic',types:['Grass']},
  foe:{id:'foe',name:'Opponent',kind:'pokemon',stage:'Basic',types:['Water']},
  ex:{id:'ex',name:'Opposing EX',kind:'pokemon',stage:'Basic',pokemonEX:true,tags:['pokemon-ex'],types:['Fire']},
  water:{id:'water',name:'Water Bencher',kind:'pokemon',stage:'Basic',types:['Water']},
  prism:{id:'prism',name:'Double Colorless Energy',kind:'energy',effect:{provides:{Colorless:2}}},
 };
 const slot=(cardId,uid,benchSlot=0)=>({uid,cardId,benchSlot,stack:[cardId],energy:{},specialEnergy:[],damage:0,conditions:{},tool:null});
 const p={active:slot('friend','a'),bench:[],hand:[],deck:[],discard:[],prizes:[],turnCount:3,energySupply:[]},o={active:slot('foe','o'),bench:[],hand:[],deck:[],discard:[],prizes:[],turnCount:3,energySupply:[]};
 const state={format:'classic',turnNumber:8,activeSide:'player',phase:'battle',sides:{player:p,opponent:o},log:[]};
 const choices=[],ctx={state,side:'player',foeSide:'opponent',attacker:p.active,defender:o.active,cardById:id=>cards[id]||null,requestChoice:c=>choices.push(c),shuffle:()=>{},random:()=>.1,isAttack:true};
 return {cards,slot,p,o,state,ctx,choices};
}
test('All Stage 4 mappings validate, and reprint Kingdra inherits its complete attack',()=>{
 for(const [key,e] of Object.entries(m.attacks))assert.deepEqual(fx.validateEffect(e),[],key);
 for(const [name,a] of Object.entries(m.abilities))assert.deepEqual(fx.validateEffect(a.effect),[],name);
 assert.deepEqual(m.attacks['73:Dragon Trail'],m.attacks['122:Dragon Trail']);
});
test('Barbaracle Hand Block locks only opposing hand Special Energy, and only with a Stadium',()=>{
 const s=scene();s.p.bench=[s.slot('barb','b',0)];
 assert.equal(fx.isActionLocked(s.state,'opponent','SpecialEnergy',s.ctx.cardById),false);
 s.state.stadium={cardId:'stadium',ownerSide:'opponent'};
 assert.equal(fx.isActionLocked(s.state,'opponent','SpecialEnergy',s.ctx.cardById),true);
 assert.equal(fx.isActionLocked(s.state,'player','SpecialEnergy',s.ctx.cardById),false);
 assert.equal(fx.isActionLocked(s.state,'opponent','Tool',s.ctx.cardById),false);
 s.p.bench[0].abilitySuppressed=true;
 assert.equal(fx.isActionLocked(s.state,'opponent','SpecialEnergy',s.ctx.cardById),false);
});
test('Bronzong Metal Fortress protects all Bench from attack damage and attack effects; active remains vulnerable',()=>{
 const s=scene();s.p.bench=[s.slot('xy10-61','br',0),s.slot('friend','fb',1)];
 assert.ok(fx.attackIsPrevented(s.state,'player',s.p.bench[1],s.o.active,s.ctx.cardById));
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.bench[1],s.o.active,s.ctx.cardById),true);
 assert.equal(fx.attackIsPrevented(s.state,'player',s.p.active,s.o.active,s.ctx.cardById),null);
 assert.equal(fx.attackIsPrevented(s.state,'player',s.p.bench[1],s.p.active,s.ctx.cardById),null,'own attack cannot be blocked');
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.bench[1],s.p.active,s.ctx.cardById),false);
 s.p.bench[0].abilitySuppressed=true;
 assert.equal(fx.attackIsPrevented(s.state,'player',s.p.bench[1],s.o.active,s.ctx.cardById),null);
 assert.equal(fx.attackEffectsPrevented(s.state,'player',s.p.bench[1],s.o.active,s.ctx.cardById),false);
});
test('Omastar BREAK switches only selected opposing Benched EX; forged non-EX selection is rejected',()=>{
 const s=scene();s.p.active=s.slot('omni','om');s.ctx.attacker=s.p.active;
 s.o.bench=[s.slot('water','w',0),s.slot('ex','e',1)];const e=m.abilities['Dangerous Tentacle'].effect;
 assert.equal(m.abilities['Dangerous Tentacle'].oncePerTurn,true);
 assert.equal(fx.choicesForEffect(e,s.ctx).length,1);
 fx.applyEffect(e,s.ctx);assert.deepEqual(s.choices[0].filter,{isEx:true});
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.o.active.uid,'o');
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:1}});
 assert.equal(s.o.active.uid,'e');
});
test('Mothim Wormadam First transfers exactly one existing 10-damage counter by source and destination choice',()=>{
 const s=scene(),e=m.abilities['Wormadam First'].effect;
 s.p.active=s.slot('moth','m');s.ctx.attacker=s.p.active;
 s.p.bench=[s.slot('worm','w',0),s.slot('friend','f',1)];
 assert.equal(fx.choicesForEffect(e,s.ctx).length,0,'No damaged Wormadam means no action');
 s.p.bench[0].damage=40;
 assert.equal(fx.choicesForEffect(e,s.ctx).length,1);
 fx.applyEffect(e,s.ctx);assert.deepEqual(s.choices.at(-1).allowedUids,['w']);
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.deepEqual(s.choices.at(-1).excludeUids,['w']);
 fx.applyEffect({...e,stage:'destination',sourceUid:'w'},{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:1}});
 assert.equal(s.p.bench[0].damage,30);assert.equal(s.p.bench[1].damage,10);
});
test('Kingdra Dragon Trail counts only actual Basic Lightning attached, not Special Energy or Energy Zone',()=>{
 const s=scene(),e=m.attacks['73:Dragon Trail'],attack={name:'Dragon Trail',damage:60,effect:e};
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,60);
 s.p.active.energy.Lightning=2;
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,120);
 s.p.active.specialEnergy=[{uid:'double',cardId:'prism',provides:{Lightning:2}}];
 s.p.energySupply=['Lightning','Lightning'];
 assert.equal(fx.resolveAttack(attack,s.ctx).damage,120,'Special and unused Zone Energy must not count as basic');
});
test('Whimsicott Light Steps chooses energy and Bench recipient, preserving Special Energy physical UID',()=>{
 const s=scene(),e=m.attacks['71:Light Steps'];s.p.bench=[s.slot('friend','f',0)];s.p.active.energy.Fairy=1;
 s.p.active.specialEnergy=[{uid:'special-1',cardId:'prism',provides:{Colorless:2}}];
 fx.applyEffect(e,s.ctx);assert.equal(s.choices.at(-1).kind,'option');assert.equal(s.choices.at(-1).options.length,2);
 fx.applyEffect(e,{...s.ctx,resolvingChoice:true,action:{choiceOption:1}});
 assert.equal(s.choices.at(-1).kind,'pokemon');
 fx.applyEffect({...e,stage:'bench',energyKey:'special:special-1'},{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.p.active.specialEnergy.length,0);assert.deepEqual(s.p.bench[0].specialEnergy.map(x=>x.uid),['special-1']);
 fx.applyEffect({...e,stage:'bench',energyKey:'basic:Fairy'},{...s.ctx,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(s.p.active.energy.Fairy,0);assert.equal(s.p.bench[0].energy.Fairy,1);
});
test('Stage 4 generator enables these seven prints and a legal Restored Pokémon',()=>{
 const code=String.raw`import sys,json,importlib.util;sys.path.insert(0,sys.argv[1]);sp=importlib.util.spec_from_file_location('b',sys.argv[2]);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def p(n,name,stage,atks,abilities=[]):return [n,name,'Pokémon',[stage],120,['Water'],None,atks,abilities,'Grass',None,1,'Rare',[],None,None]
rows=[p('4','Mothim','Stage 1',[['Gust',['C'],'60','']],[['Wormadam First','Ability','Once per turn move one counter']]),p('19','Omastar BREAK','BREAK',[],[['Dangerous Tentacle','Ability','Switch opposing Benched Pokémon-EX']]),p('23','Barbaracle','Stage 1',[['Claw Slash',['F'],'70','']],[['Hand Block','Ability','Lock Special Energy with Stadium']]),p('61','Bronzong','Stage 1',[['Guard Press',['M','C'],'60','Reduce next attack damage by 20']],[['Metal Fortress','Ability','Protect Bench']]),p('71','Whimsicott','Stage 1',[['Light Steps',['Y'],'40','Move an Energy from this Pokémon']]),p('73','Kingdra-EX','Basic',[['Big Storm',['W'],'20','Discard stadium'],['Dragon Trail',['W'],'60+','Lightning bonus']]),p('122','Kingdra-EX','Basic',[['Big Storm',['W'],'20','Discard stadium'],['Dragon Trail',['W'],'60+','Lightning bonus']]),p('17','Omanyte','Restored',[['Water Gun',['W'],'30','']])]
cs=m.generate(rows);print(json.dumps([(c['number'],c['battleEnabled']) for c in cs]))`;
 const x=spawnSync('python3',['-c',code,path.join(root,'scripts'),path.join(root,'scripts/build-xy10.py')],{encoding:'utf8'});
 assert.equal(x.status,0,x.stderr);assert.deepEqual(JSON.parse(x.stdout),[['4',true],['19',true],['23',true],['61',true],['71',true],['73',true],['122',true],['17',true]]);
});
