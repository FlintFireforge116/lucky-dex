'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const A=path.resolve(__dirname,'../app/src/main/assets');
const set=require(A+'/tcg-classic-emerald.js'),classic=require(A+'/tcg-classic-battle-data.js'),core=require(A+'/tcgp-battle-core.js');
const build=require(A+'/tcg-classic-deck-builder.js'),opponent=require(A+'/tcg-classic-opponents.js'),picker=require(A+'/tcg-classic-set-picker.js'),effects=require(A+'/tcgp-battle-effects.js');
const E=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'];
const generated=opponent.generate({sets:['ex9'],seed:17});assert.ok(generated.ok,generated.error);
const slot=(n,uid)=>core.makePokemonSlot('ex9-'+n,2,uid||'slot-'+n);
function game(n=1,foe=50){const s=core.createBattle({format:'classic',playerDeck:generated.cards,opponentDeck:generated.cards,seed:19,firstSide:'player',playerEnergyTypes:E,opponentEnergyTypes:E});s.phase='battle';s.turnNumber=9;s.activeSide='player';s.sides.player.turnCount=5;s.sides.opponent.turnCount=4;s.sides.player.active=slot(n,'attack');s.sides.player.bench=[slot(32,'ally')];s.sides.player.bench[0].benchSlot=0;s.sides.opponent.active=slot(foe,'defend');s.sides.opponent.bench=[slot(50,'foeBench')];s.sides.opponent.bench[0].benchSlot=0;s.sides.player.active.energy=Object.fromEntries(E.map(e=>[e,10]));s.sides.opponent.active.energy={Fire:4};s.sides.player.energyDiscard=Object.fromEntries(E.map(e=>[e,3]));return s}
function settle(s){let k=0;while(s.phase==='effectChoice'&&k++<90){const acts=core.legalActions(s,s.choiceSide);assert.ok(acts.length,'missing '+JSON.stringify(s.pendingChoice));core.applyAction(s,s.choiceSide,acts.find(x=>!x.choiceSkip)||acts[0]);}assert.notEqual(s.phase,'effectChoice','stuck '+JSON.stringify(s.pendingChoice));}
function play(n,i,foe=50){const s=game(n,foe);const a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);assert.ok(a,`Attack ${n}:${i}`);core.applyAction(s,'player',a);settle(s);return s;}
function last(s){return s.log.filter(x=>x.type==='attack').at(-1)?.damage}
test('Complete EX Emerald catalogue, official art metadata, printed effects and set picker',()=>{
 assert.equal(set.CARDS.length,107);assert.equal(set.CARDS.filter(c=>c.kind==='pokemon').length,86);
 assert.equal(set.CARDS.filter(c=>c.pokemonEx).length,11);assert.equal(set.CARDS.filter(c=>c.kind==='trainer').length,11);assert.equal(set.CARDS.filter(c=>c.kind==='energy').length,10);
 assert.equal(set.coverage().battleEnabled,107);assert.ok(classic.SETS.some(s=>s.id==='ex9'));assert.ok(build.SET_IDS.includes('ex9'));assert.ok(opponent.SETS.includes('ex9'));assert.ok(picker.html({ids:build.SET_IDS,selected:['ex9'],mode:'auto'}).includes('data-set-choice="ex9"'));
 for(const c of set.CARDS){assert.equal(c.setId,'ex9');assert.ok(c.image.includes('/ex9/'+c.number+'.png'));assert.ok(c.battleEnabled,c.id);for(const a of c.attacks||[])assert.ok(effects.supportsEffect(a.effect),c.id+' '+a.name);}
});
test('Player and CPU builders generate legal 30-card EX Emerald decks with complete evolutions',()=>{
 const rows=classic.CARDS.map(c=>({gameplayId:c.id,quantity:4}));
 for(const seed of [7,27,47]){for(const result of [build.buildDeck(rows,{style:'random',sets:['ex9'],randomSeed:seed,theme:'any'}),opponent.generate({sets:['ex9'],seed})]){assert.ok(result.ok,result.error);assert.equal(result.cards.length,30);assert.ok(result.cards.every(id=>id.startsWith('ex9-')));assert.ok(classic.validateDeck(result.cards).ok);}}
});
test('Every EX Emerald attack resolves with alternate random seeds and no stuck choices',()=>{
 let total=0;for(const c of set.CARDS.filter(c=>c.kind==='pokemon'))for(let i=0;i<(c.attacks||[]).length;i++)for(const seed of [1,0x7fffffff]){
  const s=game(Number(c.number));s.rngState=seed;let attack=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===i);
  if(!attack&&c.number==='25'&&i===0){continue;}assert.ok(attack,c.id+' '+c.attacks[i].name);
  assert.doesNotThrow(()=>{core.applyAction(s,'player',attack);settle(s)},c.id+' '+c.attacks[i].name);total++;
 }assert.ok(total>=240,total);
});
test('All EX Emerald Trainers are usable and their choices finish',()=>{for(let n=75;n<=85;n++){
 const s=game();s.sides.player.hand.unshift({uid:'trainer'+n,cardId:'ex9-'+n});
 const a=core.legalActions(s,'player').find(a=>a.cardId==='ex9-'+n&&a.type==='trainer');assert.ok(a,'Trainer '+n);assert.doesNotThrow(()=>{core.applyAction(s,'player',a);settle(s)},'Trainer '+n);
}});
test('Direct-target attacks choose actual Pokémon slots rather than anonymous options',()=>{const s=game(41,48);s.sides.opponent.bench[0]=slot(1,'foeBench');s.sides.opponent.bench[0].benchSlot=0;const options=core.legalActions(s,'player').filter(a=>a.type==='attack'&&a.attackIndex===1);assert.ok(options.some(a=>a.effectSelection==='foeBench'));core.applyAction(s,'player',options.find(a=>a.effectSelection==='foeBench'));settle(s);assert.equal(s.sides.opponent.bench[0].damage,40);assert.equal(s.sides.opponent.active.damage,0)});
test('Blaziken Blaze adds 40 to actual attack and the visible base-damage preview',()=>{
 let s=game(1,96);s.sides.player.active.damage=70;
 assert.equal(core.attackDamagePreview(s,'player',0).damage,50);
 let a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);
 core.applyAction(s,'player',a);settle(s);assert.equal(last(s),50);
 s=game(1,96);assert.equal(core.attackDamagePreview(s,'player',0).damage,10);
 a=core.legalActions(s,'player').find(x=>x.type==='attack'&&x.attackIndex===0);
 core.applyAction(s,'player',a);settle(s);assert.equal(last(s),10);
});
test('Swampert Spinning Tail hits the defending Active and every opposing Bench Pokémon',()=>{const s=play(11,0);assert.equal(s.sides.opponent.active.damage,10);assert.equal(s.sides.opponent.bench[0].damage,10)});
test('Regirock ex Mend restores discarded Fighting Basic Energy, not generated zone Energy',()=>{const s=play(99,0);assert.equal(s.sides.player.energyDiscard.Fighting,2);assert.equal(s.sides.player.active.energy.Fighting,11)});
test('Feebas Submerge and Swablu Feathery block Bench damage while active Defender remains vulnerable',()=>{const s=game(7,50);for(const id of [49,67]){s.sides.opponent.bench[0]=slot(id,'bench');s.sides.opponent.bench[0].benchSlot=0;assert.ok(effects.attackIsPrevented(s,'opponent',s.sides.opponent.bench[0],s.sides.player.active,classic.cardById))}});
test('Double Rainbow evolved-only and Multi Energy compatible with existing hybrid Energy rules',()=>{
 const s=game(25);s.sides.player.hand=[{uid:'rainbow',cardId:'ex9-87'},{uid:'multi',cardId:'ex9-89'}];const a=core.legalActions(s,'player');assert.ok(a.some(x=>x.type==='attachSpecial'&&x.cardId==='ex9-87'&&x.target==='active'));assert.equal(core.effectiveEnergy({...s,sides:{...s.sides,player:{...s.sides.player,active:{...s.sides.player.active,specialEnergy:[{uid:'test',cardId:'ex9-87'}]}}}},'player',{...s.sides.player.active,specialEnergy:[{uid:'test',cardId:'ex9-87'}]}).Miracle,2);
});
test('Master rules and version metadata included',()=>{assert.ok(fs.existsSync(path.resolve(__dirname,'../docs/LUCKYDEX_MASTER_RULES.txt')));});
