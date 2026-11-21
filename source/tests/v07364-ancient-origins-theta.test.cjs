'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js')),
 core=require(path.join(assets,'tcgp-battle-core.js')),
 fx=require(path.join(assets,'tcgp-battle-effects.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const script=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p)
s=importlib.util.spec_from_file_location('xy7',p+'/build-xy7.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[
 ['11','Vespiquen','Pokémon',['Stage 1'],90,['Grass'],'Combee',[['Bee Drain',['G','C'],'20','Heal from this Pokémon the same amount of damage you did to your opponent\'s Active Pokémon.'],['Fury Swipes',['G','C'],'30×','Flip 3 coins. This attack does 30 damage times the number of heads.']],[],None,None,1,'Rare',[],None,{'name':'θ Double','text':'Two Tools'}],
 ['18','Volcarona','Pokémon',['Stage 1'],100,['Fire'],'Larvesta',[['Burning Scales',['R'],'20+','Flip 2 coins. This attack does 20 more damage for each heads.'],['Wind Wheel',['R','C'],'80','Your opponent switches his or her Active Pokémon with 1 of his or her Benched Pokémon.']],[],None,None,2,'Rare',[],None,{'name':'θ Stop','text':'Protect from opposing Abilities'}],
 ['32','Baltoy','Pokémon',['Basic'],60,['Psychic'],None,[['Future Spin',['P'],'','Look at the top 3 cards of either player\'s deck and put them back on top of that player\'s deck in any order.']],[],None,None,1,'Rare',[],None,{'name':'θ Stop','text':'Protect from opposing Abilities'}],
 ['43','M Tyranitar-EX','Pokémon',['MEGA','EX'],240,['Darkness'],'Tyranitar-EX',[['Destroyer King',['D','D','C','C'],'110+','This attack does 60 more damage for each damage counter on your opponent\'s Active Pokémon.']],[],None,None,4,'Rare',[],None,{'name':'θ Double','text':'Two Tools'}],
 ['50','Metagross','Pokémon',['Stage 2'],150,['Metal'],'Metang',[['Machine Gun Stomp',['M','C'],'20+','This attack does 10 more damage for each card in your hand.'],['Guard Press',['M','M','C'],'80','During your opponent\'s next turn, any damage done to this Pokémon by attacks is reduced by 20 (after applying Weakness and Resistance).']],[],None,None,3,'Rare',[],None,{'name':'θ Double','text':'Two Tools'}],
 ['70','Ampharos Spirit Link','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',[],None,None],
 ['80','Sceptile Spirit Link','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',[],None,None],
 ['96','Primal Kyogre-EX','Pokémon',['MEGA','EX'],240,['Water'],'Kyogre-EX',[['Tidal Storm',['W','W','W','C'],'150','Move 2 Energy from this Pokémon to 1 of your Benched Pokémon. This attack does 30 damage to each of your opponent\'s Benched Pokémon-EX.']],[],None,None,3,'Secret',[],None,{'name':'θ Max','text':'Heal all damage on evolution'}],
 ['97','Primal Groudon-EX','Pokémon',['MEGA','EX'],240,['Fighting'],'Groudon-EX',[['Gaia Volcano',['F','F','F','C'],'100+','If there is any Stadium card in play, this attack does 100 more damage. Discard that Stadium card.']],[],None,None,4,'Secret',[],None,{'name':'θ Max','text':'Heal all damage on evolution'}],
 ['98','M Rayquaza-EX','Pokémon',['MEGA','EX'],220,['Colorless'],'Rayquaza-EX',[['Emerald Break',['C','C','C'],'30×','This attack does 30 damage times the number of your Benched Pokémon.']],[],None,None,1,'Secret',[],None,{'name':'θ Max','text':'Heal all damage on evolution'}],
]
print(json.dumps(m.generate(rows)))`;
const generated=spawnSync('python3',['-c',script,path.join(root,'scripts')],{encoding:'utf8',maxBuffer:3*1024*1024});
assert.equal(generated.status,0,generated.stderr);
const cards=Object.fromEntries(JSON.parse(generated.stdout).map(c=>[c.id,c]));
Object.assign(cards,{
 'demo-basic':{id:'demo-basic',name:'Demo Basic',kind:'pokemon',stage:'Basic',hp:150,retreat:1,types:['Colorless'],battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-combee':{id:'demo-combee',name:'Combee',kind:'pokemon',stage:'Basic',hp:80,retreat:1,types:['Grass'],battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-ray':{id:'demo-ray',name:'Rayquaza-EX',kind:'pokemon',stage:'Basic',hp:170,retreat:1,types:['Colorless'],pokemonEX:true,battleEnabled:true,attacks:[{name:'Tap',damage:10,cost:'C',effect:{type:'noop'}}]},
 'demo-ability':{id:'demo-ability',name:'Ability Source',kind:'pokemon',stage:'Basic',hp:110,types:['Psychic'],battleEnabled:true,attacks:[]},
 'xy6-87':{id:'xy6-87',name:'Rayquaza Spirit Link',kind:'trainer',trainerType:'Tool',effect:{type:'noop'},battleEnabled:true}
});
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const mon=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function using(fn){const original=data.cardById;data.cardById=id=>cards[id]||original(id);try{return fn();}finally{data.cardById=original;}}
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:364,firstSide:'player',playerEnergyTypes:['Grass','Darkness'],opponentEnergyTypes:['Psychic']});
 s.phase='battle';s.turnNumber=10;s.activeSide='player';for(const ss of Object.values(s.sides)){ss.turnCount=5;ss.hand=[];ss.bench=[];ss.handLimit=8;ss.supporterUsed=false;ss.handEnergyUsed=false;ss.energyUsed=false;}
 s.sides.player.active=mon('demo-basic','mine');s.sides.opponent.active=mon('demo-ability','foe');return s;}
test('theta traits do not gate cards whose other effects are fully mapped',()=>{
 for(const n of ['11','18','32','43','50','96','97','98'])assert.equal(cards['xy7-'+n].battleEnabled,true,`${n}: ${JSON.stringify(cards['xy7-'+n].support)}`);
 for(const c of Object.values(cards).filter(c=>c.id.startsWith('xy7-')&&c.kind==='pokemon'))for(const a of c.attacks)assert.deepEqual(fx.validateEffect(a.effect),[],c.id+' '+a.name);
});
test('theta Double allows exactly two physical Tools and remains active under Ability suppression',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('xy7-11','bee');p.active.abilitySuppressed={duration:'whileInPlay'};
 p.hand=[ref('xy7-70','link1'),ref('xy7-80','link2')];
 assert.equal(fx.toolCapacity(s,'player',p.active,data.cardById),2);
 const attach=(id)=>{const a=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===id&&a.target==='active');assert.ok(a,'Tool legal: '+id);core.applyAction(s,'player',a);};
 attach('xy7-70');assert.equal(p.active.tool.cardId,'xy7-70');
 attach('xy7-80');assert.deepEqual([p.active.tool,...p.active.extraTools].map(r=>r.cardId),['xy7-70','xy7-80']);
 assert.equal(fx.toolCapacity(s,'player',p.active,data.cardById),2);
 p.hand=[ref('xy7-70','link3')];
 assert.ok(!core.legalActions(s,'player').some(a=>a.cardId==='xy7-70'&&a.target==='active'));
 p.active.cardId='demo-basic';assert.equal(fx.toolCapacity(s,'player',p.active,data.cardById),1);
}));
test('theta Max heals accumulated damage upon Mega/Primal evolution while keeping attachments',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('demo-ray','ray');p.active.damage=80;p.active.energy={Colorless:2};p.active.tool=ref('xy7-70','t');p.hand=[ref('xy7-98','evo')];
 const a=core.legalActions(s,'player').find(x=>x.type==='evolve'&&x.cardId==='xy7-98');assert.ok(a,'M Rayquaza can evolve');
 core.applyAction(s,'player',a);assert.equal(p.active.cardId,'xy7-98');assert.equal(p.active.damage,0);
 assert.equal(p.active.energy.Colorless,2);assert.equal(p.active.tool.uid,'t');
 assert.ok(s.log.some(x=>x.type==='xy7ThetaMax'&&x.healed===80));
}));
test('θ Max reprinted Mega Rayquaza respects its older Spirit Link (and still heals)',()=>using(()=>{
 const s=battle(),p=s.sides.player;p.active=mon('demo-ray','ray');p.active.damage=70;
 p.active.tool=ref('xy6-87','ray-link');p.hand=[ref('xy7-98','mega')];
 const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy7-98');assert.ok(a);
 core.applyAction(s,'player',a);assert.equal(s.activeSide,'player','an active Spirit Link prevents the Mega turn ending');
 assert.equal(p.active.damage,0);assert.equal(p.active.tool.uid,'ray-link');
}));
test('θ Stop protects each target separately during a spread Ability',()=>using(()=>{
 const s=battle(),protectedSlot=mon('xy7-32','theta',0),unprotected=mon('demo-basic','plain',1);
 s.sides.opponent.bench=[protectedSlot,unprotected];
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAbility:true};
 fx.applyEffect({type:'damage',target:'opponentAll',amount:30},ctx);
 assert.equal(protectedSlot.damage,0);assert.equal(unprotected.damage,30);
}));
test('θ Double attachment UI can individually inspect both Tools, even under Banette',()=>{
 const ui=fs.readFileSync(path.join(assets,'tcgp-battle-ui.js'),'utf8');
 assert.match(ui,/slotTools\(slot\)[\s\S]*?extraTools/);
 assert.match(ui,/toolIndex/);
});
test('Autobuilder Spirit Link eligibility follows the new θ Max reprints',()=>{
 const builder=fs.readFileSync(path.join(assets,'tcg-classic-deck-builder.js'),'utf8');
 const engine=fs.readFileSync(path.join(assets,'tcgp-battle-core.js'),'utf8');
 for(const id of ['xy7-96','xy7-97','xy7-98']){assert.ok(builder.includes(id));assert.ok(engine.includes(id));}
});
test('theta Stop protects from opponent Ability damage and conditions but not own Ability',()=>using(()=>{
 const s=battle(),d=s.sides.opponent.active;d.cardId='xy7-18';d.stack=['xy7-18'];
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:d,cardById:data.cardById,isAbility:true};
 fx.applyEffect({type:'damage',target:'opponentActive',amount:30},ctx);
 fx.applyEffect({type:'status',target:'opponentActive',status:'poison'},ctx);
 assert.equal(d.damage,0);assert.deepEqual(d.conditions,{});
 // The protected Pokémon's own Ability still affects it, as do attacks.
 const ownCtx={...ctx,side:'opponent',foeSide:'player',attacker:d,defender:s.sides.player.active};
 fx.applyEffect({type:'heal',target:'self',amount:20},ownCtx); // not a target for θ Stop
 const hitCtx={...ctx,isAbility:false,isAttack:true};fx.applyEffect({type:'damage',target:'opponentActive',amount:20},hitCtx);
 assert.equal(d.damage,20);
}));
test('theta Stop resists an opposing Ability even when its own Abilities are suppressed',()=>using(()=>{
 const s=battle(),d=s.sides.opponent.active;d.cardId='xy7-32';d.abilitySuppressed={duration:'whileInPlay'};
 const ctx={state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:d,cardById:data.cardById,isAbility:true};
 fx.applyEffect({type:'damage',target:'opponentActive',amount:40},ctx);assert.equal(d.damage,0);
}));
test('no unsupported trait print is accidentally made playable by the trait alone',()=>{
 const ver=fs.readFileSync(path.join(root,'scripts/xy7_verified.py'),'utf8');
 assert.match(ver,/TRAITS_IMPLEMENTED=\{'θ Stop','θ Double','θ Max'\}/);
 assert.match(fs.readFileSync(path.join(root,'app/src/main/assets/tcgp-battle-core.js'),'utf8'),/xy7ThetaMax/);
});
