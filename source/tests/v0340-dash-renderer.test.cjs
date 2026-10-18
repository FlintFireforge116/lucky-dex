const assert=require('assert'),R=require('../app/src/main/assets/arcade-dash-renderer.js');
assert.equal(typeof R.worldToY,'function','one projection owns all near-world art');
const h=720,p=600;assert.equal(R.worldToY(p,p,h),h*.7);assert.equal(R.worldToY(650,p,h)-R.worldToY(650,p+20,h),-61);assert.equal(R.worldToY(690,p,h)-R.worldToY(680,p,h),-30.5);
for(const profile of [{types:['normal']},{types:['flying']},{id:95,types:['rock','ground']}]){const samples=Array.from({length:101},(_,i)=>R.motionForRacer({...profile,index:0},i*10));const max=Math.max(...samples.map(x=>Math.abs(x.y))),delta=Math.max(...samples.slice(1).map((x,i)=>Math.abs(x.y-samples[i].y)));assert(max<=3,'gentle amplitude');assert(delta<.5,'no high-frequency sprite shaking')}
assert.equal(R.motionForRacer({id:95},100).profile,'glide');
console.log('PASS one world-plane scroll projection and gentle native sprite profiles');
