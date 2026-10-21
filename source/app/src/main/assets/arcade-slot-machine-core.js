(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.LuckyDexSlotMachineCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const BET_UNIT=25;
  const BETS=Object.freeze([25,50,75]);
  const SYMBOLS=Object.freeze({
    red7:Object.freeze({id:'red7',label:'RED 7',asset:'arcade/ui/slot-icons/red7.svg',glyph:'7',tone:'red'}),
    blue7:Object.freeze({id:'blue7',label:'BLUE 7',asset:'arcade/ui/slot-icons/blue7.svg',glyph:'7',tone:'blue'}),
    azurill:Object.freeze({id:'azurill',label:'AZURILL',pokemonId:298}),
    lotad:Object.freeze({id:'lotad',label:'LOTAD',pokemonId:270}),
    pikachu:Object.freeze({id:'pikachu',label:'PIKACHU',pokemonId:25}),
    cherry:Object.freeze({id:'cherry',label:'CHERRY',asset:'arcade/ui/slot-icons/cherry.svg',glyph:'●',tone:'cherry'}),
    replay:Object.freeze({id:'replay',label:'REPLAY',asset:'arcade/ui/slot-icons/replay.svg',glyph:'↻',tone:'replay'}),
    lightning:Object.freeze({id:'lightning',label:'POWER',asset:'arcade/ui/slot-icons/lightning.svg',glyph:'⚡',tone:'power'})
  });
  // 21-stop strips keep the same symbol families as the Gen III Mauville machines.
  const REEL_STRIPS=Object.freeze([
    Object.freeze(['red7','cherry','azurill','replay','lotad','pikachu','lightning','blue7','cherry','lotad','replay','azurill','pikachu','lightning','red7','cherry','lotad','replay','blue7','azurill','pikachu']),
    Object.freeze(['blue7','lotad','replay','cherry','pikachu','azurill','lightning','red7','replay','lotad','cherry','azurill','pikachu','blue7','lightning','replay','lotad','red7','cherry','pikachu','azurill']),
    Object.freeze(['red7','pikachu','cherry','replay','azurill','lotad','blue7','lightning','cherry','replay','pikachu','lotad','azurill','red7','replay','cherry','blue7','lightning','lotad','azurill','pikachu'])
  ]);
  const LINES=Object.freeze({
    center:Object.freeze([[1,0],[1,1],[1,2]]),
    top:Object.freeze([[0,0],[0,1],[0,2]]),
    bottom:Object.freeze([[2,0],[2,1],[2,2]]),
    diagDown:Object.freeze([[0,0],[1,1],[2,2]]),
    diagUp:Object.freeze([[2,0],[1,1],[0,2]])
  });
  function paylinesForCoins(coins){
    const n=Math.max(1,Math.min(3,Math.round(Number(coins)||1)));
    return n===1?['center']:n===2?['top','center','bottom']:['top','center','bottom','diagDown','diagUp'];
  }
  const allSame=(line,id)=>line.length===3&&line.every(x=>x===id);
  function payoutForLine(line){
    const l=Array.isArray(line)?line:[];
    if(allSame(l,'red7'))return {coins:120*BET_UNIT,label:'JACKPOT',multiplier:120,replay:false,power:0,jackpotTone:'red'};
    if(allSame(l,'blue7'))return {coins:120*BET_UNIT,label:'JACKPOT',multiplier:120,replay:false,power:0,jackpotTone:'blue'};
    if(l.length===3&&l.every(x=>x==='red7'||x==='blue7'))return {coins:36*BET_UNIT,label:'MIXED 7s',multiplier:36,replay:false,power:0};
    if(allSame(l,'azurill'))return {coins:5*BET_UNIT,label:'AZURILL',multiplier:5,replay:false,power:0};
    if(allSame(l,'lotad'))return {coins:2*BET_UNIT,label:'LOTAD',multiplier:2,replay:false,power:0};
    if(allSame(l,'pikachu'))return {coins:BET_UNIT,label:'PIKACHU',multiplier:1,replay:false,power:1};
    if(allSame(l,'lightning'))return {coins:BET_UNIT,label:'PIKA POWER',multiplier:1,replay:false,power:3};
    if(allSame(l,'replay'))return {coins:0,label:'REPLAY',multiplier:0,replay:true,power:0};
    if(l[0]==='cherry')return {coins:BET_UNIT,label:'CHERRY',multiplier:1,replay:false,power:0};
    return {coins:0,label:'',multiplier:0,replay:false,power:0};
  }
  function lineSymbols(window,lineName){
    const coords=LINES[lineName]||[];
    return coords.map(([r,c])=>window?.[r]?.[c]).filter(Boolean);
  }
  function evaluateWindow(window,coinsBet){
    const names=paylinesForCoins(coinsBet),lines=names.map(name=>({name,symbols:lineSymbols(window,name)})).map(row=>({...row,...payoutForLine(row.symbols)}));
    const winners=lines.filter(x=>x.coins>0||x.replay||x.power>0);
    const coins=winners.reduce((sum,x)=>sum+x.coins,0),power=winners.reduce((sum,x)=>sum+x.power,0),replay=winners.some(x=>x.replay);
    const bestLine=winners.slice().sort((a,b)=>b.coins-a.coins||b.multiplier-a.multiplier)[0]||{coins:0,multiplier:0,label:''};
    return {coins,power,replay,lines,bestLine,winningLines:winners.map(x=>x.name)};
  }
  function pickMachineLuck(random=Math.random){return 1+Math.min(5,Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*6));}
  function createSession({machineLuck=pickMachineLuck(),lucky=null,power=0,reelTime=null}={}){
    const luck=Math.max(1,Math.min(6,Math.round(Number(machineLuck)||1)));
    return {machineLuck:luck,lucky:lucky==null?luck>=4:!!lucky,power:Math.max(0,Math.min(16,Math.round(Number(power)||0))),reelTime:{active:!!reelTime?.active,spinsLeft:Math.max(0,Math.round(Number(reelTime?.spinsLeft)||0))}};
  }
  function activateReelTime(session,{spins=3}={}){const s=createSession(session||{});return {...s,reelTime:{active:true,spinsLeft:Math.max(1,Math.min(8,Math.round(Number(spins)||3)))}};}
  function consumeReelTimeSpin(session,{straight7=false}={}){const s=createSession(session||{});if(!s.reelTime.active)return s;if(straight7)return {...s,reelTime:{active:false,spinsLeft:0}};const left=Math.max(0,s.reelTime.spinsLeft-1);return {...s,reelTime:{active:left>0,spinsLeft:left}};}
  function speedFor(session){const s=createSession(session||{});return s.reelTime.active?0.42:s.lucky?0.9:1;}
  function stopSlip({lucky=false,reelTime=false}={},random=Math.random){
    const max=reelTime?0:4;
    return Math.min(max,Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(max+1)));
  }
  function visibleWindow(stops){
    const pos=(Array.isArray(stops)?stops:[0,0,0]).map((v,i)=>((Math.round(Number(v)||0)%REEL_STRIPS[i].length)+REEL_STRIPS[i].length)%REEL_STRIPS[i].length);
    return [0,1,2].map(row=>[0,1,2].map(reel=>REEL_STRIPS[reel][(pos[reel]+row-1+REEL_STRIPS[reel].length)%REEL_STRIPS[reel].length]));
  }
  function randomStops(random=Math.random){return REEL_STRIPS.map(strip=>Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*strip.length));}
  return {BET_UNIT,BETS,SYMBOLS,REEL_STRIPS,LINES,paylinesForCoins,payoutForLine,evaluateWindow,pickMachineLuck,createSession,activateReelTime,consumeReelTimeSpin,speedFor,stopSlip,visibleWindow,randomStops};
});
