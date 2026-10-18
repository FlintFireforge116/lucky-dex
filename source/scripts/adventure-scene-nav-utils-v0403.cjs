const assert=require('node:assert/strict');
const old=require('./adventure-location-acceptance-v0402.cjs');
const {launch,open,settle}=require('./adventure3-browser-utils.cjs');
const viewports=[{width:320,height:568},{width:360,height:640},{width:360,height:780},{width:412,height:915},{width:768,height:1024}];
const places=[['johto','New Bark Town'],['johto','Route 29'],['johto','Cherrygrove City'],['johto','Sprout Tower'],['johto','Violet City'],['johto','Violet Gym'],['kanto','Pallet Town'],['johto','Azalea Town'],['johto','Union Cave'],['hoenn','Route 124']];
async function enterJohto(page){await page.locator('[data-nav="adventure"]').click();await page.locator('[data-hub-action="journey"]').click();await page.locator('[data-region="johto"]').click()}
async function fixture(page,region,name){
 await page.evaluate(({region,name})=>{
  const E=LuckyDexRegionalEngine,F=LuckyDexLocationFlow,j=E.start(state,region,73);
  const n=j.nodes.find(n=>!n.optional&&(n.name===name||(n.type==='gym'&&E.trainerFor(j,n)?.city===name)||(region==='johto'&&['Route 30','Route 31','Sprout Tower'].includes(name)&&n.id==='johto-c0-s3')||(region==='johto'&&name==='Violet City'&&n.id==='johto-c0-s4')));
  if(!n)throw Error('Missing authored place '+name);
  j.depth=n.depth;j.chapterIndex=n.chapterIndex;j.sectionIndex=n.sectionIndex;j.current=null;j.battle=null;j.phase='map';j.recovery=null;j.locationFlow=null;
  if(F.describe(j).name!==name&&F.actionsFor(state,j).some(a=>a.key==='leave-gym'))F.perform(state,'leave-gym');
  for(let i=0;i<3&&F.describe(j).name!==name;i++)F.continue(state);
  if(F.describe(j).name!==name)throw Error('Presentation path did not reach '+name);
  j.location=name;save();LuckyDexAdventure.regional();
 },{region,name});await ready(page);
}
async function ready(page){await page.waitForFunction(()=>[...document.querySelectorAll('#adventureRoot img')].every(i=>i.complete&&i.naturalWidth>0))}
async function snapshot(page){const s=await old.snapshot(page);return {...s,...await page.evaluate(()=>{
 const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
 const f=document.querySelector('.adv3-place-vignette'),img=document.querySelector('[data-place-scene]'),avatar=document.querySelector('[data-place-avatar]'),root=document.querySelector('.adv3-journey'),pane=document.querySelector('.adv3-journey-content'),p=LuckyDexLocationFlow.describe(state.adventureRegional.active),C=LuckyDexLocationScenes;
 const key=C.places?.[p?.id]||C.named?.[p?.region]?.[p?.name]||C.categories?.[p?.region]?.[p?.kind],scene=C.scenes?.[key];
 return {sceneBounds:rect(f),imageBounds:rect(img),avatarBounds:rect(avatar),rootBounds:rect(root),paneBounds:rect(pane),native:img?{width:img.naturalWidth,height:img.naturalHeight,src:img.getAttribute('src')}:null,objective:document.querySelector('.adv3-place-status')?.textContent||'',progress:document.querySelector('[data-place-progress]')?.textContent||'',profileObjective:p?.objective,profile:p,sceneKey:key,avatarMetadata:scene?.avatar,
  destinations:LuckyDexLocationFlow.actionsFor(state).filter(a=>a.destinationId).map(a=>({key:a.key,destinationId:a.destinationId})),footerDestination:document.querySelector('.adv3-foot [data-journey-action="continue"]')?.dataset.destinationId,
  usableSceneHeight:(root?.getBoundingClientRect().height||innerHeight)-(document.querySelector('.adv3-head')?.getBoundingClientRect().height||0)-(document.querySelector('.adv3-foot')?.getBoundingClientRect().height||0),avatarIncompatible:!f&&!!avatar};
 })}}
function assertScene(s,v){
 old.assertMenu(s,v);assert(s.paneOverflow<=2,s.title+' has no scrolling content pane');
 if(s.view!=='journey')return;
 assert(s.sceneBounds&&s.native,s.title+' has a scene');
 assert.equal(s.native.width/s.native.height,4/3,s.title+' native scene is 4:3');
 assert(s.sceneBounds.height<=s.sceneBounds.width*.75+7,s.title+' viewport is capped at native aspect');
 assert(s.sceneBounds.height>=100,s.title+' scene remains readable on a short phone');
 if(v.width===412){const fraction=s.sceneBounds.height/s.usableSceneHeight;assert(fraction>=.33&&fraction<=.46,s.title+' scene occupies roughly 35–45% usable tall phone: '+fraction)}
 assert(!/Clear the local encounter|Defeat the trainer|to travel onward|Challenge .* to travel onward/i.test(s.objective),s.title+' objective is world-facing');
 assert(s.objective.trim()&&s.objective.length<=58,s.title+' has one concise objective line');
 assert.equal(s.objective,s.profileObjective,s.title+' uses authoritative objective');
 if(s.profile.region==='johto'&&['Route 30','Route 31'].includes(s.title))assert.equal(s.objective,'Follow the path',s.title+' describes onward route travel rather than the later Tower trainer');
 if(s.profile.region==='johto'&&s.title==='Sprout Tower')assert.equal(s.objective,'Trainer battle','Tower owns the trainer objective');
 const destinations=s.destinations.map(a=>a.destinationId);if(s.footerDestination)destinations.push(s.footerDestination);
 assert.equal(new Set(destinations).size,destinations.length,s.title+' destinations are unique across local/footer');
 if(['town','city','route','forest','coast','cave','tower'].includes(s.kind)){
  const a=s.avatarBounds,f=s.imageBounds;assert(a,s.title+' includes the player');
  assert(a.width>=10&&a.height>=13&&a.width<=Math.min(64,f.width*.13)&&a.height<=Math.min(80,f.height*.20),s.title+' avatar stays small and legible at the scene scale');
  assert(a.x>=f.x-1&&a.y>=f.y-1&&a.right<=f.right+1&&a.bottom<=f.bottom+1,s.title+' entire avatar stays within scene');
 }
}
module.exports={...old,launch,open,settle,viewports,places,enterJohto,fixture,ready,snapshot,assertScene};
