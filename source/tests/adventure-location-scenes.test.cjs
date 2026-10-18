const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'app/src/main/assets');
const file = path.join(assets, 'adventure/location-scenes/manifest.json');
const kinds = ['town','city','route','forest','cave','tower','coast','mountain','gym','league'];
function catalog() {
  assert.ok(fs.existsSync(file), 'Location scene catalog must exist');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

test('every region resolves all ten place categories to a distinct local vignette', () => {
  const m = catalog();
  assert.deepEqual(require('../app/src/main/assets/adventure-location-scenes.js'), m);
  for (const region of ['kanto','johto','hoenn']) {
    const hashes = new Set();
    for (const kind of kinds) {
      const s = m.scenes[m.categories[region][kind]];
      assert.ok(s, `${region}/${kind}`);
      assert.equal(s.region, region);
      assert.equal(s.kind, kind);
      assert.match(s.path, /^adventure\/location-scenes\/[a-z0-9-]+\.png$/);
      const bytes = fs.readFileSync(path.join(assets, s.path));
      assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)], [384,288]);
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), s.fileSha256);
      hashes.add(s.pixelSha256);
    }
    assert.equal(hashes.size, kinds.length, `${region} categories must look distinct`);
  }
  for (const kind of ['town','city','route','coast']) {
    assert.equal(new Set(['kanto','johto','hoenn'].map(r => m.scenes[m.categories[r][kind]].pixelSha256)).size,3,kind);
  }
});

test('Johto named scenes override categories and New Bark has no invented Center', () => {
  const m = catalog();
  for (const name of ['New Bark Town','Cherrygrove City','Violet City','Sprout Tower']) {
    const s = m.scenes[m.named.johto[name]];
    assert.ok(s, name);
    assert.notEqual(m.named.johto[name], m.categories.johto[s.kind], name);
  }
  const bark = m.scenes[m.named.johto['New Bark Town']];
  assert.ok(bark.components.some(c => c.semantic === 'complete-house'));
  assert.ok(!bark.components.some(c => /center|mart/.test(c.semantic)));
  const tower = m.scenes[m.named.johto['Sprout Tower']];
  assert.ok(tower.components.some(c => c.semantic === 'stairway'));
  assert.ok(!tower.components.some(c => /grave/.test(c.semantic)));
});

test('native source evidence is pinned, intact, and each complete component stays inside its scene', () => {
  const m = catalog();
  const source = m.source;
  assert.equal(source.commit, '731ad5bfd6e6f265508d0efcca0ba42f9dcf5881');
  for (const [relative, hash] of Object.entries(source.sha256)) {
    const bytes = fs.readFileSync(path.join(root, source.cache, relative));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash, relative);
  }
  for (const s of Object.values(m.scenes)) {
    assert.equal(s.classification, 'native-pixel-composition');
    assert.equal(s.canonicalMapScreenshot, false);
    assert.ok(s.components.length > 0);
    for (const c of s.components) {
      const [x,y] = c.position;
      const [w,h] = c.destinationSize;
      assert.ok(x>=0 && y>=0 && x+w<=s.width && y+h<=s.height, `${s.id}/${c.semantic} must be complete and unclipped`);
      assert.ok(c.packagedPath || (c.layout && c.mapRect), `${s.id}/${c.semantic} needs actual native evidence`);
    }
  }
});
