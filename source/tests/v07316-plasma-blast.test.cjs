'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=path.join(root,'app/src/main/assets');
const core=require(path.join(asset,'tcgp-battle-core.js'));
const effects=require(path.join(asset,'tcgp-battle-effects.js'));
const data=require(path.join(asset,'tcg-classic-battle-data.js'));
const cpu=require(path.join(asset,'tcg-classic-opponents.js'));
const set=require(path.join(asset,'tcg-classic-plasma-blast.js'));
const ref=(id,uid=id)=>({cardId:id,uid});
const mon=(id,uid=id)=>({...core.makePokemonSlot(id,1,uid),damage:0,tool:null,extraTools:[],energy:{},specialEnergy:[],conditions:{},benchSlot:0});
function scene(){const make=()=>({active:mon('bw9-1'),bench:[],hand:[],deck:[],discard:[],energyDiscard:{},energySupply:[],prizes:[ref('bw9-1')],prizesTaken:0,turnCount:3,handLimit:8,benchLimit:3,trainerUsed:false,supporterUsed:false});return {format:'classic',phase:'battle',activeSide:'player',turnNumber:7,stadium:null,sides:{player:make(),opponent:make()},rules:{benchSize:3,winMode:'prizes'},log:[],rngState:1};}
const E=k=>({type:'neoRule',rule:'bw10:'+k});
function fire(s,e,{resume=false,action={},extraCtx={}}={}){let choice=null;effects.applyEffect(e,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,resolvingChoice:resume,random:()=>.1,shuffle:(_,deck)=>deck.reverse(),drawCard:ss=>{const r=ss.deck.shift();if(r)ss.hand.push(r);return r;},requestChoice:q=>choice=q,...extraCtx});return choice;}
function resolve(s,rule,damage=30,action={}){return effects.resolveAttack({name:rule,damage,cost:['C'],effect:E(rule)},{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,action,isAttack:true,random:()=>.1,retreatCost:()=>3});}
const SRC=path.join(root,'data/classic/bw10-print-compact.json');
test('BW10 source registration, print conservation and explicit unsupported gates',{skip:!fs.existsSync(SRC)},()=>{
 const prints=JSON.parse(fs.readFileSync(SRC,'utf8'));assert.equal(prints.length,105);assert.equal(set.CARDS.length,105);
 assert.deepEqual(set.CARDS.map(c=>c.number),Array.from({length:105},(_,i)=>''+(i+1)));
 assert.equal(prints.reduce((n,c)=>n+c[7].length,0),139);assert.equal(prints.reduce((n,c)=>n+c[8].length,0),21);
 for(let i=0;i<105;i++){const c=set.CARDS[i];assert.equal(c.name,prints[i][1]);assert.strictEqual(data.cardById(c.id),c);assert.equal((c.attacks||[]).length,prints[i][7].length);assert.equal((c.abilities||[]).length,prints[i][8].length);assert.equal(c.deckEligible,c.battleEnabled);if(c.battleEnabled)for(const a of c.attacks||[])assert.notEqual(a.effect?.type,'unsupported');}
 assert.equal(data.coverage().plasmaBlast.printed,105);
 for(const n of [3,27,53,102])assert.equal(set.cardById('bw10-'+n).battleEnabled,false,'must gate nonstandard effect '+n);
 assert.equal(set.cardById('bw10-91').kind,'energy');assert.equal(set.cardById('bw10-91').specialEnergy,true);
 for(const n of [11,30,60,65,66,96,97,98,99,100])if(set.cardById('bw10-'+n)?.pokemonEX)assert.equal(set.cardById('bw10-'+n).prizeCards,2);
});
test('BW10 energy recovery includes physical discard and basic Energy discard ledger',()=>{
 const s=scene();s.sides.player.discard=[ref('bw9-106','plasma-special'),ref('bw1-105','basic-grass')];s.sides.player.energyDiscard.Fire=1;
 const q=fire(s,E('energyRetrieval'));assert.equal(q.kind,'option');assert.equal(q.options.length,2);
 fire(s,{...E('energyRetrieval'),stage:'pick',remaining:2},{resume:true,action:{choiceOption:1}});
 assert.equal(s.sides.player.hand.length,1);assert.equal(s.sides.player.energyDiscard.Fire,0);
 assert.equal(s.sides.player.discard.some(x=>x.uid==='plasma-special'),true);
 const q2=fire(s,{...E('energyRetrieval'),stage:'pick',remaining:1});assert.equal(q2.options.length,1);
 fire(s,{...E('energyRetrieval'),stage:'pick',remaining:1},{resume:true,action:{choiceOption:0}});
 assert.equal(s.sides.player.hand.length,2);assert.equal(s.sides.player.discard.some(x=>x.uid==='basic-grass'),false);
});
test('BW10 Master Ball selects any Pokémon and never invents a card',()=>{
 const s=scene();s.sides.player.deck=[ref('bw9-99','item'),ref('bw9-20','pokemon')];
 const q=fire(s,E('masterBall'));assert.equal(q.options.length,1);
 fire(s,{...E('masterBall'),stage:'pick'},{resume:true,action:{choiceOption:0}});
 assert.deepEqual(s.sides.player.hand.map(x=>x.uid),['pokemon']);assert.deepEqual(s.sides.player.deck.map(x=>x.uid),['item']);
});
test('BW10 Caitlin explicitly chooses cards placed on bottom and draws exact count',()=>{
 const s=scene();s.sides.player.hand=[ref('bw9-1','one'),ref('bw9-2','two')];s.sides.player.deck=[ref('bw9-3','a'),ref('bw9-4','b')];
 const q=fire(s,E('caitlin'));assert.equal(q.options.length,3);
 const q2=fire(s,{...E('caitlin'),stage:'pick',moved:0},{resume:true,action:{choiceOption:1}});
 assert.equal(q2.kind,'option');assert.ok(q2.options.at(-1).includes('draw 1'));
 fire(s,{...E('caitlin'),stage:'pick',moved:1},{resume:true,action:{choiceOption:1}});
 assert.equal(s.sides.player.hand.length,2);assert.ok(s.sides.player.hand.some(r=>r.uid==='a'));
});
test('BW10 solar transporter preserves exact Team Plasma printed references and discards others',()=>{
 const s=scene();s.sides.player.deck=[ref('bw9-38','plasma'),ref('bw9-1','normal'),ref('bw9-106','energy')];
 fire(s,E('solarTransporter'));
 assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['plasma','energy']);assert.deepEqual(s.sides.player.discard.map(r=>r.uid),['normal']);
});
test('BW10 Reverse Edge heads recovers chosen arbitrary physical discard',()=>{
 const s=scene();s.sides.player.discard=[ref('bw9-1','pokemon'),ref('bw9-106','plasma')];
 const q=fire(s,E('reverseEdge'));assert.equal(q.options.length,2);
 fire(s,{...E('reverseEdge'),stage:'pick'},{resume:true,action:{choiceOption:1}});
 assert.deepEqual(s.sides.player.hand.map(r=>r.uid),['plasma']);
});
test('BW10 fast forward mills exactly one opponent card per physical Plasma Energy',()=>{
 const s=scene();s.sides.player.active.specialEnergy=[ref('bw8-127','e1'),ref('bw9-106','e2'),ref('bw10-91','e3')];
 s.sides.opponent.deck=[ref('bw9-1','a'),ref('bw9-2','b'),ref('bw9-3','c'),ref('bw9-4','d')];
 fire(s,E('fastForward'));assert.deepEqual(s.sides.opponent.discard.map(r=>r.uid),['a','b','c']);assert.deepEqual(s.sides.opponent.deck.map(r=>r.uid),['d']);
});
test('BW10 pre-weakness attack numbers include Energy and opposing Team Plasma type',()=>{
 const s=scene();s.sides.opponent.active.energy.Water=2;
 assert.equal(resolve(s,'energyPress',20).damage,60);
 s.sides.player.active.energy.Water=3;assert.equal(resolve(s,'hydroPump',60).damage,90);
 s.sides.player.active.damage=30;assert.equal(resolve(s,'outrage',20).damage,50);
 s.sides.opponent.active=mon('bw9-38');assert.equal(resolve(s,'kickOfRighteousness',30).damage,70);
 s.sides.player.active=mon('bw9-1');s.sides.player.bench=[mon('bw9-38')];assert.equal(resolve(s,'ironFistOfJustice',60).damage,0);
});
test('BW10 Plasma Blast stadium discard routes to true owner',()=>{
 const s=scene();s.stadium={uid:'stadium',cardId:'bw9-100',ownerSide:'opponent'};
 fire(s,E('gaiaCrush'));assert.equal(s.stadium,null);assert.deepEqual(s.sides.opponent.discard.map(r=>r.uid),['stadium']);
});
test('BW10 fossil-clutch options describe actual +50 choice and do not auto-discard',()=>{
 const s=scene();s.sides.player.hand=[ref('bw9-1','pokemon')];
 assert.equal(effects.choicesForEffect(E('fossilClutch'),{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById}).length,1);
});
test('BW8 and BW9 Plasma checks include BW10 Plasma Energy print',()=>{
 const s=scene();s.sides.player.active.specialEnergy=[ref('bw10-91','plasma')];
 const ex=require(path.join(asset,'tcg-classic-plasma-storm.js')).cardById('bw8-14'),a=ex.attacks.find(a=>a.name==='Power Flame');
 const r=effects.resolveAttack(a,{state:s,side:'player',foeSide:'opponent',attacker:s.sides.player.active,defender:s.sides.opponent.active,cardById:data.cardById,isAttack:true,action:{}});
 assert.equal(r.damage,120);
});
test('BW10 legal CPU decks use 30 cards and respect evolution and ACE SPEC constraints',{skip:!fs.existsSync(SRC)},()=>{
 let n=0;for(const type of ['Grass','Fire','Water','Lightning','Psychic','Fighting','Metal','Darkness','Colorless'])for(let seed=1;seed<=12;seed++){
 const d=cpu.generate({sets:['bw10'],type,seed});if(!d.ok)continue;n++;assert.equal(d.cards.length,30);assert.equal(data.validateDeck(d.cards).ok,true,`${type}:${seed}`);
 assert.ok(d.cards.every(id=>data.cardById(id)?.deckEligible!==false));
 assert.ok(d.cards.filter(id=>data.cardById(id)?.aceSpec).length<=1);
 }assert.ok(n>=40,`BW10 legal builds ${n}/108`);
});

// Silver Mirror affects all attack resolution paths, not only the active
// target's final damage calculation (bench attacks may bypass that path).
test('BW10 Silver Mirror protects non-EX targets from Plasma attacks at the effect layer',()=>{
 const s=scene(),p=mon('bw9-1');p.tool=ref('bw10-89','silver');s.sides.opponent.bench=[p];
 s.sides.player.active=mon('bw9-38');
 const blocked=effects.attackIsPrevented(s,'opponent',p,s.sides.player.active,data.cardById);
 assert.ok(blocked,'Plasma attack should be blocked before Bench damage');
 s.sides.player.active=mon('bw9-1');
 assert.equal(!!effects.attackIsPrevented(s,'opponent',p,s.sides.player.active,data.cardById),false,'Normal attack should not be blocked');
});
