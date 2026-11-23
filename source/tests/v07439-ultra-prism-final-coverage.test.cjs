'use strict';
// Whole-set release gate. This intentionally runs against GENERATED canonical
// cards, not handcrafted fixture Pokémon or a guessed coverage percentage.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sm5=require('../app/src/main/assets/tcg-classic-ultra-prism.js');
const effects=require('../app/src/main/assets/tcgp-battle-effects.js');
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/classic/sm5-print-compact.json'),'utf8'));
const coverage=JSON.parse(fs.readFileSync(path.join(root,'docs/SM5_BUILD_COVERAGE.json'),'utf8'));
const contract=require('../scripts/sm5_release_contract.json');

test('Ultra Prism COMPLETE means all 178 official prints enabled; no tolerated gated cards',()=>{
  const gated=sm5.CARDS.filter(c=>!c.battleEnabled||!c.deckEligible||c.support?.status!=='FULL');
  const reasons=gated.map(c=>`${c.id} ${c.name}: ${(c.support?.reasons||[]).join('; ')}`);
  assert.equal(rows.length,178,'Official SM5 compact catalogue is incomplete');
  assert.equal(sm5.CARDS.length,178,'Generated SM5 catalogue is incomplete');
  assert.equal(coverage.printed,178);
  assert.equal(coverage.battleReady,178,`Not complete: ${reasons.join(' | ')}`);
  assert.deepEqual(coverage.gated,{},`Remaining SM5 blockers: ${JSON.stringify(coverage.gated)}`);
  assert.deepEqual(reasons,[],`Remaining SM5 blockers: ${reasons.join(' | ')}`);
});

test('Every printed attack, Ability, Trainer and Special Energy has valid non-placeholder rules',()=>{
  let attacks=0,abilities=0,trainerPrints=0,energyPrints=0;
  for(let i=0;i<rows.length;i++){
    const r=rows[i],c=sm5.CARDS[i];
    assert.equal(c.id,`sm5-${r[0]}`);
    assert.equal(c.name,r[1]);
    assert.equal(c.battleEnabled,true,c.id);
    assert.equal(c.deckEligible,true,c.id);
    assert.equal(c.support.status,'FULL',c.id);
    if(c.kind==='pokemon'){
      assert.equal(c.attacks.length,r[7].length,c.id+' attack count');
      assert.equal(c.abilities.length,r[8].length,c.id+' Ability count');
      for(let j=0;j<r[7].length;j++){
        const print=r[7][j],attack=c.attacks[j];attacks++;
        assert.equal(attack.name,print[0]);
        assert.deepEqual(attack.cost,print[1],c.id+' printed energy cost');
        assert.equal(attack.damageText,print[2]||null,c.id+' printed damage');
        assert.equal(attack.text,print[3],c.id+' printed effect');
        assert.deepEqual(effects.validateEffect(attack.effect),[],c.id+' '+attack.name);
        assert.notEqual(attack.effect.type,'unsupported',c.id+' '+attack.name);
        const meaningful=String(print[3]||'').replace(/\(You can't use more than 1 GX attack in a game\.\)/g,'').trim();
        if(meaningful)assert.notEqual(attack.effect.type,'noop',c.id+' '+attack.name+' lost printed effect');
      }
      for(let j=0;j<r[8].length;j++){
        const print=r[8][j],power=c.abilities[j];abilities++;
        assert.equal(power.name,print[0]);assert.equal(power.text,print[2]);
        assert.deepEqual(effects.validateEffect(power.effect),[],c.id+' '+power.name);
        assert.notEqual(power.effect.type,'unsupported',c.id+' '+power.name);
      }
    }else if(c.kind==='trainer'){
      trainerPrints++;
      assert.deepEqual(effects.validateEffect(c.effect),[],c.id+' '+c.name);
      assert.notEqual(c.effect.type,'unsupported',c.id);
      assert.notEqual(c.effect.type,'noop',c.id+' missing Trainer effect');
    }else if(c.kind==='energy'){
      energyPrints++;
      assert.deepEqual(effects.validateEffect(c.effect),[],c.id+' '+c.name);
      assert.equal(c.effect.type,'specialEnergy',c.id+' missing Energy rules');
    }else assert.fail(c.id+' unexpected kind '+c.kind);
  }
  assert.deepEqual([attacks,abilities,trainerPrints,energyPrints],[237,37,36,5]);
});

test('SM5 duplicate prints and Prism Stars keep exactly the same legality as standard printing',()=>{
  for(const number of contract.variants){
    const standard=sm5.cardById(`sm5-${number.slice(0,-1)}`);
    const variant=sm5.cardById(`sm5-${number}`);
    assert.ok(standard&&variant,number);
    for(const prop of ['name','battleEnabled','deckEligible','attacks','abilities','effect','trainerType'])
      assert.deepEqual(variant[prop],standard[prop],`${number} ${prop}`);
  }
  const prism=sm5.CARDS.filter(c=>c.prismStar);
  assert.equal(prism.length,6);
  for(const c of prism){assert.equal(c.maxDeckCopies,1,c.id);assert.equal(c.battleEnabled,true,c.id);}
});
