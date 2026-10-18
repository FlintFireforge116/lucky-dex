const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assets = path.resolve(__dirname, '../app/src/main/assets');
const catalog = () => JSON.parse(fs.readFileSync(path.join(assets, 'adventure/location-scenes/manifest.json'), 'utf8'));

test('every delivered scene supplies an opaque-sized 4:3 window with complete component bounds', () => {
  for (const s of Object.values(catalog().scenes)) {
    assert.deepEqual([s.width, s.height], [384, 288], s.id);
    const png = fs.readFileSync(path.join(assets, s.path));
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [384, 288], s.id);
    for (const c of s.components) {
      const [x,y] = c.position, [w,h] = c.destinationSize;
      assert.ok(x >= 0 && y >= 0 && x+w <= s.width && y+h <= s.height, `${s.id}/${c.semantic}`);
    }
    assert.ok(s.components.some(c => c.position[1]+c.destinationSize[1] > 216 && c.destinationSize[0] < 384), `${s.id} foreground needs authored content`);
  }
});

test('priority settlements resolve exact profiles with different native landmark layouts', () => {
  const m = catalog();
  const targets = [['johto','New Bark Town'],['kanto','Pallet Town'],['johto','Azalea Town'],['johto','Cherrygrove City'],['johto','Violet City'],['kanto','Viridian City'],['hoenn','Littleroot Town'],['hoenn','Petalburg City']];
  const scenes = targets.map(([region,name]) => {
    const s = m.scenes[m.named[region]?.[name]];
    assert.ok(s, `${region}/${name} needs its own composition`);
    assert.notEqual(s.id, m.categories[region][s.kind]);
    assert.equal(m.places[s.id], s.id);
    return s;
  });
  assert.equal(new Set(scenes.map(s => s.pixelSha256)).size, targets.length);
  const houses = s => s.components.filter(c => /house|facade|center|mart/.test(c.semantic)).map(c => [c.semantic,c.position]);
  assert.notDeepEqual(houses(scenes[0]), houses(scenes[1]));
  assert.notDeepEqual(houses(scenes[0]), houses(scenes[2]));
});

test('normal scenes provide a packaged player anchor clear of important landmarks; gyms and leagues omit it', () => {
  for (const s of Object.values(catalog().scenes)) {
    if (['gym','league'].includes(s.kind)) { assert.equal(s.avatar, undefined, s.id); continue; }
    const a = s.avatar;
    assert.ok(a, `${s.id} player anchor`);
    assert.deepEqual([a.width,a.height], [32,32]);
    assert.equal(a.path, 'adventure/art/trainers/red.png');
    const bytes = fs.readFileSync(path.join(assets,a.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), a.fileSha256);
    const [x,y] = a.position;
    assert.ok(x >= 0 && y >= 0 && x+a.width <= s.width && y+a.height <= s.height, s.id);
    for (const c of s.components.filter(c => /complete-house|complete-center|complete-mart|complete-gym-facade|complete-treehouse|stairway|complete-rock-ledge|complete-tree|^sign$|cave-ladder/.test(c.semantic))) {
      const [cx,cy] = c.position, [cw,ch] = c.destinationSize;
      assert.ok(x+a.width <= cx || cx+cw <= x || y+a.height <= cy || cy+ch <= y, `${s.id} player overlaps ${c.semantic}`);
    }
  }
});

test('Hoenn Route 124 resolves a native water and shoreline scene without the defective repeated bridge strip', () => {
  const m = catalog();
  const id = m.named.hoenn?.['Route 124'];
  const s = m.scenes[id];
  assert.ok(s, 'Route 124 exact override');
  assert.equal(m.places['hoenn-route-124'], id);
  assert.equal(s.kind, 'coast');
  for (const scene of [s,m.scenes[m.categories.hoenn.coast]]) {
    assert.ok(scene.components.some(c => c.semantic === 'shore-water'));
    assert.ok(scene.components.some(c => /shoreline/.test(c.semantic) && c.layout === 'Route104'));
    assert.ok(!scene.components.some(c => /bridge-floor|bridge-rail/.test(c.semantic)));
  }
});
