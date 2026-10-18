'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','app/src/main/assets');
const roster=[11,14,204,247,266,268,412,541,544,616,665,737,825,917];
function pngInfo(file){
  const b=fs.readFileSync(file);assert.ok(b.length>24,`${file} too small`);
  assert.deepStrictEqual([...b.subarray(0,8)],[137,80,78,71,13,10,26,10],`${file} not PNG`);
  const width=b.readUInt32BE(16),height=b.readUInt32BE(20);assert.ok(width>0&&height>0,`${file} invalid dimensions`);return {width,height};
}
const dims={};
for(const dex of roster){const file=path.join(root,`arcade/sprites/actors/pokemon/${dex}.png`);assert.ok(fs.existsSync(file),`missing roster sprite ${dex}`);dims[dex]=pngInfo(file);}
for(const rel of ['arcade/dash/gen3/cave-floor.png','arcade/dash/gen3/cave-wall.png','arcade/dash/gen3/cave-rock.png','arcade/dash/gen3/route-rock.png']){const file=path.join(root,rel);assert.ok(fs.existsSync(file),`missing quarry asset ${rel}`);pngInfo(file);}
assert.ok(new Set(Object.values(dims).map(x=>`${x.width}x${x.height}`)).size>1,'native roster dimensions should be preserved, not forced to one square');
console.log('PASS v0.38.0 Rock Harden local sprite/quarry asset integrity',dims);
