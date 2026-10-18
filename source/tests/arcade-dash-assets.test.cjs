const assert=require('assert'),fs=require('fs'),path=require('path');
const a=path.resolve(__dirname,'../app/src/main/assets');
assert(fs.existsSync(path.join(a,'arcade-dash-renderer.js')),'dedicated pixel renderer');
const renderer=require(path.join(a,'arcade-dash-renderer.js')),assets=require(path.join(a,'arcade-dash-assets.js'));
for(const type of require(path.join(a,'arcade-dash-config.js')).TYPE_ORDER){const manifest=assets.manifest(type);assert(manifest.length>=10);for(const file of manifest){assert(!/^https?:/.test(file));assert(fs.existsSync(path.join(a,file)),file)}}
for(const [w,h] of [[39,46],[66,61],[36,43],[51,44],[63,70]]){const r=renderer.spriteGeometry({naturalWidth:w,naturalHeight:h},100,500,112);assert(Math.abs(r.width/r.height-w/h)<.025);assert.equal(r.y+r.height,500);assert(Number.isInteger(r.x)&&Number.isInteger(r.y));assert(r.height>=80&&r.height<=112)}
const race={phase:'countdown',elapsedMs:0};const coords=[0,1,2,3,4,5].map(index=>renderer.gridOffset(index,race));assert(new Set(coords.map(JSON.stringify)).size===6);assert.deepEqual(renderer.gridOffset(4,{phase:'racing',elapsedMs:1000}),{x:0,y:0});
const source=fs.readFileSync(path.join(a,'arcade-dash-renderer.js'),'utf8');assert(source.includes('naturalWidth')&&source.includes('naturalHeight'));assert(!source.includes('ctx.ellipse')&&!source.includes('ctx.arc('),'primary objects use raster assets');assert(source.includes('imageSmoothingEnabled=false'));
console.log('PASS local assets for all themes, native sprite geometry and fair visual grid');
