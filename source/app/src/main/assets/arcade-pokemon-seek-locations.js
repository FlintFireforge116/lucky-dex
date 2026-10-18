(function(root,factory){const api=factory();if(typeof module!=='undefined'&&module.exports)module.exports=api;root.LuckyDexPokemonSeekLocations=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  // Source-backed scenery, newly composed for LuckyDex. These descriptive node
  // names are not claims about the original Dream World's historical room map.
  const JPEG=new Set(['forest-base','sky-base','manor-e','manor-b','mountain-b','ice-a','ice-b','ice-c','park-a','park-b']);
  const art=id=>`arcade/dream-world/seek/${id}.${JPEG.has(id)?'jpg':'webp'}`;
  const layer=(id,asset,x,y,w,h,z=2)=>({id,asset:art(asset),x,y,w,h,z});
  const prop=(label,asset,x,y,w,h)=>({label,...layer(label.toLowerCase().replace(/[^a-z]+/g,'-'),asset,x,y,w,h)});
  function scene(id,name,background,props,options={}){
    const base={id:'scene',asset:art(background),x:50,y:50,w:100,h:100,z:0,background:true};
    return {id,name,shortName:name,background:art(background),layers:[base,...(options.layers||[]),...props.map(({label,...p})=>p)],
      spots:options.spots||props.map((p,i)=>({id:`${id}-spot-${i}`,label:p.label,layerId:p.id,x:p.x,y:p.y,w:Math.max(12,Math.min(35,p.w)),h:Math.max(16,Math.min(38,p.h)),evidence:`Visible ${p.label.toLowerCase()} in source-backed ${p.asset.split('/').pop()}`})),connections:[]};
  }
  function outdoor(id,name,bg,shift=0){return scene(id,name,bg,[prop('Leafy bush','forest-layer-72',23+shift,64,31,51),prop('Grassy mound','forest-layer-393',66-shift,91,110,48),prop('Low grass','forest-layer-120',44,95,125,45)]);}
  function clouds(id,name,shift=0){return scene(id,name,'sky-layer-8',[prop('Cloud shelf','sky-layer-188',28+shift,70,47,43),prop('Cloud column','sky-layer-273',78-shift,52,29,62),prop('Small cloud','sky-layer-188',51,37,31,27)]);}
  function sea(id,name,shift=0){return scene(id,name,'sea-layer-1',[prop('Curved rock','sea-layer-105',15+shift,64,40,85),prop('Rock ledge','sea-layer-429',78-shift,88,65,53),prop('Water ripples','sea-layer-4',50,22,120,36)]);}
  function room(id,name,main){return scene(id,name,'manor-layer-65',[prop(main==='manor-bed'?'Blue bed':main==='manor-sofa'?'Velvet sofa':'Low bookcase',main,28,72,44,47),prop('Amber lamp','manor-lamp',76,57,16,28),prop('Side bookcase','manor-bookcase',76,83,36,31)],{layers:[layer('floor','manor-b',50,87,100,34,1)]});}
  function rocks(id,name,shift=0){return scene(id,name,'mountain-b',[prop('Rocky shelf','mountain-layer-189',30+shift,105,120,72),prop('Rock pool','mountain-layer-514',92-shift,89,70,62),prop('Low bush','forest-layer-72',51,56,21,34)],{spots:[{id:id+'-rock',label:'Rocky shelf',layerId:'rocky-shelf',x:25,y:86,w:24,h:20,evidence:'Recovered rocky foreground ledge'},{id:id+'-pool',label:'Rock pool',layerId:'rock-pool',x:81-shift,y:80,w:25,h:24,evidence:'Blue pool and its stone rim'},{id:id+'-bush',label:'Low bush',layerId:'low-bush',x:51,y:56,w:20,h:28,evidence:'Visible recovered leafy bush'}]});}
  function cave(id,name,bg){
    const labels=bg==='ice-a'?['Ice wall','Frozen ledge','Frozen floor']:bg==='ice-b'?['Left stone wall','Rock ledge','Cave floor']:['Stone arch','Cave opening','Grass edge'];
    const positions=bg==='ice-c'?[[22,40],[52,53],[82,84]]:[[22,37],[79,62],[49,88]];
    return scene(id,name,bg,[],{spots:labels.map((label,i)=>({id:id+'-spot-'+i,label,layerId:'scene',x:positions[i][0],y:positions[i][1],w:25,h:25,evidence:label+' visible in recovered '+bg+' background'}))});
  }
  function park(id,name,bg,shift=0){return scene(id,name,bg,[prop('Purple balloon','park-layer-874',23+shift,45,18,40),prop('Red balloon','park-layer-889',78-shift,35,16,36)],{spots:[{id:id+'-ground',label:bg==='park-a'?'Stone paving':'Low hedge',layerId:'scene',x:bg==='park-a'?50:20,y:bg==='park-a'?88:73,w:25,h:22,evidence:bg==='park-a'?'Paved plaza in recovered park-a':'Visible hedge in recovered park-b'},{id:id+'-purple',label:'Purple balloon',layerId:'purple-balloon',x:23+shift,y:45,w:18,h:30,evidence:'Recovered purple balloon'},{id:id+'-red',label:'Red balloon',layerId:'red-balloon',x:78-shift,y:35,w:16,h:30,evidence:'Recovered red balloon'}]});}
  function cafe(id,name,shift=0){return scene(id,name,'cafe-interior',[prop('Café table','cafe-table',47+shift,77,55,40),prop('Coffee pot','cafe-pot',33+shift,53,13,23),prop('Blue-rimmed cup','cafe-cup',61+shift,57,9,15)]);}
  const encounter=slug=>`https://bulbapedia.bulbagarden.net/wiki/${slug}`;
  function area(id,name,shortName,slug,targets,locations,links){
    locations.forEach(n=>{n.areaId=id;});
    links.forEach(([a,b])=>{const from=locations[a],to=locations[b];from.connections.push({to:to.id,label:to.shortName,direction:b>a?'right':'left'});to.connections.push({to:from.id,label:from.shortName,direction:'left'});});
    return {id,name,shortName,encounterSource:encounter(slug),targets:targets.map(([dex,label])=>({dex,label})),locations};
  }
  const AREAS=[
    area('forest','Pleasant Forest','Forest','Pleasant_Forest',[[77,'Ponyta'],[179,'Mareep'],[187,'Hoppip']],[outdoor('forest-edge','Woodland Edge','forest-base'),outdoor('forest-clearing','Grassy Clearing','forest-layer-8',8),outdoor('forest-understory','Understory','forest-base',-5),outdoor('forest-grass','Grass Bank','forest-layer-8',-8)],[[0,1],[1,2],[1,3]]),
    area('sky','Windswept Sky','Sky','Windswept_Sky',[[278,'Wingull'],[333,'Swablu'],[441,'Chatot']],[clouds('sky-landing','Cloud Landing'),clouds('sky-column','Cloudbank',-6),clouds('sky-high','High Clouds',8)],[[0,1],[1,2]]),
    area('sea','Sparkling Sea','Sea','Sparkling_Sea',[[116,'Horsea'],[129,'Magikarp'],[222,'Corsola']],[sea('sea-ledge','Submerged Ledge'),sea('sea-wall','Rock Wall',8),sea('sea-ripples','Blue Waters',-5)],[[0,1],[0,2]]),
    area('manor','Spooky Manor','Manor','Spooky_Manor',[[92,'Gastly'],[96,'Drowzee'],[167,'Spinarak']],[
      scene('manor-steps','Manor Steps','manor-e',[],{spots:[{id:'steps',label:'Front steps',layerId:'scene',x:50,y:79,w:26,h:24,evidence:'Front staircase in manor-e'},{id:'hedge',label:'Left hedge',layerId:'scene',x:22,y:73,w:27,h:30,evidence:'Left shrubbery in manor-e'},{id:'window',label:'Right window',layerId:'scene',x:70,y:36,w:19,h:28,evidence:'Right upper window in manor-e'}]}),
      room('manor-shelves','Bookcase Room','manor-bookcase'),room('manor-sofa-room','Sitting Room','manor-sofa'),room('manor-bedroom','Bedroom','manor-bed'),room('manor-lamp-room','Lamplit Room','manor-bookcase')],[[0,1],[1,2],[1,3],[3,4]]),
    area('mountain','Rugged Mountain','Mountain','Rugged_Mountain',[[231,'Phanpy'],[246,'Larvitar'],[322,'Numel']],[rocks('mountain-trail','Rocky Trail'),rocks('mountain-pool','Rock Pool',8),rocks('mountain-ridge','Ridge',-5)],[[0,1],[0,2]]),
    area('ice','Icy Cave','Cave','Icy_Cave_(Dream_World)',[[220,'Swinub'],[361,'Snorunt'],[173,'Cleffa']],[cave('ice-chamber','Frozen Chamber','ice-a'),cave('ice-stone','Stone Passage','ice-b'),cave('ice-entrance','Stone Entrance','ice-c')],[[0,1],[1,2]]),
    area('park','Dream Park','Park','Dream_Park',[[273,'Seedot'],[287,'Slakoth'],[316,'Gulpin']],[park('park-walkway','Park Walkway','park-b'),park('park-lawn','Open Lawn','park-b',7),park('park-plaza','Balloon Plaza','park-a',-6)],[[0,1],[0,2]]),
    area('cafe','Pokémon Café Forest','Café','Pok%C3%A9mon_Caf%C3%A9_Forest',[[61,'Poliwhirl'],[133,'Eevee'],[235,'Smeargle'],[412,'Burmy']],[cafe('cafe-hall','Café Hall'),cafe('cafe-nook','Café Nook',-8),outdoor('cafe-edge','Forest Edge','forest-base',5)],[[0,1],[0,2]])
  ];
  return {AREAS,art,getArea:id=>AREAS.find(a=>a.id===id)||AREAS.find(a=>a.id==='manor')};
});
