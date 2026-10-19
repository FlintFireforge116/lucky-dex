const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app/src/main/assets/arcade-world.js'),'utf8');

function extractFunction(name){
  const marker=`function ${name}(`,start=source.indexOf(marker);assert.ok(start>=0,`${name} must exist`);
  const brace=source.indexOf('{',start);let depth=0,quote=null,escape=false;
  for(let i=brace;i<source.length;i++){
    const ch=source[i];
    if(quote){if(escape){escape=false;continue;}if(ch==='\\'){escape=true;continue;}if(ch===quote)quote=null;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
    if(ch==='{')depth++;else if(ch==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error(`cannot extract ${name}`);
}

const context={
  VENUES:[{id:'amieGarden'}],
  selected:'amieGarden',
  window:{state:{arcade:{}},save(){throw new Error('storage quota');}},
  console:{warn(){},error(){},log(){}}
};
vm.createContext(context);
vm.runInContext(`${extractFunction('selectVenue')};this.selectVenue=selectVenue;`,context);
assert.doesNotThrow(()=>context.selectVenue('amieGarden'),'Arcade rendering must not be aborted by a persistence failure');
assert.equal(context.window.state.arcade.lastArcadeVenue,'amieGarden');
console.log('arcade-entry-resilience: ok');
