(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports){module.exports=api;return;}root.LuckyDexPikachuBeachDxContent=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const DIFFICULTIES=Object.freeze({
 easy:Object.freeze({key:'easy',label:'Easy',enemyIntervalMs:1900,damageMultiplier:.72,enemyHpMultiplier:.8,forwardMultiplier:.96,scoreMultiplier:1}),
 normal:Object.freeze({key:'normal',label:'Normal',enemyIntervalMs:1400,damageMultiplier:1,enemyHpMultiplier:1,forwardMultiplier:1,scoreMultiplier:1.2}),
 hard:Object.freeze({key:'hard',label:'Hard',enemyIntervalMs:950,damageMultiplier:1.35,enemyHpMultiplier:1.28,forwardMultiplier:1.04,scoreMultiplier:1.45})
});
const DISTANCES=Object.freeze({
 short:Object.freeze({key:'short',label:'5 KM',target:60}),
 standard:Object.freeze({key:'standard',label:'10 KM',target:105}),
 long:Object.freeze({key:'long',label:'20 KM',target:165})
});
const ENEMIES=Object.freeze({
 wingull:{id:'wingull',name:'Wingull',sprite:'s_wingull',hp:1,damage:8,score:90,speed:.15,radius:.045},
 sharpedo:{id:'sharpedo',name:'Sharpedo',sprite:'s_sharpedo',hp:3,damage:15,score:180,speed:.25,radius:.065},
 pelipper:{id:'pelipper',name:'Pelipper',sprite:'s_pelipper1',hp:3,damage:12,score:170,speed:.12,radius:.06},
 qwilfish:{id:'qwilfish',name:'Qwilfish',sprite:'s_qwilfish',hp:2,damage:12,score:130,speed:.13,radius:.05},
 starmie:{id:'starmie',name:'Starmie',sprite:'s_starmie',hp:3,damage:13,score:190,speed:.11,radius:.055},
 toxapex:{id:'toxapex',name:'Toxapex',sprite:'s_toxapex',hp:4,damage:16,score:230,speed:.08,radius:.065},
 octillery:{id:'octillery',name:'Octillery',sprite:'s_octillery',hp:3,damage:13,score:190,speed:.1,radius:.055},
 drifloon:{id:'drifloon',name:'Drifloon',sprite:'s_drifloon',hp:2,damage:10,score:140,speed:.1,radius:.05},
 voltorb:{id:'voltorb',name:'Voltorb',sprite:'s_voltorb',hp:1,damage:20,score:120,speed:.2,radius:.045},
 tentacruel:{id:'tentacruel',name:'Tentacruel',sprite:'s_tentacruel_idle',hp:6,damage:18,score:350,speed:.07,radius:.09}
});
const ALLIES=Object.freeze({
 seaking:Object.freeze({id:'seaking',name:'Seaking',sprite:'s_seaking1',spawnAt:.20,effect:'ringSweep',description:'Sweeps up 5 rings when it joins.'}),
 lapras:Object.freeze({id:'lapras',name:'Lapras',sprite:'s_lapras',spawnAt:.45,effect:'shield',description:'Restores 20 HP and gives a 5-second shield.'}),
 natu:Object.freeze({id:'natu',name:'Natu',sprite:'s_natu1',spawnAt:.70,effect:'assistFire',description:'Auto-fires at nearby enemies and bosses.'})
});
const PICKUPS=Object.freeze({hpUp:Object.freeze({id:'hpUp',name:'HP Up',sprite:'s_hpUp',heal:35,radius:.055})});
const BOSSES=Object.freeze([
 Object.freeze({id:'articuno',name:'Articuno',sprite:'s_articuno_0',attackSprite:'s_icebeam2',spawnAt:.16,hp:70,attackEveryMs:1500,attackSpeed:.52,attackRadius:.055,damage:12,score:1800,pattern:'iceBeam'}),
 Object.freeze({id:'zapdos',name:'Zapdos',sprite:'s_zapdos_0',attackSprite:'s_lightning',spawnAt:.33,hp:82,attackEveryMs:1350,attackSpeed:.60,attackRadius:.06,damage:14,score:2200,pattern:'lightning'}),
 Object.freeze({id:'moltres',name:'Moltres',sprite:'s_moltress_0',attackSprite:'s_fire',spawnAt:.50,hp:94,attackEveryMs:1250,attackSpeed:.48,attackRadius:.065,damage:15,score:2600,pattern:'fire'}),
 Object.freeze({id:'lugia',name:'Lugia',sprite:'s_lugia_idle',attackSprite:'s_aeroblast',spawnAt:.68,hp:115,attackEveryMs:1150,attackSpeed:.68,attackRadius:.065,damage:17,score:3300,pattern:'aeroblast'}),
 Object.freeze({id:'wailord',name:'Wailord',sprite:'s_wailord_idle',attackSprite:'s_hydropump',spawnAt:.86,hp:145,attackEveryMs:1000,attackSpeed:.42,attackRadius:.085,damage:19,score:4200,pattern:'waterSpout'})
]);
const SPRITE_FRAMES=Object.freeze({
 s_wave1:6,s_ring:4,s_hpUp:5,s_seaking1:3,s_lapras:7,s_natu1:2,s_wingull:6,s_sharpedo:37,s_pelipper1:6,s_qwilfish:4,s_starmie:4,s_toxapex:4,s_octillery:24,s_drifloon:4,s_voltorb:1,s_tentacruel_idle:8,
 s_articuno_0:3,s_zapdos_0:3,s_moltress_0:3,s_lugia_idle:6,s_wailord_idle:4,s_icebeam2:4,s_lightning:40,s_fire:24,s_aeroblast:25,s_hydropump:4,
 s_p_0:2,s_p_u1:2,s_p_sp1:4,s_p_i1:10,s_bullet_small:3,s_electroBall:19
});
return Object.freeze({DIFFICULTIES,DISTANCES,ENEMIES,ALLIES,PICKUPS,BOSSES,SPRITE_FRAMES});
});
