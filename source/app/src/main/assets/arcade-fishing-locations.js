(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.LuckyDexFishingLocations=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';
const REGION_ORDER=['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea'];
const ROD_TIER={old:0,good:1,super:2,deep:3};
const REGION_RANGES={kanto:[1,151],johto:[152,251],hoenn:[252,386],sinnoh:[387,493],unova:[494,649],kalos:[650,721],alola:[722,809],galar:[810,905],paldea:[906,1025]};
const ARCHIVE_BASE='https://archives.bulbagarden.net/wiki/Special:Redirect/file/';
const remote=file=>ARCHIVE_BASE+encodeURIComponent(String(file).replace(/ /g,'_'));
const p=(speciesId,minRod='old',weight=1,extra={})=>({speciesId,minRod,weight,...extra});
const SILHOUETTE_BY_AREA={
 'kanto-cerulean-waters':118,'kanto-vermilion-harbour':72,'kanto-safari-pond':118,'kanto-seafoam-coast':72,
 'johto-cherrygrove-shore':170,'johto-lake-of-rage':129,'johto-olivine-harbour':170,'johto-whirl-islands':170,
 'hoenn-dewford-shore':320,'hoenn-slateport-harbour':318,'hoenn-route-119':339,'hoenn-sootopolis-depths':320,
 'sinnoh-valley-windworks':456,'sinnoh-pastoria-marsh':339,'sinnoh-canalave-harbour':456,'sinnoh-league-coast':456,
 'unova-driftveil-waters':550,'unova-undella-bay':592,'unova-village-bridge':550,'unova-seaside-cave':592,
 'kalos-ambrette-coast':690,'kalos-cyllage-shore':692,'kalos-azure-bay':690,'kalos-couriway-river':118,
 'alola-melemele-sea':746,'alola-brooklet-hill':746,'alola-akala-coast':746,'alola-poni-wilds':746,
 'galar-hulbury-harbour':846,'galar-motostoke-riverbank':833,'galar-lake-of-outrage':846,'galar-crown-tundra':846,
 'paldea-south-province-coast':963,'paldea-casseroya-lake':976,'paldea-porto-marinada':963,'paldea-north-sea':976
};
const a=(id,name,file,fallbackBackdrop,backdropPosition,pool)=>({id,name,scene:remote(file),fallbackBackdrop,backdropPosition,silhouetteSpeciesId:SILHOUETTE_BY_AREA[id]||129,pool});
const REGIONS={
 kanto:{id:'kanto',name:'Kanto',regionalTarget:10,areas:[
  a('kanto-cerulean-waters','Cerulean Waters','Cerulean City FRLG.png','adventure/location-scenes/kanto-city.png','66% 36%',[p(129),p(118),p(54),p(60),p(7,'good'),p(55,'good'),p(61,'good'),p(119,'good'),p(8,'super'),p(62,'super'),p(130,'super'),p(134,'deep'),p(9,'deep')]),
  a('kanto-vermilion-harbour','Vermilion Harbour','Vermilion City FRLG.png','adventure/location-scenes/kanto-coast.png','72% 56%',[p(72),p(98),p(116),p(90),p(120),p(73,'good'),p(99,'good'),p(117,'good'),p(121,'super'),p(134,'super')]),
  a('kanto-safari-pond','Safari Pond','Safari Zone area 2 FRLG.png','adventure/location-scenes/kanto-coast.png','30% 52%',[p(129),p(60),p(54),p(79,'good'),p(118,'good'),p(80,'super'),p(147,'super',.35),p(130,'deep')]),
  a('kanto-seafoam-coast','Seafoam Coast','FL Seafoam Islands.png','adventure/location-scenes/kanto-coast.png','58% 54%',[p(90),p(98),p(116),p(86,'good'),p(138,'good'),p(140,'good'),p(87,'super'),p(91,'super'),p(139,'super'),p(141,'super'),p(131,'deep')])
 ]},
 johto:{id:'johto',name:'Johto',regionalTarget:10,areas:[
  a('johto-cherrygrove-shore','Cherrygrove Shore','Cherrygrove City HGSS.png','adventure/location-scenes/johto-coast.png','64% 58%',[p(129),p(170),p(183),p(194),p(158,'good'),p(184,'good'),p(195,'good'),p(159,'super'),p(160,'deep')]),
  a('johto-lake-of-rage','Lake of Rage','Lake of Rage HGSS.png','adventure/location-scenes/johto-coast.png','52% 48%',[p(129),p(118),p(223),p(211,'good'),p(170,'good'),p(171,'good'),p(224,'super'),p(186,'super'),p(130,'super')]),
  a('johto-olivine-harbour','Olivine Harbour','Olivine City HGSS.png','adventure/location-scenes/johto-coast.png','68% 58%',[p(72),p(170),p(211),p(222),p(223,'good'),p(171,'good'),p(226,'super'),p(230,'deep')]),
  a('johto-whirl-islands','Whirl Islands','Whirl Islands 1F HGSS.png','adventure/location-scenes/johto-cave.png','50% 58%',[p(116),p(170),p(223),p(226,'good'),p(117,'good'),p(199,'super'),p(230,'super'),p(245,'deep')])
 ]},
 hoenn:{id:'hoenn',name:'Hoenn',regionalTarget:11,areas:[
  a('hoenn-dewford-shore','Dewford Shore','Dewford Town E.png','adventure/location-scenes/hoenn-coast.png','74% 42%',[p(278),p(320),p(370),p(72),p(258,'good'),p(318,'good'),p(363,'good'),p(366,'good'),p(319,'super'),p(364,'super'),p(369,'super'),p(365,'deep')]),
  a('hoenn-slateport-harbour','Slateport Harbour','Slateport City E.png','adventure/location-scenes/hoenn-coast.png','72% 62%',[p(278),p(320),p(370),p(72),p(279,'good'),p(318,'good'),p(321,'super'),p(319,'super')]),
  a('hoenn-route-119','Route 119','Hoenn Route 119 E.png','adventure/location-scenes/hoenn-route.png','48% 58%',[p(270),p(283),p(339),p(341),p(258,'good'),p(271,'good'),p(340,'good'),p(349,'super',.28),p(342,'super'),p(259,'super'),p(260,'deep'),p(272,'super')]),
  a('hoenn-sootopolis-depths','Sootopolis Depths','Hoenn Route 126 E.png','adventure/location-scenes/hoenn-coast.png','52% 50%',[p(320),p(370),p(366),p(369,'good'),p(367,'super'),p(368,'super'),p(321,'super'),p(350,'deep',.16),p(382,'deep',.025)])
 ]},
 sinnoh:{id:'sinnoh',name:'Sinnoh',regionalTarget:9,areas:[
  a('sinnoh-valley-windworks','Valley Windworks','Valley Windworks Pt.png','adventure/art/meadow-scene.png','56% 60%',[p(129),p(418),p(422),p(456),p(393,'good'),p(400,'good'),p(419,'super'),p(423,'super'),p(394,'super'),p(395,'deep')]),
  a('sinnoh-pastoria-marsh','Pastoria Marsh','Great Marsh Pt.png','adventure/art/meadow-scene.png','50% 52%',[p(129),p(194),p(339),p(422),p(400,'good'),p(418,'good'),p(423,'good'),p(195,'super')]),
  a('sinnoh-canalave-harbour','Canalave Harbour','Canalave City Pt.png','adventure/art/coast-scene.png','60% 58%',[p(72),p(456),p(458),p(418),p(457,'good'),p(419,'good'),p(395,'super')]),
  a('sinnoh-league-coast','Pokémon League Coast','Sinnoh Route 223 Pt.png','adventure/art/coast-scene.png','58% 52%',[p(72),p(456),p(458),p(457,'good'),p(489,'super'),p(490,'deep'),p(484,'deep',.025)])
 ]},
 unova:{id:'unova',name:'Unova',regionalTarget:10,areas:[
  a('unova-driftveil-waters','Driftveil Waters','Driftveil City B2W2.png','adventure/art/coast-scene.png','58% 58%',[p(535),p(550),p(129),p(501,'good'),p(536,'good'),p(502,'super'),p(537,'super'),p(503,'deep')]),
  a('unova-undella-bay','Undella Bay','Undella Bay Spring B2W2.png','adventure/art/coast-scene.png','52% 52%',[p(592),p(594),p(550),p(580),p(593,'good'),p(581,'good'),p(564,'super'),p(565,'super'),p(647,'deep',.025)]),
  a('unova-village-bridge','Village Bridge','Village Bridge Spring B2W2.png','adventure/art/coast-scene.png','50% 58%',[p(535),p(550),p(580),p(129),p(515,'good'),p(594,'good'),p(516,'super'),p(537,'super')]),
  a('unova-seaside-cave','Seaside Cave','Seaside Cave 1F B2W2.png','adventure/art/cave-scene.png','50% 58%',[p(592),p(550),p(129),p(564,'good'),p(593,'super'),p(565,'super'),p(647,'deep',.025)])
 ]},
 kalos:{id:'kalos',name:'Kalos',regionalTarget:8,areas:[
  a('kalos-ambrette-coast','Ambrette Coast','Ambrette Town XY.png','adventure/art/coast-scene.png','60% 56%',[p(688),p(690),p(692),p(129),p(656,'good'),p(689,'super'),p(693,'super'),p(657,'super'),p(658,'deep')]),
  a('kalos-cyllage-shore','Cyllage Shore','Cyllage City XY.png','adventure/art/coast-scene.png','58% 60%',[p(688),p(690),p(692),p(72),p(689,'good'),p(693,'good')]),
  a('kalos-azure-bay','Azure Bay','Azure Bay XY.png','adventure/art/coast-scene.png','55% 52%',[p(690),p(692),p(688),p(72),p(693,'super'),p(721,'deep',.025)]),
  a('kalos-couriway-river','Couriway River','Couriway Town XY.png','adventure/art/meadow-scene.png','52% 58%',[p(129),p(60),p(54),p(656,'good'),p(657,'super'),p(658,'deep')])
 ]},
 alola:{id:'alola',name:'Alola',regionalTarget:9,areas:[
  a('alola-melemele-sea','Melemele Sea','Alola Melemele Sea Map.png','adventure/art/coast-scene.png','56% 52%',[p(746),p(747),p(751),p(72),p(728,'good'),p(779,'good'),p(729,'super'),p(730,'deep')]),
  a('alola-brooklet-hill','Brooklet Hill','Brooklet Hill SM.png','adventure/art/meadow-scene.png','52% 58%',[p(751),p(746),p(767),p(129),p(747,'good'),p(752,'super'),p(768,'super')]),
  a('alola-akala-coast','Akala Coast','Alola Heahea Beach Map.png','adventure/art/coast-scene.png','56% 56%',[p(746),p(747),p(779),p(751),p(748,'super'),p(752,'super')]),
  a('alola-poni-wilds','Poni Wilds','Alola Poni Wilds Map.png','adventure/art/coast-scene.png','54% 58%',[p(767),p(771),p(746),p(779,'good'),p(768,'super'),p(788,'deep',.025)])
 ]},
 galar:{id:'galar',name:'Galar',regionalTarget:9,areas:[
  a('galar-hulbury-harbour','Hulbury Harbour','Galar Hulbury Map.png','adventure/art/coast-scene.png','58% 60%',[p(833),p(846),p(845),p(129),p(816,'good'),p(834,'good'),p(817,'super'),p(847,'super'),p(818,'deep')]),
  a('galar-motostoke-riverbank','Motostoke Riverbank','Galar Motostoke Riverbank Map.png','adventure/art/meadow-scene.png','52% 58%',[p(833),p(846),p(129),p(816,'good'),p(834,'good'),p(817,'super'),p(847,'super')]),
  a('galar-lake-of-outrage','Lake of Outrage','Galar Lake of Outrage Map.png','adventure/art/coast-scene.png','52% 50%',[p(833),p(846),p(845),p(129),p(834,'good'),p(847,'super'),p(902,'deep')]),
  a('galar-crown-tundra','Crown Tundra','Galar Crown Tundra SwSh.png','adventure/art/coast-scene.png','54% 58%',[p(846),p(833),p(129),p(882,'super'),p(883,'super'),p(902,'deep')])
 ]},
 paldea:{id:'paldea',name:'Paldea',regionalTarget:9,areas:[
  a('paldea-south-province-coast','South Province Coast','South Paldean Sea.png','adventure/art/coast-scene.png','56% 55%',[p(960),p(963),p(129),p(912,'good'),p(976,'good'),p(913,'super'),p(961,'super'),p(964,'super'),p(914,'deep')]),
  a('paldea-casseroya-lake','Casseroya Lake','Casseroya Lake SV.png','adventure/art/coast-scene.png','54% 54%',[p(960),p(976),p(978),p(963),p(961,'good'),p(964,'super'),p(977,'super')]),
  a('paldea-porto-marinada','Porto Marinada','Porto Marinada.png','adventure/art/coast-scene.png','58% 58%',[p(960),p(963),p(976),p(978,'good'),p(961,'good'),p(964,'super')]),
  a('paldea-north-sea','North Paldea Sea','North Paldean Sea.png','adventure/art/coast-scene.png','54% 52%',[p(960),p(963),p(976),p(978,'good'),p(977,'super'),p(991,'deep'),p(1009,'deep',.025)])
 ]}
};
function clone(v){return JSON.parse(JSON.stringify(v));}
function buildCatalog(speciesById={}){const regions={};for(const regionId of REGION_ORDER){const src=REGIONS[regionId];const areas=src.areas.map((area,order)=>{const pool=area.pool.filter(row=>speciesById[row.speciesId]).map(row=>({...row}));const species=[...new Set(pool.map(row=>row.speciesId))];return{...clone(area),region:regionId,order,regionalTarget:src.regionalTarget,pool,species,backdrop:area.scene};});const range=REGION_RANGES[regionId]||[1,1025],species=Object.values(speciesById).filter(row=>row&&row.id>=range[0]&&row.id<=range[1]&&Array.isArray(row.types)&&row.types.includes('water')).map(row=>row.id).sort((x,y)=>x-y);regions[regionId]={id:src.id,name:src.name,regionalTarget:src.regionalTarget,species,areas};}return{regions};}
function minRodTier(minRod){return ROD_TIER[minRod]??0;}
return{REGION_ORDER,REGIONS,REGION_RANGES,ROD_TIER,SILHOUETTE_BY_AREA,buildCatalog,minRodTier};
});
