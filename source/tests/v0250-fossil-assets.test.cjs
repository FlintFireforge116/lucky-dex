const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'app/src/main/assets/arcade/fossil-museum-v0250');
const requiredMuseum=['helix-fossil','dome-fossil','old-amber','root-fossil','claw-fossil','skull-fossil','armor-fossil','cover-fossil','plume-fossil','jaw-fossil','sail-fossil','fossilized-bird','fossilized-dino','fossilized-drake','fossilized-fish','odd-keystone','relic-copper','relic-silver','relic-gold','relic-vase','relic-band','relic-statue','relic-crown','hard-stone','everstone','fire-stone','water-stone','thunder-stone','leaf-stone','moon-stone'];
const requiredOther=['poke-ball','great-ball','ultra-ball','nugget','big-nugget','pearl','big-pearl','stardust','star-piece','rare-bone','comet-shard'];
assert.ok(fs.existsSync(path.join(root,'app/src/main/assets/arcade/fossil-museum-v0252/oreburgh-museum-dppt-landscape-v0252.png'))||fs.existsSync(path.join(dir,'oreburgh-museum-dppt-empty-v0251.png'))||fs.existsSync(path.join(dir,'oreburgh-museum-dppt-empty.png')),'Oreburgh museum asset missing');
assert.ok(fs.existsSync(path.join(dir,'manifest.json')),'fossil museum manifest missing');
assert.ok(fs.existsSync(path.join(dir,'SOURCES.md')),'fossil museum source notes missing');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
assert.match(manifest.room?.path||'',/arcade\/fossil-museum-v0252\/oreburgh-museum-dppt-landscape-v0252\.png/);
assert.ok(manifest.items&&typeof manifest.items==='object','manifest.items missing');
for(const id of [...requiredMuseum,...requiredOther]){
  const rel=manifest.items[id]?.path;
  assert.ok(rel,`manifest missing item ${id}`);
  const full=path.join(root,'app/src/main/assets',rel);
  assert.ok(fs.existsSync(full),`${id} sprite missing at ${rel}`);
  const buf=fs.readFileSync(full);
  assert.equal(buf.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${id} must be PNG`);
}
console.log(`PASS v0.25.0 Fossil Museum asset contract (${requiredMuseum.length+requiredOther.length} item sprites)`);
