'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const Core=require('../app/src/main/assets/arcade-fishing-core.js');
let Art;try{Art=require('../app/src/main/assets/arcade-fishing-item-art.js')}catch(e){Art={};}
const ui=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fishing.js'),'utf8');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/arcade-fishing.css'),'utf8');

test('every junk and treasure catch has a dedicated local Fishing item asset',()=>{
  assert.equal(typeof Art.pathFor,'function','Fishing item art catalogue should exist');
  const rows=[...Core.JUNK,...Core.TREASURE];
  assert.equal(rows.length,42);
  const paths=rows.map(row=>Art.pathFor(row));
  assert.equal(new Set(paths).size,rows.length,'each catch gets its own asset path');
  for(let i=0;i<rows.length;i++){
    const p=paths[i];
    assert.match(p,/^arcade\/fishing-items-v0685\/.+\.svg$/);
    assert.ok(fs.existsSync(path.join(root,'app/src/main/assets',p)),`${rows[i].id} asset exists`);
  }
});

test('Fishing UI uses item art rather than toolbox/gift emoji placeholders',()=>{
  assert.doesNotMatch(ui,/🧰|🎁/);
  assert.match(ui,/itemArtPath\(/,'UI resolves art for non-Pokemon catches');
  assert.match(ui,/fishing-target-item-silhouette/,'hooked item art is silhouetted');
  assert.match(ui,/fishing-book-item-art/,'Fishing Book uses item art');
  assert.match(ui,/fishing-result-item-art/,'result popup uses item art');
  assert.match(css,/\.fishing-target-item-silhouette[^}]*filter:\s*brightness\(0\)/,'hooked item remains a silhouette');
});

test('Fishing item art catalogue loads before Fishing runtime',()=>{
  assert.ok(html.indexOf('arcade-fishing-item-art.js')>0);
  assert.ok(html.indexOf('arcade-fishing-item-art.js')<html.indexOf('arcade-fishing.js'));
});
