'use strict';
// Offline, whole-text translations only. Unknown clauses return null; runtime
// receives validated mechanics, never natural-language guesses.
const ENERGY={G:'Grass',R:'Fire',W:'Water',L:'Lightning',P:'Psychic',F:'Fighting',D:'Darkness',M:'Metal'};
const STATUS={Poisoned:'poison',Burned:'burn',Asleep:'sleep',Paralyzed:'paralysis',Confused:'confusion'};
function compileAdditional(text,kind,baseDamage,compile){
 let m;const ok=effect=>({supported:true,effect}),sentence=s=>s[0].toUpperCase()+s.slice(1);
 if((m=text.match(/^If a Stadium is in play, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'stadiumInPlay'}});
 if((m=text.match(/^Discard (\d+) random Energy from this Pokémon\.$/)))return ok({type:'discardEnergy',target:'self',amount:+m[1],random:true});
 if(/^The Defending Pokémon can't attack during your opponent's next turn\.$/.test(text))return ok({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'});
 if((m=text.match(/^Discard the top (card|\d+ cards) of (your|your opponent's) deck\.$/)))return ok({type:'discardTop',side:m[2]==='your'?'self':'opponent',amount:m[1]==='card'?1:parseInt(m[1],10)});
 if((m=text.match(/^Heal (\d+) damage from each of your Pokémon\.$/)))return ok({type:'heal',target:'selfAll',amount:+m[1]});
 if(/^This attack does more damage equal to the damage this Pokémon has on it\.$/.test(text))return ok({type:'damageFromDamage',source:'self',amount:1,mode:'add'});
 if((m=text.match(/^This attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1]});
 if((m=text.match(/^If your opponent's Active Pokémon is (Poisoned|Burned|Asleep|Paralyzed|Confused), this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[2],condition:{type:'opponentStatus',status:STATUS[m[1]]}});
 if((m=text.match(/^If your opponent's Active Pokémon is affected by a Special Condition, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'opponentStatus'}});
 if((m=text.match(/^If your opponent's Active Pokémon is a Pokémon ex, this attack does (\d+) more damage\.$/)))return ok({type:'bonusDamage',amount:+m[1],condition:{type:'opponentEx'}});
 if((m=text.match(/^This attack does (\d+) (more )?damage for each (?:\{([GRWLPFDM])\} )?Energy attached to this Pokémon\.$/)))return ok({type:'energyDamage',amount:+m[1],source:'self',...(m[3]?{energyType:ENERGY[m[3]]}:{}),mode:m[2]?'add':'replace'});
 if((m=text.match(/^This attack does (\d+) (more )?damage for each of (your|your opponent's) Benched Pokémon\.$/)))return ok({type:'benchCountDamage',amount:+m[1],side:m[3]==='your'?'self':'opponent',mode:m[2]?'add':'replace'});
 if((m=text.match(/^Flip (\d+) coins\. This attack does (\d+) more damage for each heads\.$/)))return ok({type:'coinDamage',coins:+m[1],amount:+m[2],mode:'add'});
 if((m=text.match(/^Move (an Energy|all \{([GRWLPFDM])\} Energy) from (this Pokémon|1 of your Benched Pokémon) to (your Active Pokémon|1 of your Benched Pokémon)\.$/))){const source=m[3]==='this Pokémon'?'self':'selfBench',target=m[4]==='your Active Pokémon'?'selfActive':'selfBench';if(source==='selfBench'&&target==='selfBench')return null;return ok({type:'moveEnergy',source,target,...(m[2]?{energyType:ENERGY[m[2]]}:{}),amount:m[2]?'all':1});}
 if((m=text.match(/^Put (\d+) random (Basic )?\{([GRWLPFDM])\} Pokémon from your (deck|discard pile) into your hand\.$/)))return ok({type:'search',filter:{kind:'pokemon',...(m[2]?{stage:'Basic'}:{}),subtype:ENERGY[m[3]]},amount:+m[1],source:m[4]==='deck'?'deck':'discard',random:true});
 if((m=text.match(/^Discard all \{([GRWLPFDM])\} Energy from this Pokémon\.$/)))return ok({type:'discardEnergy',target:'self',energyType:ENERGY[m[1]],amount:'all'});
 if((m=text.match(/^Discard (\d+) random Energy from your opponent's Active Pokémon\.$/)))return ok({type:'discardEnergy',target:'opponentActive',amount:+m[1],random:true});
 if((m=text.match(/^During your opponent's next turn, the Defending Pokémon can't attack\.$/)))return ok({type:'lock',target:'opponentActive',action:'attack',duration:'opponentTurn'});
 if((m=text.match(/^During your opponent's next turn, prevent all damage done to this Pokémon by attacks\.$/)))return ok({type:'preventDamage',target:'self',duration:'opponentTurn',effects:false});
 if((m=text.match(/^During your opponent's next turn, attacks used by the Defending Pokémon cost (\d+) \{C\} more\.$/)))return ok({type:'modifier',target:'opponentActive',stat:'attackCost',amount:+m[1],duration:'opponentTurn'});
 if((m=text.match(/^This attack also does (\d+) damage to (1 of|each of) your Benched Pokémon\.$/)))return ok({type:'benchDamage',amount:+m[1],side:'self',all:m[2]==='each of'});
 // A single branch node consumes exactly one RNG toss. Cancellation of an
 // entire attack is NOT a no-op branch and stays with explicit coinDamage.
 if(!/does nothing/.test(text)&&(m=text.match(/^Flip a coin\. If heads, (.+?)(?: If tails, (.+))?$/))){if(/\.\s+\S/.test(m[1])||m[2]&&/\.\s+\S/.test(m[2]))return null;const heads=compile(sentence(m[1]),kind,baseDamage),tails=m[2]?compile(sentence(m[2]),kind,baseDamage):null;if(heads.supported&&(!tails||tails.supported))return ok({type:'coinFlip',heads:heads.effect||{type:'noop'},...(tails?{tails:tails.effect||{type:'noop'}}:{})});}
 if(!/does nothing/.test(text)&&(m=text.match(/^Flip a coin\. If tails, (.+)$/))){if(/\.\s+\S/.test(m[1]))return null;const tails=compile(sentence(m[1]),kind,baseDamage);if(tails.supported)return ok({type:'coinFlip',heads:{type:'noop'},tails:tails.effect||{type:'noop'}});}
 return null;
}
module.exports={compileAdditional};
