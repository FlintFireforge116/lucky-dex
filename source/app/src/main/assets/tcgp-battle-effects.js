(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.LuckyDexTCGPBattleEffects = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const ENERGY_CODE = Object.freeze({
    G:'Grass', R:'Fire', W:'Water', L:'Lightning', P:'Psychic', F:'Fighting', D:'Darkness', M:'Metal'
  });

  function totalEnergy(energy){ return Object.values(energy || {}).reduce((sum,n)=>sum + Math.max(0,Number(n)||0),0); }

  function canPayCost(energy, cost){
    const pool = {...(energy || {})};
    const symbols = String(cost || '').split('').filter(Boolean);
    for (const symbol of symbols){
      if (symbol === 'C') continue;
      const type = ENERGY_CODE[symbol];
      if (!type || Number(pool[type] || 0) <= 0) return false;
      pool[type] -= 1;
    }
    const generic = symbols.filter(symbol => symbol === 'C').length;
    return totalEnergy(pool) >= generic;
  }

  function spendGenericEnergy(energy, amount){
    let remaining = Math.max(0, Number(amount || 0));
    const next = {...(energy || {})};
    const types = Object.keys(next).sort((a,b) => Number(next[b]||0)-Number(next[a]||0));
    for (const type of types){
      while (remaining > 0 && Number(next[type] || 0) > 0){ next[type] -= 1; remaining -= 1; }
      if (!remaining) break;
    }
    if (remaining) return null;
    return next;
  }

  function attackDamage(attackerCard, attack, defenderCard){
    let damage = Math.max(0, Number(attack && attack.damage || 0));
    if (damage > 0 && attackerCard && defenderCard && defenderCard.weakness === attackerCard.subtype) damage += 20;
    return damage;
  }

  function applyAttackEffect(effect, context){
    if (!effect) return;
    if (effect.type === 'healSelf'){
      const amount = Math.max(0, Number(effect.amount || 0));
      if (context && context.attacker) context.attacker.damage = Math.max(0, Number(context.attacker.damage || 0) - amount);
      return;
    }
    throw new Error(`Unsupported battle effect: ${effect.type}`);
  }

  return {ENERGY_CODE,totalEnergy,canPayCost,spendGenericEnergy,attackDamage,applyAttackEffect};
});
