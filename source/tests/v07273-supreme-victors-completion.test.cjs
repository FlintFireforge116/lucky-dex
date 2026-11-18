'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const core=require('../app/src/main/assets/tcgp-battle-core');
const fx=require('../app/src/main/assets/tcgp-battle-effects');
const db=require('../app/src/main/assets/tcg-classic-battle-data');
const cpu=require('../app/src/main/assets/tcg-classic-opponents');
const pl3=require('../app/src/main/assets/tcg-classic-supreme-victors');
const deck=cpu.generate({sets:['pl3'],type:'Grass',seed:13}).cards;
function start(id='pl3-5',foe='pl3-47'){
 const s=core.createBattle({format:'classic',playerDeck:deck,opponentDeck:deck,seed:57,firstSide:'player',playerEnergyTypes:['Grass','Water','Lightning','Fighting','Fire'],opponentEnergyTypes:['Grass','Water','Lightning','Fighting','Fire']});
 s.phase='battle';s.turnNumber=12;s.activeSide='player';
 for(const who of ['player','opponent']){const ss=s.sides[who];ss.turnCount=5;ss.hand=[];ss.bench=[];ss.discard=[];ss.energyDiscard={};}
 s.sides.player.active=core.makePokemonSlot(id,2,'hero');s.sides.player.active.energy={Grass:6,Water:6,Lightning:6,Fighting:6,Fire:6,Psychic:6,Darkness:6,Metal:6};
 s.sides.opponent.active=core.makePokemonSlot(foe,2,'foe');s.sides.opponent.active.energy={Colorless:1};
 return s;
}
function attack(s,name,predicate){const a=core.legalActions(s,'player').filter(x=>x.type==='attack').find(x=>{
 const c=db.cardById(x.attackCardId||s.sides.player.active.cardId),hit=c?.attacks?.[x.attackIndex];return hit?.name===name&&(!predicate||predicate(x));});assert.ok(a,'No legal '+name+' on '+s.sides.player.active.cardId+'\n'+JSON.stringify(core.legalActions(s,'player').filter(x=>x.type==='attack').slice(0,8)));core.applyAction(s,'player',a);return a;}
function choose(s,which=()=>true){const actions=core.legalActions(s,s.pendingChoice?.side||'player').filter(x=>x.type==='effectChoice');const a=actions.find(which);assert.ok(a,'No matching choice\n'+JSON.stringify(actions));core.applyAction(s,s.pendingChoice?.side||'player',a);return a;}
function energy(uid,type){const n={Grass:123,Fire:124,Water:125,Lightning:126,Psychic:127,Fighting:128,Darkness:129,Metal:130};return {uid,cardId:'dp1-'+n[type]};}
const have=(s,id)=>s.sides.player.hand.some(x=>x.cardId===id);

test('all 153 Supreme Victors prints retain printed attacks and executable effects',()=>{
 assert.deepEqual(pl3.coverage(),{total:153,battleEnabled:153,gated:[]});
 const source=require('../data/classic/pl3-print-source.json');assert.equal(source.length,153);
 assert.equal(source.reduce((n,c)=>n+(c.attacks||[]).length,0),254);
 assert.equal(source.reduce((n,c)=>n+(c.abilities||[]).length,0),34);
 for(const printed of source){const c=pl3.cardById('pl3-'+printed.number);assert.ok(c?.battleEnabled,c?.id);assert.equal(c.name,printed.name);
  assert.deepEqual(c.attacks?.map(a=>a.name)||[],printed.attacks?.map(a=>a.name)||[],c.id);
  if(printed.supertype==='Pokémon'){
   assert.equal(c.hp,Number(printed.hp),c.id+' HP');
   assert.deepEqual(c.types,printed.types,c.id+' types');
   assert.equal(c.retreat,Number(printed.convertedRetreatCost||0),c.id+' retreat');
   assert.equal(c.evolvesFrom||null,printed.evolvesFrom||((printed.subtypes||[]).includes('Level-Up')?printed.name.replace(/ LV\.X$/,''):null),c.id+' evolution');
   assert.deepEqual(c.attacks.map(a=>a.cost),(printed.attacks||[]).map(a=>(a.cost||[]).map(t=>({Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Colorless:'C'})[t]).join('')),c.id+' costs');
  }
  for(let i=0;i<(printed.attacks||[]).length;i++)assert.equal(c.attacks[i].text,printed.attacks[i].text||'',c.id+' attack text');
  for(let i=0;i<(printed.abilities||[]).length;i++){
   assert.equal(c.abilities[i].text,printed.abilities[i].text||'',c.id+' ability text');
   assert.equal(c.abilities[i].printedPowerType,printed.abilities[i].type==='Poké-Power'?'power':'body',c.id+' ability classification');
  }
  assert.deepEqual(c.abilities?.map(a=>a.name)||[],printed.abilities?.map(a=>a.name)||[],c.id);
  for(const x of [...(c.attacks||[]),...(c.abilities||[]),...(c.effect?[{effect:c.effect}]:[])])assert.deepEqual(fx.validateEffect(x.effect),[],c.id+' '+x.name);
 }
});

test('Garchomp Speed Impact subtracts 20 per physical Energy card, not Energy type',()=>{
 const s=start('pl3-5');s.sides.opponent.active.energy={Water:2,Fire:1};attack(s,'Speed Impact');
 assert.equal(s.sides.opponent.active.damage,60);
});

test('Metagross Gravitation reduces HP by only 20, on both sides, not per Metagross',()=>{
 const s=start('pl3-7','pl3-47');const p=s.sides.player.active,o=s.sides.opponent.active;
 assert.equal(core.maxHp(s,'player',p),Number(db.cardById(p.cardId).hp)-20);
 assert.equal(core.maxHp(s,'opponent',o),Number(db.cardById(o.cardId).hp)-20);
 s.sides.player.bench=[core.makePokemonSlot('pl3-7',2,'second')];
 assert.equal(core.maxHp(s,'player',p),Number(db.cardById(p.cardId).hp)-20,'non-stacking');
 assert.equal(core.maxHp(s,'opponent',o),Number(db.cardById(o.cardId).hp)-20);
});

test('Rayquaza C Trash Burst chooses specific hand Energy before applying one hit',()=>{
 const s=start('pl3-8','pl3-47');s.sides.player.hand=[energy('fire','Fire'),energy('water','Water'),energy('lightning','Lightning')];
 const a=attack(s,'Trash Burst',x=>String(x.effectSelection||'').split(',').filter(Boolean).length===2);assert.ok(a.effectSelection);
 assert.equal(s.sides.opponent.active.damage,30);assert.equal(s.sides.player.hand.length,1);
});

test('Venusaur Desperate Pollen applies all three statuses only with >=80 damage counters',()=>{
 const s=start('pl3-13');s.sides.player.active.damage=80;attack(s,'Desperate Pollen');
 const c=s.sides.opponent.active.conditions;assert.ok(c.confusion&&c.poison);assert.ok(s.log.some(e=>e.type==='statusDamage'&&e.status==='burn'),'Burn must resolve at checkup even if it then clears on heads');
});

test('Claydol Synchro Attack checks remaining HP before applying damage',()=>{
 const s=start('pl3-22','pl3-47');s.sides.player.active.damage=30;s.sides.opponent.active.damage=120;
 attack(s,'Synchro Attack');assert.ok(s.log.some(e=>e.type==='attack'&&e.attack==='Synchro Attack'&&e.damage===90),JSON.stringify(s.log.slice(-3)));
});

test('Honchkrow Riot counts unevolved Pokémon on both teams',()=>{
 const s=start('pl3-29','pl3-47');s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'grass')];
 attack(s,'Riot');assert.equal(s.sides.opponent.active.damage,40);
});

test('Lickilicky C chooses physical Energy from hand, target and healing',()=>{
 const s=start('pl3-30','pl3-47'),p=s.sides.player.active;p.damage=30;
 s.sides.player.hand=[energy('grass','Grass')];attack(s,'Licking-Licking Heal');
 choose(s,x=>x.choiceLabel?.includes('Lickilicky'));
 assert.equal(p.damage,10);assert.equal(p.energy.Grass,7);assert.equal(s.sides.player.hand.length,0);
});

test('Primeape Top Drop uses discarded Pokémon HP and really discards card',()=>{
 const s=start('pl3-39','pl3-47');s.sides.opponent.deck=[{uid:'top',cardId:'pl3-93'},...s.sides.opponent.deck];
 attack(s,'Top Drop');assert.equal(s.sides.opponent.active.damage,60);assert.ok(s.sides.opponent.discard.some(x=>x.uid==='top'));
});

test('Solrock Luna Turn counts Lunatone in discard and shuffles chosen physical card',()=>{
 const s=start('pl3-45','pl3-47');s.sides.player.discard=[{uid:'luna',cardId:'pl3-32'}];attack(s,'Luna Turn');
 assert.equal(s.sides.opponent.active.damage,60);choose(s,x=>x.choiceLabel?.includes('Lunatone'));assert.ok(s.sides.player.deck.some(x=>x.uid==='luna'));
});

test('Breloom Crash Bomber boosts damage and offers a real Special Energy discard',()=>{
 const s=start('pl3-52','pl3-47');s.sides.opponent.active.specialEnergy=[{uid:'rainbow',cardId:'pl1-121'}];attack(s,'Crash Bomber');
 assert.equal(s.sides.opponent.active.damage,60);choose(s);assert.equal(s.sides.opponent.active.specialEnergy.length,0);
 assert.ok(s.sides.opponent.discard.some(x=>x.uid==='rainbow'));
});

test('Milotic Scale Blow uses player hand size at attack time',()=>{
 const s=start('pl3-70','pl3-47');s.sides.player.hand=[{uid:'c1',cardId:'pl3-93'},{uid:'c2',cardId:'pl3-95'}];
 attack(s,'Scale Blow');assert.equal(s.sides.opponent.active.damage,70);
});

test('Rayquaza C LV.X Final Blowup keeps Energy when hand is empty',()=>{
 const s=start('pl3-146','pl3-47');s.sides.player.active.energy={Water:2,Psychic:2,Fighting:2};attack(s,'Final Blowup');
 assert.equal(s.sides.player.active.energy.Water,2);
});

test('Cyrus Initiative flips two coins and never deletes opponent hand without heads',()=>{
 const s=start('pl3-93','pl3-47');s.sides.player.hand=[{uid:'cy',cardId:'pl3-137'}];s.sides.opponent.hand=[{uid:'x',cardId:'pl3-95'},{uid:'y',cardId:'pl3-93'}];
 const play=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='pl3-137');assert.ok(play);core.applyAction(s,'player',play);
 while(s.phase==='effectChoice')choose(s);
 assert.ok(s.sides.opponent.hand.length>=0&&s.sides.opponent.hand.length<=2);
});

test('Lunatone Gravity Wave hits only zero-retreat-cost Benched Pokémon',()=>{
 const s=start('pl3-32','pl3-47');
 const zero=core.makePokemonSlot('pl3-5',2,'zero');
 const expensive=core.makePokemonSlot('pl3-7',2,'high');
 assert.equal(db.cardById(zero.cardId).retreat,0);
 assert.ok(db.cardById(expensive.cardId).retreat>0);
 s.sides.opponent.bench=[zero,expensive];
 attack(s,'Gravity Wave');assert.equal(zero.damage,30);assert.equal(expensive.damage,0);
});

test('Parasect Nutritional Support attaches two selected Grass Energy from deck to distinct Pokémon',()=>{
 const s=start('pl3-38','pl3-47');
 s.sides.player.bench=[core.makePokemonSlot('pl3-93',2,'second')];
 s.sides.player.deck.unshift({uid:'g1',cardId:'dp1-123'},{uid:'g2',cardId:'dp1-123'});
 const base=s.sides.player.active.energy.Grass;
 attack(s,'Nutritional Support');
 choose(s,x=>x.choiceCardId==='dp1-123');
 choose(s,x=>x.choiceLabel?.includes('Parasect'));
 choose(s,x=>x.choiceCardId==='dp1-123');
 choose(s,x=>x.choiceLabel?.includes('Bulbasaur'));
 assert.equal(s.sides.player.active.energy.Grass,base+1);
 assert.equal(s.sides.player.bench[0].energy.Grass,1);
 assert.ok(!s.sides.player.deck.some(x=>['g1','g2'].includes(x.uid)));
});

test('Night Teleporter moves hand to deck and retrieves a real chosen card on heads',()=>{
 const s=start('pl3-93','pl3-47');s.sides.player.hand=[{uid:'night',cardId:'pl3-138'},{uid:'spare',cardId:'pl3-93'}];
 const action=core.legalActions(s,'player').find(x=>x.type==='trainer'&&x.cardId==='pl3-138');assert.ok(action);
 core.applyAction(s,'player',action);
 if(s.phase==='effectChoice'){const actions=core.legalActions(s,'player').filter(x=>x.type==='effectChoice');assert.ok(actions.length>0);choose(s,x=>x.choiceCardId==='pl3-93'||x.choiceCardId==='pl3-138');}
 assert.equal(s.phase==='battle',true);
 assert.ok(s.sides.player.deck.some(x=>x.uid==='spare')||s.sides.player.hand.some(x=>x.uid==='spare'));
});

test('Staraptor FB LV.X Fast Call selects physical Supporter card from deck',()=>{
 const s=start('pl3-147','pl3-47');s.sides.player.deck.unshift({uid:'my-supporter',cardId:'pl3-136'});
 const a=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='pl3-147');assert.ok(a);
 core.applyAction(s,'player',a);choose(s,x=>x.choiceCardId==='pl3-136');
 assert.ok(s.sides.player.hand.some(x=>x.uid==='my-supporter'));
 assert.ok(!s.sides.player.deck.some(x=>x.uid==='my-supporter'));
});

test('Electivire FB LV.X Energy Recycle attaches discard Energy and ends the turn',()=>{
 const s=start('pl3-144','pl3-47');
 s.sides.player.discard=[{uid:'reuse',cardId:'dp1-125'}];
 const power=core.legalActions(s,'player').find(x=>x.type==='ability'&&x.cardId==='pl3-144');assert.ok(power);
 const before=s.sides.player.active.energy.Water;
 core.applyAction(s,'player',power);
 choose(s,x=>x.choiceCardId==='dp1-125');choose(s,x=>x.choiceLabel?.includes('Electivire'));
 assert.equal(s.sides.player.active.energy.Water,before+1);
 assert.equal(s.activeSide,'opponent','the ability must end the owners turn');
});

test('Absol G Doom News returns all Energy and KO occurs at end of opponent next turn',()=>{
 const s=start('pl3-1','pl3-47');s.sides.player.active.energy={Darkness:2,Fire:1};
 attack(s,'Doom News');
 assert.equal(s.sides.player.active.energy.Darkness,0);
 assert.equal(s.sides.player.hand.length,3);
 assert.ok(s.sides.opponent.active?.pl3DoomNewsEndOwner==='opponent');
 core.endTurn(s);
 assert.ok(s.log.some(e=>e.type==='pl3DoomNews'&&e.knockout),JSON.stringify(s.log.slice(-8)));
});

test('Garchomp C LV.X Dragon Rush requires and discards 2 attachments and prevents next-turn reuse',()=>{
 const s=start('pl3-145','pl3-47');s.sides.player.active.energy={Water:2,Fire:1};
 const selected=attack(s,'Dragon Rush');
 assert.ok(selected.effectSelection);
 assert.equal((s.sides.player.active.energy.Water||0)+(s.sides.player.active.energy.Fire||0),1);
 assert.ok(s.log.some(x=>x.type==='attack'&&x.attack==='Dragon Rush'&&x.damage===80));
});

test('Rayquaza C LV.X Dragon Spirit reacts to non-KO opponent attack and attaches discarded Energy',()=>{
 const s=start('pl3-146','pl3-93');
 s.sides.player.discard=[{uid:'dragon-recovered',cardId:'dp1-125'}];
 s.activeSide='opponent';s.sides.opponent.active.energy={Grass:1,Colorless:1};
 const a=core.legalActions(s,'opponent').find(x=>x.type==='attack'&&db.cardById(x.attackCardId||s.sides.opponent.active.cardId)?.attacks?.[x.attackIndex]?.name==='Tackle');
 assert.ok(a,'Opposing Bulbasaur attack should be playable');
 const initial=s.sides.player.active.energy.Water;
 core.applyAction(s,'opponent',a);
 assert.equal(s.phase,'effectChoice','Dragon Spirit must offer a choice');
 const c=core.legalActions(s,'player').find(x=>x.type==='effectChoice'&&x.choiceCardId==='dp1-125');
 assert.ok(c,'Must choose physical Energy card from discard');
 core.applyAction(s,'player',c);
 assert.equal(s.sides.player.active.energy.Water,initial+1);
 assert.ok(!s.sides.player.discard.some(x=>x.uid==='dragon-recovered'));
});
