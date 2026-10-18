const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const assets = path.join(root, 'app/src/main/assets');
const manifest = require('../app/src/main/assets/arcade-dash-gen3-manifest.js');
const json = JSON.parse(fs.readFileSync(path.join(assets, 'arcade/dash/gen3/manifest.json'), 'utf8'));

function rgbaPixels(png) {
  const w=png.readUInt32BE(16),h=png.readUInt32BE(20),chunks=[];
  assert.equal(png[24],8);assert.equal(png[25],6);
  for(let p=8;p<png.length;){const length=png.readUInt32BE(p),type=png.subarray(p+4,p+8).toString();if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+length));p+=length+12;}
  const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=w*4,out=Buffer.alloc(w*h*4);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<h;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){
    const a=x>=4?out[y*stride+x-4]:0,b=y?out[(y-1)*stride+x]:0,c=y&&x>=4?out[(y-1)*stride+x-4]:0;
    const delta=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];assert.notEqual(delta,undefined);
    out[y*stride+x]=(raw[y*(stride+1)+x+1]+delta)&255;
  }}return out;
}

function indexedPixels(png) {
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20),bits=png[24],stride=Math.ceil(width*bits/8),chunks=[];
  assert.equal(png[25],3);assert.ok([1,2,4,8].includes(bits));
  for(let p=8;p<png.length;){const length=png.readUInt32BE(p),type=png.subarray(p+4,p+8).toString();if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+length));p+=length+12;}
  const raw=zlib.inflateSync(Buffer.concat(chunks)),rows=Buffer.alloc(stride*height),pixels=[];
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++)for(let x=0;x<stride;x++){
    const a=x?rows[y*stride+x-1]:0,b=y?rows[(y-1)*stride+x]:0,c=y&&x?rows[(y-1)*stride+x-1]:0;
    const delta=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][raw[y*(stride+1)]];
    rows[y*stride+x]=(raw[y*(stride+1)+x+1]+delta)&255;
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)pixels.push((rows[y*stride+Math.floor(x*bits/8)]>>(8-bits-(x*bits%8)))&((1<<bits)-1));
  return {width,height,pixels};
}

test('Gen 3 catalog has identical browser/CommonJS and JSON manifests', () => {
  assert.deepEqual(manifest, json);
  assert.equal(manifest.schema, 1);
  assert.equal(Object.keys(manifest.sprites).length, 59);
});

test('every native asset exists with real PNG dimensions, bounded anchor/footprint and provenance', () => {
  const paths = new Set();
  for (const [key, entry] of Object.entries(manifest.sprites)) {
    assert.ok(!paths.has(entry.path), key);
    paths.add(entry.path);
    const png = fs.readFileSync(path.join(assets, entry.path));
    assert.equal(png.subarray(1,4).toString(), 'PNG', key);
    const dimensions = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.deepEqual(dimensions, entry.nativeSize, key);
    const pixels=rgbaPixels(png),alpha=[];
    for(let p=3;p<pixels.length;p+=4)alpha.push(pixels[p]);
    assert.ok(alpha.some(a=>a===255),'No visible pixels: '+key);
    assert.ok(alpha.every(a=>a===0||a===255),'No anti-aliasing: '+key);
    assert.equal(crypto.createHash('sha256').update(pixels).digest('hex'),entry.pixelSha256,key);
    if(entry.kind==='tile'||entry.kind==='pad')assert.ok(alpha.every(a=>a===255),'Terrain must cover its native tile: '+key);
    assert.deepEqual(entry.anchor, [dimensions[0]/2, dimensions[1]], key);
    const [x,y,w,h] = entry.footprint;
    assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=dimensions[0] && y+h<=dimensions[1],key);
    assert.ok(['extracted','reassembled','adapted'].includes(entry.classification),key);
    assert.equal(entry.sourceGame,'Pokemon Emerald',key);
    assert.ok(entry.sourceLocation && entry.sourceURL.includes('/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/'),key);
    assert.match(entry.pixelSha256,/^[0-9a-f]{64}$/,key);
    if (entry.kind==='tile' || entry.kind==='pad') assert.deepEqual(dimensions,[16,16],key);
  }
});

test('pinned upstream cache has intact source bytes for palettes, tiles, metatiles and map evidence', () => {
  const source = manifest.sources['pret-pokeemerald'];
  assert.equal(source.commit, '731ad5bfd6e6f265508d0efcca0ba42f9dcf5881');
  for (const [file, expected] of Object.entries(source.sha256)) {
    const bytes = fs.readFileSync(path.join(root,source.cache,file));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected,file);
  }
});

test('complete scenery assemblies match exact authoritative map rectangles', () => {
  const source = manifest.sources['pret-pokeemerald'];
  const layouts = JSON.parse(fs.readFileSync(path.join(root,source.cache,'data/layouts/layouts.json'),'utf8')).layouts;
  for (const key of ['tree','pine','grave','column','machine']) {
    const entry = manifest.sprites[key];
    const evidence = entry.verifiedMapAssembly;
    assert.ok(evidence,key);
    const layout = layouts.find(l=>l.name===evidence.layout+'_Layout');
    const map = fs.readFileSync(path.join(root,source.cache,layout.blockdata_filepath));
    const [x,y] = evidence.position;
    entry.metatiles.forEach((row,dy)=>row.forEach((tile,dx)=>assert.equal(map.readUInt16LE(((y+dy)*layout.width+x+dx)*2)&1023,tile,key)));
  }
  assert.deepEqual(manifest.sprites.tree.nativeSize,[32,32]);
  assert.deepEqual(manifest.sprites.pine.metatiles,[[0x1e,0x1f],[0x26,0x27]]);
  assert.deepEqual(manifest.sprites.machine.nativeSize,[32,48]);
});

test('directional pads, animation VRAM offsets and transparent berry crop use genuine Emerald sources', () => {
  assert.deepEqual(manifest.sprites['mossdeep-pad'].metatiles,[[0x253]]);
  assert.deepEqual(manifest.sprites['mossdeep-pad-active'].metatiles,[[0x273]]);
  assert.equal(manifest.sprites['shore-water-1'].animationSource.vramTileOffset,432);
  assert.equal(manifest.sprites['flowers-1'].animationSource.vramTileOffset,508);
  assert.equal(manifest.sprites['lava-floor-1'].animationSource.vramTileOffset,672);
  assert.deepEqual(manifest.sprites['oran-berry'].sourceFrame,[24,24]);
  assert.deepEqual(manifest.sprites['oran-berry'].nativeSize,[19,18]);
});

test('grass patches exactly preserve real Emerald foreground frame pixels and source index-zero alpha', () => {
  const cache=path.join(root,manifest.sources['pret-pokeemerald'].cache);
  for(const key of ['grass-patch','long-grass-patch']){
    const entry=manifest.sprites[key];
    assert.equal(entry.kind,'patch');assert.deepEqual(entry.nativeSize,[32,16]);
    assert.deepEqual(entry.anchor,[16,16]);assert.deepEqual(entry.metatiles,[]);
    const source=indexedPixels(fs.readFileSync(path.join(cache,'graphics/field_effects/pics',entry.sourceSprite+'.png')));
    const palette=fs.readFileSync(path.join(cache,entry.sourcePalette),'utf8').trim().split(/\r?\n/).slice(3).map(line=>line.split(/\s+/).map(Number));
    const actual=rgbaPixels(fs.readFileSync(path.join(assets,entry.path)));
    let transparent=0,visible=0;
    for(let y=0;y<16;y++)for(let x=0;x<32;x++){
      const index=source.pixels[y*source.width+entry.sourceFrames[Math.floor(x/16)]*16+x%16],position=(y*32+x)*4;
      assert.equal(actual[position+3],index===0?0:255,key+' source alpha');
      if(index===0)transparent++;else {visible++;assert.deepEqual([...actual.subarray(position,position+3)],palette[index],key+' native palette pixel');}
    }
    assert.ok(transparent>0&&visible>0,key+' is a real transparent foreground overlay');
  }
});

test('mud compatibility key is an actual muddy slope, while light route gravel has normal behavior', () => {
  const cache=path.join(root,manifest.sources['pret-pokeemerald'].cache);
  const attributes=fs.readFileSync(path.join(cache,'data/tilesets/primary/general/metatile_attributes.bin'));
  assert.equal(attributes.readUInt16LE(232*2)&255,0xD0);
  assert.equal(manifest.sprites.mud.sourceLabel,'METATILE_General_MuddySlope_Frame0');
  assert.equal(manifest.sprites.mud.sourceBehavior.name,'MB_MUDDY_SLOPE');
  assert.equal(attributes.readUInt16LE(265*2)&255,0);
  assert.equal(manifest.sprites['route-path'].sourceBehavior.name,'MB_NORMAL');
});
