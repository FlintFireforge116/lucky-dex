'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const path=require('node:path');
const assets=path.resolve(__dirname,'../app/src/main/assets');
const set=require(path.join(assets,'tcg-classic-unleashed.js'));
const core=require(path.join(assets,'tcgp-battle-core.js'));
const effects=require(path.join(assets,'tcgp-battle-effects.js'));
const db=require(path.join(assets,'tcg-classic-battle-data.js'));
const cpu=require(path.join(assets,'tcg-classic-opponents.js'));
const ID=n=>'hgss2-'+n;
const SLOT=(n,uid)=>core.makePokemonSlot(ID(n),1,uid||n);
function scene(){const d=cpu.generate({sets:['hgss2'],type:'Fire',seed:42});assert.ok(d.ok);const s=core.createBattle({format:'classic',seed:9,firstSide:'player',playerDeck:d.cards,opponentDeck:d.cards,playerEnergyTypes:['Fire','Water','Psychic','Grass'],opponentEnergyTypes:['Fire','Water']});s.phase='battle';s.turnNumber=5;s.activeSide='player';const p=s.sides.player,o=s.sides.opponent;p.turnCount=3;o.turnCount=2;p.active=SLOT('52','magmar');o.active=SLOT('65','defender');p.bench=[];o.bench=[];p.hand=[];o.hand=[];p.discard=[];o.discard=[];p.energyDiscard={};o.energyDiscard={};return s;}
function effect(n,name){const c=set.cardById(ID(n));return (c.attacks||[]).find(a=>a.name===name)?.effect||(c.abilities||[]).find(a=>a.name===name)?.effect||c.effect;}
function resolve(s,e,{source=s.sides.player.active,action={},resolvingChoice=false,isAttack=true,random=()=>.1}={}){
 const out=[],ctx={state:s,side:'player',foeSide:'opponent',attacker:source,defender:s.sides.opponent.active,cardById:db.cardById,action,isAttack,resolvingChoice,random,requestChoice:x=>out.push(x),shuffle:(_s,deck)=>deck.reverse(),drawCard:side=>{if(side.deck.length&&side.hand.length<8)side.hand.push(side.deck.shift());},effectiveEnergy:slot=>slot.energy,onEnergyAttached:()=>{},maxHp:(_side,x)=>db.cardById(x.cardId)?.hp||100};
 effects.applyEffect(e,ctx);return out[0]||null;
}
const rainbow=()=>({uid:'rainbow-1',cardId:'hgss1-104',provides:{Miracle:1}});

test('Ninetales Heat Acceleration attaches all Fire Energy to the same chosen Pokémon',()=>{
 const s=scene(),p=s.sides.player;p.active=SLOT('20','ninetales');p.bench=[SLOT('52','magmar2')];p.energyDiscard.Fire=3;
 let next=resolve(s,effect('20','Heat Acceleration'),{source:p.active});assert.equal(next.kind,'pokemon');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(p.bench[0].benchSlot)}});
 assert.equal(next.kind,'option');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Fire,1);
 assert.equal(next?.kind,'option','the attack must not offer a second Pokémon destination after choosing its one target');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Fire,2);
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(p.bench[0].energy.Fire,3);assert.equal(p.active.energy.Fire||0,0);assert.equal(p.energyDiscard.Fire,0);
});

test('Jirachi Time Hollow can remove only one highest evolution from each selected opponent Pokémon',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=SLOT('1','jirachi');p.active.energy.Psychic=2;
 o.active=SLOT('84','crobat');o.active.stack=[ID('70'),ID('30'),ID('84')];o.bench=[SLOT('27','ursaring')];o.bench[0].stack=[ID('65'),ID('27')];
 let next=resolve(s,effect('1','Time Hollow'),{source:p.active});assert.equal(next.kind,'pokemon');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(o.active.cardId,ID('30'));assert.equal(o.hand.length,1);assert.equal(next.kind,'pokemon');
 resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'active'}});
 assert.equal(o.active.cardId,ID('30'),'must not remove a second evolution from the same Pokémon');
 assert.equal(o.hand.length,1);
});

test('Hydro Launcher accepts the effective Water from Rainbow Energy and returns two physical attachments',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=SLOT('13','blastoise');p.active.energy.Water=1;p.active.specialEnergy.push(rainbow());
 o.bench=[SLOT('65','target')];
 let next=resolve(s,effect('13','Hydro Launcher'),{source:p.active});assert.equal(next?.kind,'option','Water+Rainbow is two Water Energy cards');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(next?.kind,'option');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceOption:0}});
 assert.equal(next?.kind,'pokemon');
 resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:0}});
 assert.equal(o.bench[0].damage,100);
 assert.equal(p.active.energy.Water,0);assert.equal(p.active.specialEnergy.length,0);
 assert.deepEqual(new Set(p.hand.map(r=>r.cardId)),new Set(['hgss1-104','dp1-125']));
});

test('Torrent Blade accepts Rainbow Energy as the second Water Energy and still requires an opponent Bench',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=SLOT('94','legend');p.active.stack=[ID('94'),ID('95')];p.active.energy.Water=1;p.active.specialEnergy.push(rainbow());
 o.bench=[SLOT('65','target')];
 const next=resolve(s,effect('94','Torrent Blade'),{source:p.active});assert.equal(next?.kind,'option');
});

test('Wash Out and Magical Trans are offered when the only attached Water/Psychic is Rainbow Energy',()=>{
 for(const [number,power,subtype] of [['13','Wash Out','Water'],['5','Magical Trans','Psychic']]){
  const s=scene(),p=s.sides.player;p.active=SLOT(number,'source');p.bench=[SLOT('48','sourcebench')];p.bench[0].specialEnergy.push(rainbow());
  const legal=core.legalActions(s,'player');
  assert.ok(legal.some(a=>a.type==='ability'&&a.cardId===ID(number)),`${power} should be offered with Rainbow supplying ${subtype}`);
 }
});


test('Zubat Double Attack chooses two different opponent Bench targets for 10 each',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;p.active=SLOT('70','zubat');o.bench=[SLOT('47','cherubi'),SLOT('48','chinchou')];o.bench[0].benchSlot=0;o.bench[1].benchSlot=1;
 let next=resolve(s,effect('70','Double Attack'),{source:p.active});assert.equal(next.kind,'pokemon');
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[0].benchSlot)}});
 assert.equal(o.bench[0].damage,10);assert.equal(next.kind,'pokemon');assert.ok(next.excludeUids.includes(o.bench[0].uid));
 next=resolve(s,next.effect,{source:p.active,resolvingChoice:true,action:{choiceTarget:'bench',choiceBenchIndex:Number(o.bench[1].benchSlot)}});
 assert.equal(o.bench[1].damage,10);assert.equal(o.active.damage,0);assert.equal(next,null);
});

test('Every HGSS2 custom rule is handled by the executable engine, not just declared supported',()=>{
 const fs=require('node:fs'),engine=fs.readFileSync(path.join(assets,'tcgp-battle-effects.js'),'utf8');
 const used=[];
 const walk=x=>{if(!x||typeof x!=='object')return;if(Array.isArray(x))return x.forEach(walk);if(x.type==='neoRule'&&String(x.rule||'').startsWith('hgss2:'))used.push(x.rule.slice(6));for(const [k,v] of Object.entries(x))if(k!=='rule'&&typeof v==='object')walk(v);};
 for(const c of set.CARDS){walk(c.attacks);walk(c.abilities);if(c.kind==='trainer')walk(c.effect);}
 assert.ok(used.length>20,'should exercise all distinct HGSS2 rule declarations');
 for(const key of new Set(used))assert.ok(engine.includes("key==='"+key+"'"),`Unimplemented HGSS2 rule: ${key}`);
});

test('Independently seeded HGSS2 CPU decks are legal across all supported types, with no orphan evolutions or LEGEND halves',()=>{
 for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Colorless'])for(let seed=1;seed<=12;seed++){
  const r=cpu.generate({sets:['hgss2'],type,seed});assert.ok(r.ok,`${type} seed ${seed}: ${r.error}`);
  assert.equal(r.cards.length,30);assert.ok(db.validateDeck(r.cards).ok);
  const count=id=>r.cards.filter(x=>x===id).length;for(const [a,b] of [['90','91'],['92','93'],['94','95']])assert.equal(count(ID(a)),count(ID(b)),`${type}/${seed} unmatched LEGEND`);
  const names=new Set(r.cards.map(x=>db.cardById(x)?.name));for(const id of r.cards){const c=db.cardById(id);assert.equal(c.setId,'hgss2');if(c.evolvesFrom)assert.ok(names.has(c.evolvesFrom),`${type}/${seed} missing parent ${c.evolvesFrom}`);}
 }
});

test('HGSS2 PlusPower applies +10 before weakness as printed, not after',()=>{
 const s=scene(),p=s.sides.player,o=s.sides.opponent;
 p.active=SLOT('52','magmar');p.active.energy.Fire=1;o.active=SLOT('47','cherubi');
 p.hand=[{uid:'pp',cardId:ID('80')}];
 const tool=core.legalActions(s,'player').find(a=>a.type==='trainer'&&a.cardId===ID('80')&&(a.target==='active'||!a.target));
 assert.ok(tool,'PlusPower must be playable');core.applyAction(s,'player',tool);
 const attack=core.legalActions(s,'player').find(a=>a.type==='attack'&&a.attackIndex===0);assert.ok(attack);
 core.applyAction(s,'player',attack);
 assert.equal(o.active.damage,40,'(10 base +10 PlusPower) ×2 weakness = 40');
});

test('Engineers Adjustments discards a selected physical Energy card from hand, then draws four',()=>{
 const s=scene(),p=s.sides.player;p.hand=[{uid:'heldfire',cardId:'hgss1-116'}];p.deck=[...['47','48','49','50'].map((n,i)=>({uid:'draw-'+i,cardId:ID(n)})),...p.deck];
 const before=p.deck.length;let x=resolve(s,effect('75'));
 assert.equal(x.kind,'handCard');
 resolve(s,x.effect,{resolvingChoice:true,action:{choiceHandIndex:0}});
 assert.equal(p.discard.at(-1).cardId,'hgss1-116');assert.equal(p.hand.length,4);assert.equal(p.deck.length,before-4);
});

test('Hydro Launcher cannot deal its bonus attack without space for two returned physical Energy cards',()=>{
 const s=scene(),p=s.sides.player;p.active=SLOT('13','blastoise');p.active.energy.Water=2;
 p.hand=Array.from({length:7},(_,i)=>({uid:'hand-'+i,cardId:ID('47')}));
 assert.equal(resolve(s,effect('13','Hydro Launcher'),{source:p.active}),null,
 'must not offer a choice when the hand limit prevents both mandatory Energy returns');
});
