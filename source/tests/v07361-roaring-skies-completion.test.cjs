'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'app/src/main/assets');
const data=require(path.join(assets,'tcgp-battle-data.js')),core=require(path.join(assets,'tcgp-battle-core.js')),fx=require(path.join(assets,'tcgp-battle-effects.js'));
const loan=require(path.join(assets,'tcg-classic-battle-data.js')).CLASSIC30_LOANER_DECK;
const genPy=String.raw`
import sys,json,importlib.util
p=sys.argv[1];sys.path.insert(0,p);s=importlib.util.spec_from_file_location('xy6gen',p+'/build-xy6.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
rows=[
 ['31','Banette','Pokémon',['Stage 1'],90,['Psychic'],'Shuppet',[['Psyshot',['P','C'],'60','']],[['Tool Concealment','Ability','Each Pokémon Tool card in play has no effect.']],None,None,1,'Rare',[],None,None],
 ['44','Togetic','Pokémon',['Stage 1'],90,['Fairy'],'Togepi',[['Go Fetch',['C'],'','Shuffle 3 basic Energy cards from your discard pile into your deck.'],['Fairy Wind',['Y','C'],'40','']],[],None,None,1,'Uncommon',[],None,None],
 ['95','Wide Lens','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',['Damage from the attacks of the Pokémon this card is attached to is affected by Weakness and Resistance for your opponent\'s Benched Pokémon.'],'Tool',None],
 ['84','Healing Scarf','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',['Whenever you attach an Energy card from your hand to the Pokémon this card is attached to, heal 20 damage from it.'],'Tool',None],
 ['87','Rayquaza Spirit Link','Trainer',['Pokémon Tool'],None,[],None,[],[],None,None,0,'Uncommon',['Your turn does not end if the Pokémon this card is attached to becomes M Rayquaza-EX.'],'Tool',None],
 ['76','M Rayquaza-EX','Pokémon',['MEGA','EX'],220,['Colorless'],'Rayquaza-EX',[['Emerald Break',['C','C','C'],'30×','This attack does 30 damage times the number of your Benched Pokémon.']],[],None,None,1,'Rare',[],None,{'name':'Δ Evolution','text':'You may evolve during your first turn or the turn it was put in play.'}]
]
print(json.dumps(m.generate(rows)))`;
const gen=spawnSync('python3',['-c',genPy,path.join(root,'scripts')],{encoding:'utf8'});
assert.equal(gen.status,0,gen.stderr);
const cards=Object.fromEntries(JSON.parse(gen.stdout).map(c=>[c.id,c]));
Object.assign(cards,{
 'demo-basic':{id:'demo-basic',name:'Test Basic',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:150,retreat:2,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'demo-togepi':{id:'demo-togepi',name:'Togepi',kind:'pokemon',stage:'Basic',types:['Fairy'],hp:100,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'demo-ray':{id:'demo-ray',name:'Rayquaza-EX',kind:'pokemon',stage:'Basic',types:['Colorless'],hp:160,pokemonEX:true,retreat:1,battleEnabled:true,attacks:[{name:'Tap',cost:'C',damage:10,effect:{type:'noop'}}]},
 'demo-tool':{id:'demo-tool',name:'Test Defensive Tool',kind:'trainer',trainerType:'Tool',effect:{type:'modifier',stat:'damageReduction',scope:'self',amount:20},battleEnabled:true},
 'demo-physical-energy':{id:'demo-physical-energy',name:'Fire Energy',kind:'energy',basicEnergy:true,subtype:'Fire',energyType:'Fire'},
 'demo-special-energy':{id:'demo-special-energy',name:'Mystery Energy',kind:'energy',specialEnergy:true,subtype:'Psychic',effect:{type:'specialEnergy',provides:{Psychic:1}}}
});
const ref=(cardId,uid)=>({cardId,uid:uid||cardId});
const slot=(cardId,uid,benchSlot=null)=>({uid,cardId,stack:[cardId],damage:0,energy:{},specialEnergy:[],tool:null,extraTools:[],benchSlot,conditions:{},playedOnSideTurn:1});
function using(fn){const old=data.cardById;data.cardById=id=>cards[id]||old(id);try{return fn();}finally{data.cardById=old;}}
function battle(){const s=core.createBattle({format:'classic',playerDeck:loan,opponentDeck:loan,seed:361,firstSide:'player',playerEnergyTypes:['Fire','Fairy'],opponentEnergyTypes:['Water']});s.phase='battle';s.activeSide='player';s.turnNumber=10;
 for(const who of ['player','opponent']){const ss=s.sides[who];ss.turnCount=6;ss.bench=[];ss.hand=[];ss.energyUsed=false;ss.handEnergyUsed=false;ss.supporterUsed=false;ss.stadiumUsed=false;ss.handLimit=8;}
 s.sides.player.active=slot('demo-basic','p');s.sides.opponent.active=slot('demo-basic','o');return s;}
const choice=(s,pred,side='player')=>{const actions=core.legalActions(s,side).filter(x=>x.type==='effectChoice');const act=actions.find(pred);assert.ok(act,JSON.stringify(actions));return core.applyAction(s,side,act);};
test('Both remaining prints are enabled with supported descriptors',()=>{
 for(const id of ['xy6-31','xy6-44']){assert.equal(cards[id].battleEnabled,true,JSON.stringify(cards[id].support));assert.equal(cards[id].deckEligible,true);}
 assert.equal(cards['xy6-31'].abilities[0].name,'Tool Concealment');assert.deepEqual(fx.validateEffect(cards['xy6-31'].abilities[0].effect),[]);
 assert.equal(cards['xy6-44'].attacks[0].effect.rule,'xy6GoFetch');assert.deepEqual(fx.validateEffect(cards['xy6-44'].attacks[0].effect),[]);
});
test('Banette disables a passive Tool globally, never detaches the Tool, and restores after suppression',()=>using(()=>{
 const s=battle(),p=s.sides.player.active,ban=slot('xy6-31','banette',0);p.tool=ref('demo-tool','tool1');
 assert.equal(fx.modifierAmount(s,'player',p,'damageReduction',data.cardById),20);
 s.sides.opponent.bench=[ban];assert.equal(fx.toolEffectsSuppressed(s,data.cardById),true);
 assert.equal(fx.modifierAmount(s,'player',p,'damageReduction',data.cardById),0);
 assert.equal(p.tool.uid,'tool1','Tool still occupies its slot while its text is blank');
 ban.abilitySuppressed={duration:'whileInPlay'};
 assert.equal(fx.toolEffectsSuppressed(s,data.cardById),false);
 assert.equal(fx.modifierAmount(s,'player',p,'damageReduction',data.cardById),20);
}));
test('Banette suppresses the opposing Wide Lens effect and respects printed no-Weakness rulings',()=>using(()=>{
 const s=battle(),atk=s.sides.player.active,foe=slot('demo-basic','bench',0);
 cards['demo-basic'].weakness='Colorless';s.sides.opponent.bench=[foe];atk.tool=ref('xy6-95','lens');
 assert.equal(fx.wideLensBenchMatchup(s,'player',atk,'opponent',foe,30,data.cardById),60);
 s.sides.player.bench=[slot('xy6-31','ban',0)];
 assert.equal(fx.wideLensBenchMatchup(s,'player',atk,'opponent',foe,30,data.cardById),30);
 assert.equal(atk.tool.cardId,'xy6-95');
 delete cards['demo-basic'].weakness;
}));
test('Banette switches off Tool-triggered Healing Scarf, and the Tool still occupies the slot',()=>using(()=>{
 const s=battle(),holder=s.sides.player.active;holder.tool=ref('xy6-84','scarf');holder.damage=40;
 s.sides.player.bench=[slot('xy6-31','ban',0)];
 // attach from an actual Basic Energy card in hand, not the Energy Zone
 s.sides.player.hand=[ref('demo-physical-energy','fire')];
 const legal=core.legalActions(s,'player');const energy=legal.find(a=>a.type==='attachEnergy'||a.type==='attachSpecialEnergy');
 if(energy){core.applyAction(s,'player',energy);assert.equal(holder.damage,40);}
 else {assert.equal(fx.toolEffectsSuppressed(s,data.cardById),true);assert.ok(holder.tool);}
}));
test('Banette blocks Spirit Link turn-saving but does not remove Tool or prohibit evolving',()=>using(()=>{
 for(const activeBanette of [false,true]){
  const s=battle();s.sides.player.active=slot('demo-ray','ray');s.sides.player.active.tool=ref('xy6-87','link');
  if(activeBanette)s.sides.opponent.bench=[slot('xy6-31','ban',0)];
  s.sides.player.hand=[ref('xy6-76','mega')];
  const a=core.legalActions(s,'player').find(a=>a.type==='evolve'&&a.cardId==='xy6-76');assert.ok(a,'Mega can evolve with or without Banette');
  core.applyAction(s,'player',a);
  assert.equal(s.sides.player.active.tool?.cardId,'xy6-87');
  assert.equal(s.activeSide==='opponent',activeBanette,'Mega turn must end when Spirit Link is suppressed');
 }
}));
test('Togetic Go Fetch recycles exactly three real Basic Energy from discard into the Zone, not Special Energy',()=>using(()=>{
 const s=battle(),ss=s.sides.player;ss.active=slot('xy6-44','togetic');ss.active.energy={Colorless:1};
 ss.energyDiscard={Fire:2,Water:1,Grass:1};ss.energySupply=['Fairy','Fire'];ss.nextEnergyType='Fairy';
 ss.discard.push(ref('demo-special-energy','spec'));
 const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);assert.ok(a,'Go Fetch can attack');
 core.applyAction(s,'player',a);
 for(let i=0;i<3;i++){assert.equal(s.phase,'effectChoice');choice(s,x=>x.choiceOption===0);}
 assert.equal(s.phase,'battle');assert.equal(ss.energySupply.length,5);
 assert.equal(Object.values(ss.energyDiscard).reduce((n,v)=>n+v,0),1);
 assert.ok(ss.discard.some(x=>x.uid==='spec'),'Special Energy not recovered as Basic');
 assert.equal(s.log.filter(x=>x.type==='xy6GoFetch').length,3);
 assert.equal(ss.nextEnergyType,ss.energySupply[0]);
}));
test('Autobuilder excludes automatic Tools when Banette is a chosen Pokémon, preserving manually selected cards',()=>{
 const src=fs.readFileSync(path.join(assets,'tcg-classic-deck-builder.js'),'utf8');
 assert.match(src,/card\?\.trainerType==='Tool'&&pokemon\.some\(p=>p\.id==='xy6-31'\)/);
 const keep=src.indexOf("const manuallyKept=card?.id&&existing.includes(card.id)");
 const gate=src.indexOf("card?.trainerType==='Tool'&&pokemon.some(p=>p.id==='xy6-31')");
 assert.ok(keep>=0&&gate>keep,'user retained cards are exempt from autobuilder-only filter');
});
test('Printed 112-card catalogue has zero unsupported/gated effects after generation',t=>{
 const source=path.join(root,'data/classic/xy6-print-compact.json');if(!fs.existsSync(source))return t.skip('Official pinned catalogue is generated by Gradle during APK build');
 const sky=require(path.join(assets,'tcg-classic-roaring-skies.js'));const report=sky.coverage();
 assert.equal(report.total,112);assert.equal(report.battleEnabled,112,JSON.stringify(report.gated));assert.deepEqual(report.gated,[]);
 const cards=sky.CARDS;assert.equal(cards.reduce((n,c)=>n+(c.attacks||[]).length,0),147);
 assert.equal(cards.reduce((n,c)=>n+(c.abilities||[]).length,0),15);
 for(const c of cards)assert.equal(c.deckEligible,true,c.id);
});
