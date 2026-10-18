const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const assets=path.join(root,'app/src/main/assets');
const world=fs.readFileSync(path.join(assets,'arcade-world.js'),'utf8');
const unown=fs.readFileSync(path.join(assets,'arcade-unown.js'),'utf8');
const sessionTest=fs.readFileSync(path.join(root,'tests/arcade-session.test.cjs'),'utf8');

assert.match(world,/id:"ruinsAlph"[\s\S]*?games:\['unown'\]/,'Ruins of Alph must still own Unown Decoder');
assert.match(world,/unown:\(\)=>window\.LuckyDexUnown/,'world owner must remain LuckyDexUnown');
assert.doesNotMatch(world,/id:"moonStage"/,'Moon Stage is now presented inside Kids Club rather than as a separate world stop');assert.match(world,/id:"stadiumKidsClub"[^\n]*games:[^\n]*'clefairy'/,'Kids Club now owns the existing Clefairy game');
assert.match(world,/clefairy:\(\)=>window\.LuckyDexClefairyGame/,'Clefairy owner must remain LuckyDexClefairyGame');
assert.ok(sessionTest.includes('clefairy'),'Arcade session coverage must include Clefairy');
assert.ok(sessionTest.includes('unown'),'Arcade session coverage must include Unown');

const spriteDir=path.join(assets,'arcade/sprites/actors/unown');
const pngs=fs.readdirSync(spriteDir).filter(f=>f.endsWith('.png')).sort();
assert.equal(pngs.length,28,'Decoder sprite folder should remain the pre-existing 26 letters plus !/? forms');
assert.deepEqual(pngs,['a.png','b.png','c.png','d.png','e.png','exclamation.png','f.png','g.png','h.png','i.png','j.png','k.png','l.png','m.png','n.png','o.png','p.png','q.png','question.png','r.png','s.png','t.png','u.png','v.png','w.png','x.png','y.png','z.png']);
assert.match(unown,/arcade\/sprites\/actors\/unown\/\$\{String\(ch\)\.toLowerCase\(\)\}\.png/,'runtime should compose A-Z sprite paths dynamically');
assert.doesNotMatch(unown,/word-assets|unown\/words|\.webp|\.jpg/,'Decoder must not introduce word-specific image assets');

console.log('PASS v0.28.3 Arcade ownership/glyph regression contract');
