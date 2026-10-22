/* Place presentation and optional services; authored battle/reward IDs stay in the engine. */
(function(root){'use strict';
const E=root.LuckyDexRegionalEngine||(typeof require==='function'?require('./adventure-regional-engine.js'):null);
const Activities=root.LuckyDexAdventureActivities||(typeof require==='function'?require('./adventure-location-activities.js'):null);
const Authored=root.LuckyDexKantoAuthored||(typeof require==='function'?require('./adventure-kanto-events.js'):null);
const AuthoredCore=root.LuckyDexAdventureAuthored||(typeof require==='function'?require('./adventure-authored-events.js'):null);
const slug=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const towns={
 kanto:['Pallet Town','Viridian City','Pewter City','Cerulean City','Vermilion City','Lavender Town','Celadon City','Fuchsia City','Saffron City','Cinnabar Island','Indigo Plateau'],
 johto:['New Bark Town','Cherrygrove City','Violet City','Azalea Town','Goldenrod City','Ecruteak City','Cianwood City','Olivine City','Mahogany Town','Blackthorn City','Indigo Plateau'],
 hoenn:['Littleroot Town','Petalburg City','Rustboro City','Dewford Town','Slateport City','Mauville City','Lavaridge Town','Fortree City','Lilycove City','Mossdeep City','Sootopolis City','Ever Grande City']
};
const homes=new Set(['Pallet Town','New Bark Town','Littleroot Town']);
const noMart=new Set(['Pallet Town','New Bark Town','Littleroot Town','Cianwood City','Dewford Town','Ever Grande City']);
const kinds={'Viridian Forest':'forest','Ilex Forest':'forest','Petalburg Woods':'forest','Mt. Moon':'cave','Rock Tunnel':'cave','Seafoam Islands':'cave','Union Cave':'cave','Whirl Islands':'cave','Mt. Mortar':'cave','Ice Path':'cave','Granite Cave':'cave','Fiery Path':'cave','Rusturf Tunnel':'cave','Victory Road':'cave','Slowpoke Well':'cave','Dragon’s Den':'cave','Sprout Tower':'tower','Burned Tower':'tower','Pokémon Tower':'tower','Olivine Lighthouse':'tower','Pokémon Mansion':'tower','Weather Institute':'tower','Mt. Chimney':'mountain','Mt. Pyre':'mountain','Indigo Plateau':'league','Ever Grande City':'league','Cianwood shore':'coast','Lake of Rage':'coast','Sootopolis waters':'coast','Ever Grande waterfall':'coast'};
const waterRoutes={kanto:new Set(['Route 19','Route 21']),johto:new Set(['Route 40']),hoenn:new Set(['Route 106','Route 124','Route 126'])};
const hints={
 'New Bark Town':'Route 29 leads west to Cherrygrove City.',
 'Pallet Town':'Route 1 leads north towards Viridian City.',
 'Littleroot Town':'Route 101 leads towards Petalburg and its woods.',
 'Cherrygrove City':'The northern road reaches Routes 30 and 31.',
 'Route 30':'Follow the path north to Route 31.',
 'Route 31':'Sprout Tower is the next training stop.',
 'Sprout Tower':'The tower’s trainer stands between you and Violet City.',
 'Violet City':'Falkner awaits at Violet Gym. Heal first if you need to.',
 'Cianwood City':'Chuck trains at Cianwood Gym; the pharmacy stands nearby.',
 'Dewford Town':'Brawly awaits at Dewford Gym.'
};
const milestone=n=>['gym','trial','elite-four','league-round','champion'].includes(n?.type);
function mainNode(j){const c=E.current(j);return c&&!c.optional?c:j?.nodes.find(n=>!n.optional&&n.depth===(c?.depth??j.depth));}
function path(j,n){if(j.region==='johto'&&n?.id==='johto-c0-s3')return ['Route 30','Route 31','Sprout Tower'];if(n?.type==='gym'){const gym=/Gym$/.test(n.name)?n.name:`${n.name.replace(/ (City|Town|Island)$/,'')} Gym`,city=E.trainerFor(j,n)?.city;return city?[city,gym]:[gym]}return [n?.name||j.checkpoint?.name||j.location];}
function arrivalStep(j,n){return n?.type==='gym'&&n.id!=='johto-c0-s4'?path(j,n).length-1:0;}
function destinationId(j,name){return `${j.region}-${slug(name)}`;}
function objectiveFor(kind,n,completed,last){if(kind==='route'&&!last)return 'Follow the path';if(completed)return 'Ready for the road';if(kind==='cave')return 'Find the way through';if(kind==='coast')return 'Cross the water route';if(kind==='gym')return 'Gym challenge';if(kind==='league')return 'League challenge';if(kind==='tower')return n?.type==='trainer'?'Trainer battle':'Explore the tower';if(kind==='mountain')return 'Take the rocky path';if(kind==='forest')return 'Follow the forest path';if(kind==='town')return homes.has(n?.name)?'Your journey starts here':'A stop along the road';if(kind==='city')return 'Prepare for the road';return ['trainer','victory-road'].includes(n?.type)?'Trainer battle':['wild','rare'].includes(n?.type)?'Wild encounter ahead':'Follow the path';}
function stepFor(j,n){const names=path(j,n);if(E.current(j)?.id===n?.id&&['node','battle','result'].includes(j.phase))return names.length-1;const f=j.locationFlow;if(f&&f.nodeId===n?.id&&f.traversal===(j.traversal||0)){if(n?.type==='gym'&&n.id!=='johto-c0-s4')return f.gymCityReturn?0:names.length-1;return Math.max(0,Math.min(names.length-1,Number(f.step)||0))}return arrivalStep(j,n);}
function category(j,name,n){if(/Gym$/.test(name)||n?.type==='trial'&&name===n.name)return 'gym';if(['elite-four','league-round','champion'].includes(n?.type))return 'league';if(kinds[name])return kinds[name];if(waterRoutes[j.region]?.has(name))return 'coast';if(/City$/.test(name))return 'city';if(/Town$/.test(name))return 'town';if(/Island$/.test(name))return 'city';if(/^Route\s|Road|Bridge|approach|Cycling/.test(name))return 'route';return {cave:'cave',haunted:'tower',coast:'coast',volcano:'mountain'}[n?.habitat]||'route';}
function servicesFor(j,name){const settlement=towns[j.region]?.includes(name)||false;return {center:settlement&&!homes.has(name),home:homes.has(name),mart:settlement&&!noMart.has(name),martLabel:name==='Mahogany Town'?'SOUVENIR SHOP':'POKÉ MART',talk:settlement};}
function backtrackNode(j){return j?.backtrack?.name?j.nodes.find(n=>!n.optional&&n.name===j.backtrack.name)||null:null;}
function describe(j){if(!j)return null;if(j.backtrack?.name){const n=backtrackNode(j)||mainNode(j),name=j.backtrack.name,services=servicesFor(j,name),kind=category(j,name,n),returnName=j.backtrack.returnName||mainNode(j)?.name||j.checkpoint?.name;return {id:destinationId(j,name),name,nextId:destinationId(j,returnName),objective:'Revisit this area, hunt local Pokémon, or return to your story.',exploreText:`Look around ${name}. Local encounters remain available after you move on.`,kind,region:j.region,habitat:n?.habitat||'meadow',nodeId:n?.id,services,nextLabel:returnName,continueLabel:`RETURN TO ${String(returnName).toUpperCase()}`,canContinue:j.phase==='map'&&!j.recovery,blockedText:'Finish this encounter first.',segment:1,segments:1,chapterIndex:n?.chapterIndex??j.chapterIndex,sectionIndex:n?.sectionIndex??j.sectionIndex,backtracked:true};}
 const n=mainNode(j),names=path(j,n),step=stepFor(j,n),name=names[step],services=servicesFor(j,name),last=step===names.length-1,nextNode=j.nodes.find(v=>!v.optional&&v.depth===(n?.depth??j.depth)+1),nextLabel=!last?names[step+1]:nextNode?path(j,nextNode)[arrivalStep(j,nextNode)]:n?.type==='champion'?'Journey complete':'Pokémon League';
 const completed=j.phase==='result'&&E.current(j)?.id===n?.id,travel=['event','camp'].includes(n?.type),canContinue=!j.recovery&&j.phase!=='battle'&&j.phase!=='complete'&&(!last||completed||travel),kind=category(j,name,n),objective=objectiveFor(kind,n,completed,last),blockedText=canContinue?'':objective;
 return {id:destinationId(j,name),name,nextId:destinationId(j,nextLabel),objective,exploreText:`Look around ${name}. Watch your footing; supplies may turn up.`,kind:category(j,name,n),region:j.region,habitat:n?.habitat||'meadow',nodeId:n?.id,services,nextLabel,continueLabel:n?.type==='champion'?'FINISH REGIONAL JOURNEY':`${['town','city','league'].includes(category(j,name,n))?'LEAVE FOR':'CONTINUE TO'} ${nextLabel.toUpperCase()}`,canContinue,blockedText,segment:step+1,segments:names.length,chapterIndex:n?.chapterIndex??j.chapterIndex,sectionIndex:n?.sectionIndex??j.sectionIndex};
}
function local(j){const n=mainNode(j),nodeId=j.backtrack?.name?`backtrack:${j.backtrack.name}`:n?.id,old=j.locationFlow;if(old?.nodeId===nodeId&&old.traversal===(j.traversal||0))return old;j.locationFlow={nodeId,step:j.backtrack?0:stepFor(j,n),traversal:j.traversal||0,feedback:null};return j.locationFlow;}
function notice(j,text){const p=describe(j),f=local(j);f.feedback={placeId:p.id,text};return text;}
function feedbackFor(j){const f=j?.locationFlow,p=describe(j),nodeId=j?.backtrack?.name?`backtrack:${j.backtrack.name}`:p?.nodeId;return f?.nodeId===nodeId&&f.traversal===(j.traversal||0)&&f.feedback?.placeId===p?.id?f.feedback.text:'';}
function dismiss(j){if(!j?.locationFlow?.feedback)return false;j.locationFlow.feedback=null;return true;}
function actionsFor(save,j=save?.adventureRegional?.active){const p=describe(j),current=E.current(j);if(!p||j.recovery||['node','battle','complete'].includes(j.phase)||j.phase==='result'&&(current?.optional||milestone(current)))return [];const n=mainNode(j),last=stepFor(j,n)===path(j,n).length-1,done=j.phase==='result'&&current?.id===n.id,available=E.available(j),out=[],add=(key,label,extra={})=>out.push({key,label,...extra}),authoredRows=Authored?.eligible?.(save,j,p)||[];
 for(const e of authoredRows)add(`authored:${e.id}`,e.label,{authoredEventId:e.id,authoredKind:e.kind});
 if(j.backtrack){if(p.services.talk)add('talk','TALK TO LOCALS');if(p.services.center)add('center','POKÉMON CENTER');if(p.services.mart)add('mart',p.services.martLabel,{screen:'mart'});if(E.hasEncounterPool?.(j,p.name))add('hunt-local','LOOK FOR POKÉMON');add('return-story','RETURN TO STORY');return [...out.slice(0,6),...(Activities?.actionsFor(save,p)||[])].slice(0,7);}
 if(p.services.talk)add('talk','TALK TO LOCALS');
 if(p.services.center)add('center','POKÉMON CENTER');
 if(p.services.home&&last&&n.type==='event'&&!j.claims[n.id]&&j.phase==='map')add('heal','REST AT HOME',{nodeId:n.id});
 if(p.services.home&&last&&n.type==='camp'&&!done&&j.phase==='map')add('heal','REST AT HOME',{nodeId:n.id});
 if(p.services.mart)add('mart',p.services.martLabel,{screen:'mart'});
 if(last&&!done&&['trainer','victory-road','gym','trial','elite-four','league-round','champion'].includes(n.type))add('battle',['gym','trial'].includes(n.type)?`CHALLENGE ${p.name.toUpperCase()}`:['elite-four','league-round','champion'].includes(n.type)?'LEAGUE CHALLENGE':'TRAINER',{nodeId:n.id});
 const cache=!authoredRows.length&&last&&available.find(v=>v.optional&&v.type==='cache');
 const requiredEncounter=last&&!done&&['wild','rare'].includes(n.type)?n:null;
 const optionalRare=!requiredEncounter&&last&&available.find(v=>v.optional&&v.type==='rare');
 const authoredEvent=!requiredEncounter&&!cache&&!optionalRare&&!authoredRows.length&&last&&!done&&n.type==='event'&&!j.claims[n.id]?n:null;
 const exploreTarget=requiredEncounter||cache||optionalRare||authoredEvent;
 if(exploreTarget)add('explore','EXPLORE AREA',{nodeId:exploreTarget.id,exploreKind:['wild','rare'].includes(exploreTarget.type)?'battle':exploreTarget.type==='event'?'event':'safe'});
 else if(!last&&p.kind==='route'&&!local(j).exploredPlaces?.[p.id])add('explore-local','EXPLORE AREA');
 else if(last&&j.phase==='map'&&E.hasEncounterPool?.(j,p.name))add('hunt-local','LOOK FOR POKÉMON');
 if(!last&&milestone(n))add('gym',`ENTER ${p.nextLabel.toUpperCase()}`,{nodeId:n.id,destinationId:p.nextId});
 if(last&&n.type==='gym'&&!done&&j.phase==='map'&&path(j,n).length>1)add('leave-gym','LEAVE GYM',{destinationId:destinationId(j,path(j,n)[0])});
 const next=j.nodes.find(v=>!v.optional&&v.depth===n.depth+1);if(last&&n.type==='camp'&&next?.type==='gym')add('gym',`ENTER ${p.nextLabel.toUpperCase()}`,{nodeId:next.id,destinationId:p.nextId});
 for(const d of available.filter(v=>v.optional&&!['cache','rare','wild-hunt'].includes(v.type))){if(d.type==='shop'&&!p.services.mart)add('merchant','TRAVELLING MERCHANT',{nodeId:d.id,screen:'mart',context:'merchant'});}
 return [...out.slice(0,6),...(Activities?.actionsFor(save,p)||[])].slice(0,7);
}
function outcome(applied,extra={}){return {applied:!!applied,...extra};}
function perform(save,key){const j=E.ensureSave(save).active;if(!j)return outcome(false);const action=actionsFor(save,j).find(a=>a.key===key);if(!action)return outcome(false);const p=describe(j),n=mainNode(j);local(j);dismiss(j);
 if(action.authoredEventId){const opened=Authored?.open?.(save,j,action.authoredEventId);return opened?.applied?outcome(true,{authoredEvent:opened,place:p}):outcome(false,{reason:opened?.reason||'That event is unavailable.'});}
 if(key==='fish')return outcome(true,{activity:'fish',place:p});
 if(key==='hunt-local')return outcome(E.enterLocalWild?.(save,p.name));
 if(key==='return-story')return outcome(returnToStory(save),{destination:describe(j)?.name});
 if(key==='leave-gym'){const f=local(j);f.step=0;f.gymCityReturn=true;j.location=path(j,n)[0];return outcome(true,{destination:j.location})}
 if(key==='talk')return outcome(true,{text:notice(j,hints[p.name]||`${p.nextLabel} is the next stop. Take care of your partners on the road.`)});
 if(key==='center'){if(!E.restoreAtCenter(save))return outcome(false);return outcome(true,{text:notice(j,'Party restored. HP, PP and status recovered.')});}
 if(key==='mart'||key==='merchant')return outcome(true,{screen:'mart',context:action.context});
 if(key==='hunt')return outcome(true,{habitat:action.habitat});
 if(key==='gym'){const moved=continueTravel(save);return outcome(moved.applied,{destination:describe(j)?.name});}
 if(key==='heal'){if(j.phase==='result'||j.phase==='node')return outcome(false);if(E.enter(save,n.id)&&E.resolveNode(save,'safe')){notice(j,n.type==='camp'?'Party restored at home.':'Your party recovered a little at home.');return outcome(true)}return outcome(false);}
 if(key==='explore'){if(action.nodeId){dismiss(j);if(['battle','event'].includes(action.exploreKind))return outcome(E.enter(save,action.nodeId));return outcome(E.enter(save,action.nodeId)&&E.resolveNode(save,'safe'));}return outcome(false);}
 if(key==='explore-local'){const f=local(j);f.exploredPlaces=f.exploredPlaces||{};if(f.exploredPlaces[p.id])return outcome(false);const seed=String(`${p.id}:${n?.seed||0}:${j.traversal||0}`),roll=[...seed].reduce((v,ch)=>(v*33+ch.charCodeAt(0))>>>0,5381)%4;save.inventory=save.inventory||{};let text;if(roll===0){save.profile.coins=(save.profile.coins||0)+20;text='Found 20 Lucky Coins.';}else if(roll===1){save.inventory.pokeball=(save.inventory.pokeball||0)+1;text='Found 1 Poké Ball.';}else if(roll===2){save.inventory.berry=(save.inventory.berry||0)+1;text='Found 1 Berry.';}else{save.inventory.potion=(save.inventory.potion||0)+1;text='Found 1 Potion.';}f.exploredPlaces[p.id]=true;notice(j,text);return outcome(true);}
 if(key==='battle'){dismiss(j);return outcome(E.enter(save,action.nodeId));}return outcome(false);
}


const AUTHORED_DISCOVERIES={'Route 1':['route-1-trail-marker'],'Viridian Forest':['viridian-forest-keepsake']};
function authoredSummary(save,j=save?.adventureRegional?.active,place=describe(j)){if(!j||!place||place.region!=='kanto'||!AuthoredCore)return{available:0,discoveriesFound:0,discoveriesTotal:0,requestStatus:null,stats:{completedEvents:0,discoveries:0,requestsCompleted:0,partyAssists:0}};const state=AuthoredCore.ensureState(save),ids=AUTHORED_DISCOVERIES[place.name]||[],found=ids.filter(id=>state.discoveries[id]).length,completedElsewhere=Array.isArray(j.completedLocations)&&j.completedLocations.includes(place.name),currentName=describe(j)?.name,queryJourney=completedElsewhere&&place.name!==currentName?{...j,backtrack:{name:place.name,returnName:currentName||j.location}}:j,available=(Authored?.eligible?.(save,queryJourney,place)||[]).length,requestStatus=place.name==='Viridian City'?state.requests['viridian-lost-tag']?.status||null:null;return{available,discoveriesFound:found,discoveriesTotal:ids.length,requestStatus,stats:AuthoredCore.stats(save)};}
function chooseAuthored(save,eventId,choiceId){const j=E.ensureSave(save).active;if(!j)return outcome(false);const out=Authored?.choose?.(save,j,eventId,choiceId);if(out?.applied&&out.text)notice(j,out.text);return out||outcome(false);}
function closeAuthored(save,eventId){return !!Authored?.close?.(save,eventId);}
function visit(save,name){const j=E.ensureSave(save).active;if(!j||j.phase!=='map'||j.recovery||!j.completedLocations?.includes(name))return false;const n=j.nodes.find(v=>!v.optional&&v.name===name);if(!n)return false;const origin=describe(j)?.name||j.location;j.backtrack={name,returnName:origin};j.location=name;j.locationFlow=null;return true;}
function returnToStory(save){const j=E.ensureSave(save).active;if(!j?.backtrack||j.phase!=='map')return false;delete j.backtrack;j.locationFlow=null;j.location=describe(j)?.name||j.checkpoint?.name;return true;}
function routineText(j,n){const text=j.resolutions[j.current]?.text||'';if(n.type==='camp')return describe(j).services.home?'Party restored at home.':'Party restored.';if(n.type==='shop')return 'Purchases saved.';if(n.type==='wild-hunt')return 'Wild Hunt ready.';if(n.type==='tm')return text;if(/already claimed|already explored/.test(text))return 'Already explored. Supplies kept.';if(n.type==='cache')return 'Found Lucky Coins, 1 Potion and 2 Poké Balls.';if(j.battle?.result?.kind==='capture')return 'Companion caught.';if(['trainer','victory-road'].includes(n.type))return 'Trainer defeated.';if(['wild','rare'].includes(n.type))return 'Encounter cleared.';if(/12%/.test(text))return 'Rough ground: party lost 12% HP.';if(/supply purse/.test(text))return 'Found a supply purse.';return 'Your party recovered a little.';}
function settleRoutine(save){const j=E.ensureSave(save).active,n=E.current(j);if(j?.phase!=='result'||!n||milestone(n))return outcome(false);const p=describe(j),text=feedbackFor(j)||routineText(j,n);if(n.optional){if(!E.advance(save))return outcome(false);j.location=p.name;notice(j,text);return outcome(true)}const f=local(j);if(f.routineSettledId===n.id)return outcome(false);f.routineSettledId=n.id;notice(j,text);return outcome(true);}
function continueTravel(save){const j=E.ensureSave(save).active;if(!j)return outcome(false);if(j.backtrack)return outcome(returnToStory(save),{destination:describe(j)?.name});const p=describe(j),n=mainNode(j);if(!p.canContinue)return outcome(false,{reason:p.blockedText});const f=local(j),names=path(j,n),step=stepFor(j,n);dismiss(j);
 if(step<names.length-1){f.step=step+1;f.gymCityReturn=false;j.location=names[f.step];return outcome(true)}
 const moved=j.phase==='result'?E.advance(save):E.skipTravel(save,n.id);if(!moved)return outcome(false);j.locationFlow=null;if(j.phase!=='complete')j.location=describe(j).name;return outcome(true);
}
function travelFor(save,j=save?.adventureRegional?.active,actions=actionsFor(save,j)){const p=describe(j);if(!p)return null;if(actions.some(a=>a.destinationId===p.nextId))return null;return {label:p.continueLabel,destinationId:p.nextId,enabled:p.canContinue};}
function sceneFor(place,assets={},habitatAssets=assets){if(!place)return habitatAssets.destinations?.meadow?.scene||null;if(place.scene)return place.scene;const named=assets.named?.[place.region]?.[place.name],exact=assets.places?.[place.id]||named,category=assets.categories?.[place.region]?.[place.kind]||assets.categories?.[place.kind],resolve=key=>typeof key==='object'&&key?key.path:key&&assets.scenes?.[key]?.path||(/\.(png|webp|jpe?g)$/i.test(key||'')?key:null);return resolve(exact)||resolve(category)||habitatAssets.destinations?.[place.habitat]?.scene||habitatAssets.destinations?.meadow?.scene||null;}
const api={describe,actionsFor,perform,authoredSummary,chooseAuthored,closeAuthored,visit,returnToStory,continue:continueTravel,settleRoutine,feedbackFor,dismiss,sceneFor,travelFor};root.LuckyDexLocationFlow=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
