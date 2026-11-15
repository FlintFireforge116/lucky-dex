"""Archived dp6 print facts cross-checked against PokemonTCG/pokemon-tcg-data.
Only used to make the bundled offline fallback immediately testable. The normal
prepare script rebuilds all 146 from the upstream archive before an APK build.
"""
# number: (name,stage,hp,type,evolvesFrom,weakness,weaknessValue,resistance,resistanceValue,retreat,rarity,[(attack,cost,damage,text),...])
PRINTS={
11:('Mewtwo','Basic',80,'Psychic','','Psychic','+20','','',2,'Rare Holo',[
('Hypnoblast','C','10','The Defending Pokémon is now Asleep.'),
('Psychic','PCC','40+','Does 40 damage plus 10 more damage for each Energy attached to the Defending Pokémon.')]),
20:('Bellossom','Stage 2',100,'Grass','Gloom','Fire','+30','Water','-20',1,'Rare',[
('Parallel Gain','G','30','Remove 1 damage counter from each of your Pokémon.'),
('Blend Pollen','GC','40+','Does 40 damage plus 20 more damage for each Vileplume and each Bellossom you have in play. Flip a coin. If heads, the Defending Pokémon is now Burned.')]),
61:('Lucario','Stage 1',90,'Fighting','Riolu','Psychic','+20','','',1,'Uncommon',[
('Focus Blast','F','','Choose 1 of your opponent\'s Pokémon. This attack does 30 damage to that Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'),
('Spike Lariat','FFC','60+','If the Defending Pokémon already has any damage counters on it, this attack does 60 damage plus 20 more damage.')]),
62:('Luxio','Stage 1',80,'Lightning','Shinx','Fighting','+20','Metal','-20',1,'Uncommon',[
('Spark','LC','30','Does 10 damage to 1 of your opponent\'s Benched Pokémon. (Don\'t apply Weakness and Resistance for Benched Pokémon.)'),
('Thunderous Claw','LCC','70','Flip a coin. If tails, discard all Lightning Energy attached to Luxio.')]),
63:('Marowak','Stage 1',90,'Fighting','Cubone','Water','+20','Lightning','-20',2,'Uncommon',[
('Heavy Bone','C','40','Flip a coin. If tails, Marowak can\'t use Heavy Bone during your next turn.'),
('Bone Rush','FF','50×','Flip a coin until you get tails. This attack does 50 damage times the number of heads.')]),
65:('Metang','Stage 1',80,'Metal','Beldum','Fire','+20','Psychic','-20',2,'Uncommon',[
('Psyshock','MC','20','Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'),
('Bullet Punch','MCC','40+','Flip 2 coins. This attack does 40 damage plus 20 more damage for each heads.')]),
72:('Swalot','Stage 1',90,'Psychic','Gulpin','Psychic','+20','','',2,'Uncommon',[
('Swallow Up','PC','30','Before doing damage, count the remaining HP of the Defending Pokémon and Swalot. If the Defending Pokémon has fewer remaining HP than Swalot\'s, this attack does 80 damage instead.'),
('Gunk Shot','PPC','60','The Defending Pokémon is now Poisoned.')]),
74:('Tauros','Basic',80,'Colorless','','Fighting','+20','','',2,'Uncommon',[
('Herd Charge','CC','20×','Flip a coin for each Tauros you have in play. This attack does 20 damage times the number of heads.'),
('Thrash','CCC','40+','Flip a coin. If heads, this attack does 40 damage plus 20 more damage. If tails, Tauros does 10 damage to itself.')]),
86:('Buneary','Basic',50,'Colorless','','Fighting','+10','','',1,'Common',[
('Rest','C','','Remove all Special Conditions and 4 damage counters from Buneary. Buneary is now Asleep.'),
('Double Kick','CC','20×','Flip 2 coins. This attack does 20 damage times the number of heads.')]),
88:('Chinchou','Basic',50,'Lightning','','Fighting','+10','','',1,'Common',[
('Razor Fin','C','10',''),
('Aqua Spark','LC','20+','If Chinchou has any Water Energy attached to it, this attack does 20 damage plus 10 more damage.')]),
94:('Gligar','Basic',60,'Fighting','','Water','+10','Fighting','-20',1,'Common',[
('Light Poison','','10','Flip a coin. If tails, this attack does nothing. If heads, the Defending Pokémon is now Poisoned.'),
('Jump On','F','10+','Flip a coin. If heads, this attack does 10 damage plus 10 more damage.')]),
97:('Gloom','Stage 1',80,'Psychic','Oddish','Psychic','+20','','',2,'Common',[
('Space Out','','','Remove 2 damage counters from Gloom. Gloom is now Asleep.'),
('Stinky Nectar','PC','30','Flip a coin. If heads, the Defending Pokémon is now Confused and Poisoned.')]),
98:('Gulpin','Basic',60,'Psychic','','Psychic','+10','','',2,'Common',[
('Amnesia','C','','Choose 1 of the Defending Pokémon\'s attacks. That Pokémon can\'t use that attack during your opponent\'s next turn.'),
('Gastro Acid','P','','Flip a coin. If heads, the Defending Pokémon is now Paralyzed.')]),
106:('Meowth','Basic',50,'Colorless','','Fighting','+10','','',1,'Common',[
('Pay Day','C','10','Flip a coin. If heads, draw a card.'),
('Fury Swipes','CC','10×','Flip 3 coins. This attack does 10 damage times the number of heads.')]),
109:('Nosepass','Basic',70,'Fighting','','Water','+20','','',1,'Common',[
('Sharpen','C','10',''),
('Nose Poke','FC','20+','If Probopass is on your Bench, this attack does 20 damage plus 20 more damage.')]),
113:('Pineco','Basic',50,'Grass','','Fire','+10','','',1,'Common',[
('Tackle','C','10',''),
('Selfdestruct','GC','40','This attack does 10 damage to each Benched Pokémon (both yours and your opponent\'s). (Don\'t apply Weakness and Resistance for Benched Pokémon.) Pineco does 50 damage to itself.')]),
114:('Poliwag','Basic',40,'Water','','Lightning','+10','','',1,'Common',[
('Tackle','C','10',''),
('Twiddle','W','','Flip a coin. If heads, the Defending Pokémon is now Confused. If tails, the Defending Pokémon is now Asleep.')]),
119:('Skitty','Basic',50,'Colorless','','Fighting','+10','','',1,'Common',[
('Growl','C','','During your opponent\'s next turn, any damage done by attacks from the Defending Pokémon is reduced by 20 (before applying Weakness and Resistance).'),
('Scratch','C','10','')]),
124:('Taillow','Basic',50,'Colorless','','Lightning','+10','Fighting','-20',1,'Common',[
('Focus Energy','C','','During your next turn, Taillow\'s Peck attack\'s base damage is 30.'),
('Peck','C','10','')]),
}

PRINTS.update({
35:('Poliwrath','Stage 2',130,'Water','Poliwhirl','Lightning','+30','','',2,'Rare',[
('Focus Punch','F','60',"If Poliwrath was damaged by an attack during your opponent's last turn, this attack does nothing."),
('Submission','FCC','90','Poliwrath does 20 damage to itself.')]),
53:('Drifblim','Stage 1',90,'Psychic','Drifloon','Darkness','+20','Colorless','-20',0,'Uncommon',[
('Expand','P','30',"During your opponent's next turn, any damage done to Drifblim by attacks is reduced by 10 (after applying Weakness and Resistance)."),
('Whirlwind','CCC','60','Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.')]),
89:('Corphish','Basic',50,'Water','','Lightning','+10','','',1,'Common',[
('Knock Off','C','',"Flip a coin. If heads, choose 1 card from your opponent's hand without looking and discard it."),
('Irongrip','CC','20','')]),
96:('Gloom','Stage 1',70,'Grass','Oddish','Fire','+20','','',1,'Common',[
('Sleep Powder','G','20','The Defending Pokémon is now Asleep.'),
('Frustration','GC','',"Choose 1 of your opponent's Pokémon that doesn't have any damage counters on it. This attack does 30 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)")]),
103:('Houndour','Basic',50,'Darkness','','Water','+10','Psychic','-20',1,'Common',[
('Roar','C','','Your opponent switches the Defending Pokémon with 1 of his or her Benched Pokémon.'),
('Bite','D','10','')]),
123:('Swinub','Basic',60,'Water','','Metal','+10','Lightning','-20',2,'Common',[
('Sniff Out','C','','Flip a coin. If heads, put any 1 card from your discard pile into your hand.'),
('Lunge Out','FC','30','')]),
125:('Tentacool','Basic',50,'Water','','Lightning','+10','','',1,'Common',[
('Crystal Barrier','C','','Flip a coin. If heads, prevent all effects of an attack, including damage, done to Tentacool during your opponent\'s next turn.'),
('Mysterious Beam','W','',"Flip a coin. If heads, discard an Energy card attached to the Defending Pokémon.")]),
128:('Yanma','Basic',70,'Grass','','Lightning','+20','Fighting','-20',1,'Common',[
('U-turn','C','10','Switch Yanma with 1 of your Benched Pokémon.'),
('Agility','GG','20',"Flip a coin. If heads, prevent all effects of an attack, including damage, done to Yanma during your opponent's next turn.")]),
})
