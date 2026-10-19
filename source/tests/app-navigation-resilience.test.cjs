const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/app-v0167.js'),'utf8');

function extractFunction(name){
  const marker=`function ${name}(`;
  const start=source.indexOf(marker);
  assert.ok(start>=0,`${name} must exist`);
  const brace=source.indexOf('{',start);
  let depth=0, quote=null, escape=false;
  for(let i=brace;i<source.length;i++){
    const ch=source[i];
    if(quote){
      if(escape){escape=false;continue;}
      if(ch==='\\'){escape=true;continue;}
      if(ch===quote)quote=null;
      continue;
    }
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;
    else if(ch==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`Could not extract ${name}`);
}

class Classes{
  constructor(...items){this.set=new Set(items.filter(Boolean));}
  contains(v){return this.set.has(v);}
  add(...v){v.forEach(x=>this.set.add(x));}
  remove(...v){v.forEach(x=>this.set.delete(x));}
  toggle(v,on){if(on===undefined)on=!this.set.has(v);on?this.set.add(v):this.set.delete(v);return on;}
}
function page(name,active=false){return {dataset:{page:name},classList:new Classes(active?'active':'')};}
function nav(name,active=false){return {dataset:{nav:name},classList:new Classes(active?'active':'')};}

const pages=['adventure','arcade','packs','trade','collection','profile'].map((n,i)=>page(n,i===0));
const navs=['adventure','arcade','packs','trade','collection','profile'].map((n,i)=>nav(n,i===0));
const body={classList:new Classes()};
const document={
  body,
  querySelector(sel){
    if(sel==='.page.active')return pages.find(p=>p.classList.contains('active'))||null;
    if(sel==='#cardSource')return {value:'tcg'};
    return null;
  },
  querySelectorAll(sel){
    if(sel==='.page')return pages;
    if(sel==='[data-nav]')return navs;
    return [];
  },
  getElementById(id){if(id==='cardSource')return {value:'tcg'};return null;}
};
const errors=[];
const context={
  window:{
    LuckyDexAdventure:{leave(){throw new Error('adventure leave failed');}},
    LuckyDexArcadeWorld:{leave(){throw new Error('arcade leave failed');},openWorld(){throw new Error('arcade open failed');}},
    LuckyDexTrade:{leave(){throw new Error('trade leave failed');},enter(){throw new Error('trade enter failed');}}
  },
  document,
  console:{error(...args){errors.push(args);},warn(){},log(){}},
  closePackOpening(){throw new Error('pack close failed');},
  showAdventureHub(){throw new Error('adventure enter failed');},
  rebuildCollectionControls(){throw new Error('collection controls failed');},
  renderTeamPanel(){throw new Error('team panel failed');},
  renderCollection(){throw new Error('collection render failed');},
  loadSets(){throw new Error('sets failed');},
  updatePackButton(){throw new Error('pack button failed');},
  updatePackFormatV5(){throw new Error('pack format failed');},
  renderProfile(){throw new Error('profile failed');}
};
vm.createContext(context);
vm.runInContext(`${extractFunction('navigate')}; this.navigate=navigate;`,context);

// The tab switch itself must survive unrelated subsystem failures.
assert.doesNotThrow(()=>context.navigate('packs'));
assert.equal(pages.find(p=>p.classList.contains('active'))?.dataset.page,'packs');
assert.equal(navs.find(n=>n.classList.contains('active'))?.dataset.nav,'packs');

assert.doesNotThrow(()=>context.navigate('arcade'));
assert.equal(pages.find(p=>p.classList.contains('active'))?.dataset.page,'arcade');

assert.ok(errors.length>=1,'navigation failures should be logged for diagnosis');
console.log('app-navigation-resilience: ok');
