(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports){module.exports=api;return;}root.LuckyDexTCGPUIAssets=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const ENERGY_ICON_URLS={
  Grass:'https://archives.bulbagarden.net/media/upload/2/2e/Grass-attack.png',
  Fire:'https://archives.bulbagarden.net/media/upload/a/ad/Fire-attack.png',
  Water:'https://archives.bulbagarden.net/media/upload/1/11/Water-attack.png',
  Lightning:'https://archives.bulbagarden.net/media/upload/0/04/Lightning-attack.png',
  Psychic:'https://archives.bulbagarden.net/media/upload/e/ef/Psychic-attack.png',
  Fighting:'https://archives.bulbagarden.net/media/upload/4/48/Fighting-attack.png',
  Darkness:'https://archives.bulbagarden.net/media/upload/a/ab/Darkness-attack.png',
  Metal:'https://archives.bulbagarden.net/media/upload/6/64/Metal-attack.png',
  Dragon:'https://archives.bulbagarden.net/media/upload/8/8a/Dragon-attack.png',
  Colorless:'https://archives.bulbagarden.net/media/upload/1/1d/Colorless-attack.png'
};
// These are physical Basic Energy card prints, distinct from attack-cost icons.
// Darkness and Metal were introduced as Basic Energy in later sets; the
// Lental Classic catalogue already uses these two valid prints.
const ENERGY_CARD_URLS={
  Grass:'https://images.pokemontcg.io/base1/99.png',Fire:'https://images.pokemontcg.io/base1/98.png',
  Water:'https://images.pokemontcg.io/base1/102.png',Lightning:'https://images.pokemontcg.io/base1/100.png',
  Psychic:'https://images.pokemontcg.io/base1/101.png',Fighting:'https://images.pokemontcg.io/base1/97.png',
  Darkness:'https://images.pokemontcg.io/sve/7.png',Metal:'https://images.pokemontcg.io/sve/8.png',
  // No Basic Colorless Energy exists; Double Colorless illustrates the Colorless archetype.
  Colorless:'https://images.pokemontcg.io/base1/96.png'
};
const ENERGY_CARD_IDS={Grass:'base1-99',Fire:'base1-98',Water:'base1-102',Lightning:'base1-100',Psychic:'base1-101',Fighting:'base1-97',Darkness:'lental-basic-darkness',Metal:'lental-basic-metal'};
const LETTERS={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Dragon:'N',Colorless:'C'};
function normalise(type){const raw=String(type||'Colorless').trim().toLowerCase();const map={g:'Grass',grass:'Grass',r:'Fire',fire:'Fire',w:'Water',water:'Water',l:'Lightning',lightning:'Lightning',electric:'Lightning',p:'Psychic',psychic:'Psychic',f:'Fighting',fighting:'Fighting',d:'Darkness',dark:'Darkness',darkness:'Darkness',m:'Metal',metal:'Metal',steel:'Metal',n:'Dragon',dragon:'Dragon',c:'Colorless',colorless:'Colorless'};return map[raw]||'Colorless';}
function energyCardUrl(type){return ENERGY_CARD_URLS[normalise(type)]||null;}
function energyCardId(type){return ENERGY_CARD_IDS[normalise(type)]||null;}
function energyIconUrl(type){return ENERGY_ICON_URLS[normalise(type)]||ENERGY_ICON_URLS.Colorless;}
function esc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function energyIconHtml(type,{className='',count=1,title}={}){const t=normalise(type),n=Math.max(1,Number(count)||1),label=title||`${t} Energy`;return `<span class="tcgp-energy-icon ${esc(className)}" data-energy="${esc(t)}" aria-label="${esc(label)}"><img src="${esc(energyIconUrl(t))}" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><i hidden>${esc(LETTERS[t]||'?')}</i>${n>1?`<b>${n}</b>`:''}</span>`;}
return {ENERGY_ICON_URLS,ENERGY_CARD_URLS,ENERGY_CARD_IDS,energyCardUrl,energyCardId,energyIconUrl,energyIconHtml,normalise};
});
