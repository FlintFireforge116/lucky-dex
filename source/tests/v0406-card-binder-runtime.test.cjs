'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function classList(){const set=new Set();return {toggle(name,on){if(on)set.add(name);else set.delete(name);},add(name){set.add(name);},remove(name){set.delete(name);},contains:name=>set.has(name)};}
function select(value='all'){
  const el={value,hidden:false,options:[],classList:classList()};
  Object.defineProperty(el,'innerHTML',{get(){return this._html||'';},set(html){this._html=html;this.options=[...String(html).matchAll(/<option value="([^"]+)"/g)].map(m=>({value:m[1]}));if(this.options.length&&!this.options.some(o=>o.value===this.value))this.value=this.options[0].value;}});
  return el;
}

test('live Pokédex -> Card Binder switch renders cards even when legacy teamPanel is absent',()=>{
  const pokemonBtn={dataset:{collection:'pokemon'},classList:classList()};
  const cardsBtn={dataset:{collection:'cards'},classList:classList()};
  const sealedBtn={dataset:{collection:'sealed'},classList:classList()};
  pokemonBtn.classList.toggle('active',true);
  const elements={
    collectionFilter:Object.assign(select('all'),{addEventListener(){}}),collectionGroupFilter:Object.assign(select('all'),{addEventListener(){}}),
    collectionSearch:{value:'',placeholder:'Search collection',addEventListener(){}},
    collectionSort:{value:'releaseDate',hidden:true,addEventListener(){}},collectionSortDir:{dataset:{dir:'desc'},hidden:true,textContent:'↓',setAttribute(){},addEventListener(){}},
    collectionGrid:{innerHTML:'<button data-pokemon-key="390:n"><img src="sprite.png">Chimchar</button>',classList:{remove(){}},querySelectorAll(){return[];}},
    binderQuickFilters:{hidden:true},binderDuplicateCount:{textContent:'0'},
    collectionSetPickerWrap:{hidden:true},collectionProgress:{hidden:false,innerHTML:'<b>Pokédex</b>'},
    collectionSetPickerTitle:{textContent:''},collectionSetPickerMeta:{textContent:''},collectionSetPickerComplete:{hidden:true},collectionSetPickerTrack:{hidden:true},collectionSetPickerBar:{style:{}},collectionSetPickerButton:{classList:classList(),addEventListener(){}},
  };
  const document={
    getElementById(id){return elements[id]||null;},
    querySelectorAll(sel){if(sel==='[data-collection]')return [pokemonBtn,cardsBtn,sealedBtn];if(sel==='[data-binder-source]'||sel==='[data-binder-filter]')return [];return[];}
  };
  const context={
    window:null,globalThis:null,document,
    state:{cards:{c1:{id:'c1',name:'Pikachu',image:'card.png',source:'tcg',count:1,setId:'base1',setName:'Base Set',rarity:'Common'}},pokemon:{},ui:{}},
    collectionMode:'pokemon',setCache:{tcg:[],tcgp:[]},
    renderCollection(){elements.collectionGrid.innerHTML='<button data-pokemon-key="390:n">Chimchar</button>';},
    rebuildCollectionControls(){},renderTeamPanel(){},renderCollectionProgress(items){elements.collectionProgress.innerHTML='<b>Card binder</b>';},save(){},
    looksRare(){return false;},escapeHtml:s=>String(s),humanCardText:s=>String(s),cardDisplayMeta:()=> 'Common',cardArtHtml:(src,name)=>`<img src="${src}" alt="${name}">`,openCardModal(){},
    console,setTimeout,queueMicrotask,Intl,Date,Map,Set,Object,Array,String,Number,Math,
  };
  context.window=context;context.globalThis=context;
  vm.runInNewContext(fs.readFileSync(path.join(root,'app/src/main/assets/collection-browser-v0280.js'),'utf8'),context,{filename:'collection-browser-v0280.js'});
  assert.doesNotThrow(()=>cardsBtn.onclick());
  assert.match(elements.collectionGrid.innerHTML,/data-card-id=\"c1\"/);
  assert.doesNotMatch(elements.collectionGrid.innerHTML,/data-pokemon-key/);
  assert.equal(elements.collectionSearch.placeholder,'Search TCG cards, sets or numbers');
  assert.equal(cardsBtn.classList.contains('active'),true);
});
