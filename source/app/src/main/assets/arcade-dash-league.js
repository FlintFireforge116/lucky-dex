(function(root){
'use strict';
const config=root.LuckyDexDashConfig||(typeof require==='function'?require('./arcade-dash-config.js'):null);
const POINTS=[0,10,6,4,3,2,1];
function pointsForPlace(place){const p=Math.round(Number(place)||0);return POINTS[p]||0;}
function validType(type){return config.TYPE_ORDER.includes(String(type||'').toLowerCase());}
function validDifficulty(key){return !!config.DIFFICULTIES[String(key||'').toLowerCase()];}
function entrantFrom(row,index){return {...row,index,points:0,totalTimeMs:0,places:[]};}
function createCup({type,difficulty,player,aiRacers=[],seed=Date.now()}={}){
  type=String(type||'').toLowerCase();difficulty=String(difficulty||'').toLowerCase();
  if(!validType(type))throw new Error(`Invalid league type: ${type}`);
  if(!validDifficulty(difficulty))throw new Error(`Invalid league difficulty: ${difficulty}`);
  if(!player?.key)throw new Error('League player is required');
  const ais=aiRacers.slice(0,5);
  if(ais.length<5)throw new Error('League requires five AI racers');
  const entrants=[player,...ais].map(entrantFrom);
  return {type,difficulty,seed:(Number(seed)||1)>>>0||1,playerKey:String(player.key),aiRacerKeys:ais.map(x=>String(x.key)),entrants,raceIndex:0,completionHandled:false,raceResults:[]};
}
function recordRace(cup,results){
  if(!cup||cup.raceIndex>=3)return cup;
  const rows=Array.isArray(results)?results:[];
  const byKey=new Map(rows.map(r=>[String(r.key),r]));
  for(const entrant of cup.entrants){const r=byKey.get(String(entrant.key));if(!r)continue;const place=Math.max(1,Math.min(6,Math.round(Number(r.place)||6)));const time=Math.max(0,Number(r.timeMs)||0);entrant.points+=pointsForPlace(place);entrant.totalTimeMs+=time;entrant.places.push(place);}
  cup.raceResults.push(rows.map(r=>({...r})));
  cup.raceIndex+=1;
  return cup;
}
function standings(cup){return [...(cup?.entrants||[])].sort((a,b)=>b.points-a.points||a.totalTimeMs-b.totalTimeMs||a.index-b.index).map((row,i)=>({...row,overallPlace:i+1}));}
function trophyForPlace(place){return place===1?'gold':place===2?'silver':place===3?'bronze':null;}
function finishCupOnce(cup,fn){if(!cup||cup.completionHandled)return false;cup.completionHandled=true;if(typeof fn==='function')fn();return true;}
const api={POINTS,pointsForPlace,createCup,recordRace,standings,trophyForPlace,finishCupOnce};
root.LuckyDexDashLeague=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
