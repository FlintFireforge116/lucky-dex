"""Final dp6 printed facts, independently checked against the archived set export.
These are immutable factual snapshots; the battle rules are in dp6_final_verified.py.
"""
PRINTS={
7:("Kingdra","Stage 2",130,"Water","Seadra","Lightning","+30","","",1,"Rare Holo",[
("Aqua Stream","","10×","Search your discard pile for as many Water Energy cards as you like, show them to your opponent, and this attack does 10 damage for each Water Energy card you chose. Put those cards on top of your deck. Shuffle your deck afterward."),
("Dragon Pump","W","40+","You may discard 2 cards from your hand. If you do, this attack does 40 damage plus 20 more damage and does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)")]),
16:("Spiritomb","Basic",70,"Psychic","","","","Colorless","-20",2,"Rare Holo",[
("Transfer Pain","P","","Move 1 damage counter from 1 of your Pokémon to 1 of your opponent's Pokémon.")]),
19:("Azelf","Basic",70,"Psychic","","Psychic","+20","","",1,"Rare",[
("Lock Up","P","20","The Defending Pokémon can't retreat during your opponent's next turn.")]),
21:("Cradily","Stage 2",120,"Grass","Lileep","Fire","+30","","",3,"Rare",[
("Drain Down","G","30","Before doing damage, you may switch 1 of the Defending Pokémon with 1 of your opponent's Benched Pokémon. If you do, this attack does 30 damage to the new Defending Pokémon. If the Defending Pokémon would be Knocked Out by this attack, you may remove all damage counters from Cradily."),
("Acid","GCC","50","The Defending Pokémon can't retreat during your opponent's next turn.")]),
27:("Ditto","Basic",60,"Colorless","","Fighting","+20","","",1,"Rare",[]),
40:("Shedinja","Stage 1",60,"Grass","Nincada","","","","",0,"Rare",[
("Curse and Deceive","C","","Put 3 damage counters on the Defending Pokémon. If Shedinja has any damage counters on it, the Defending Pokémon is now Confused.")]),
42:("Unown [!]","Basic",50,"Psychic","","Psychic","+10","","",1,"Rare",[
("Hidden Power","P","10+","Flip a coin. If heads, this attack does 10 damage plus 10 more damage. If tails, Unown ! does 10 damage to itself, and this attack's damage isn't affected by Weakness or Resistance.")]),
44:("Victreebel","Stage 2",120,"Grass","Weepinbell","Fire","+30","","",3,"Rare",[
("Burning Scent","","","The Defending Pokémon is now Burned and Poisoned. Before applying these effects, you may switch 1 of the Defending Pokémon with 1 of your opponent's Benched Pokémon. The new Defending Pokémon is now Burned and Poisoned."),
("Energy Dissolve","GGC","60","Discard an Energy attached to the Defending Pokémon at the end of your opponent's next turn.")]),
45:("Vileplume","Stage 2",120,"Grass","Gloom","Psychic","+30","","",2,"Rare",[
("Disturbing Pollen","PCC","60","Flip a coin. If heads, your opponent can't play any Trainer, Supporter, or Stadium cards from his or her hand during your opponent's next turn.")]),
54:("Exeggutor","Stage 1",80,"Psychic","Exeggcute","Psychic","+20","","",1,"Uncommon",[
("Psychic Strategy","","","Each player counts the number of cards in his or her opponent's hand. Each player shuffles his or her hand into his or her deck. Then, each player draws a number of cards up to the number of cards his or her opponent had. (You draw your cards first.)"),
("Super Eggsplosion","P","50×","Discard as many Energy cards as you like attached to your Pokémon. For each Energy card you discarded, flip a coin. This attack does 50 damage times the number of heads.")]),
67:("Ninjask","Stage 1",80,"Grass","Nincada","Fire","+20","Fighting","-20",0,"Uncommon",[
("Chip Off","G","30","If your opponent has 6 or more cards in his or her hand, discard a number of cards without looking until your opponent has 5 cards left in his or her hand.")]),
75:("Tentacruel","Stage 1",90,"Water","Tentacool","Lightning","+20","","",1,"Uncommon",[
("Tentacle Strike","","","Search your opponent's discard pile for up to 2 Energy cards and attach them to any of your opponent's Pokémon in any way you like. For each Energy card attached in this way, this attack does 20 damage to that Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)"),
("Dangerous Poison","WCC","60","If Tentacruel has less Energy attached to it than the Defending Pokémon, the Defending Pokémon is now Paralyzed and Poisoned.")]),
77:("Unown [R]","Basic",60,"Psychic","","Psychic","+10","","",1,"Uncommon",[
("Hidden Power","","","Move any number of basic Energy cards attached to your Pokémon to your other Pokémon in any way you like.")]),
82:("Unown [?]","Basic",70,"Psychic","","Psychic","+10","","",1,"Uncommon",[
("Hidden Power","","","Discard up to 2 cards from your hand. For each card you discarded, draw a card.")]),
}
# (name, trainer subtype, authoritative printed rule text)
TRAINERS={
129:("Bubble Coat","Pokémon Tool",[
"Attach Bubble Coat to 1 of your Pokémon that doesn't already have a Pokémon Tool attached to it. If that Pokémon is Knocked Out, discard this card.",
"As long as Bubble Coat is attached to a Pokémon, that Pokémon has no Weakness. If that Pokémon is damaged by an opponent's attack, discard this card at the end of the turn."]),
130:("Buck's Training","Supporter",[
"You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card.",
"Draw 2 cards. As long as Buck's Training is next to your Active Pokémon, each of your Active Pokémon's attacks does 10 more damage to the Active Pokémon (before applying Weakness and Resistance)."]),
131:("Cynthia's Feelings","Supporter",[
"You can play only one Supporter card each turn. When you play this card, put it next to your Active Pokémon. When your turn ends, discard this card.",
"Shuffle your hand into your deck. Then, draw 4 cards. If any of your Pokémon were Knocked Out during your opponent's last turn, draw 4 more cards."]),
132:("Energy Pickup","Item",["Flip a coin. If heads, search your discard pile for a basic Energy card and attach it to 1 of your Pokémon."]),
133:("Poké Radar","Item",["Look at the top 5 cards of your deck, choose as many Pokémon as you like, show them to your opponent, and put them into your hand. Put the other cards back on top of your deck. Shuffle your deck afterward."]),
134:("Snowpoint Temple","Stadium",["This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card with the same name is in play, you can't play this card.","Each Pokémon that isn't an Evolved Pokémon in play (both yours and your opponent's) gets +20 HP."]),
135:("Stark Mountain","Stadium",["This card stays in play when you play it. Discard this card if another Stadium card comes into play. If another card with the same name is in play, you can't play this card.","Once during each player's turn, that player may choose a Fire or Fighting Energy attached to 1 of his or her Pokémon and move that Energy to 1 of his or her Pokémon."]),
136:("Technical Machine TS-1","Technical Machine",["Attach this card to 1 of your Pokémon in play. That Pokémon may use this card's attack instead of its own."]),
137:("Technical Machine TS-2","Technical Machine",["Attach this card to 1 of your Pokémon in play. That Pokémon may use this card's attack instead of its own."]),
}
TRAINER_ATTACKS={
136:[('Evoluter','','','Search your deck for a card that evolves from 1 of your Pokémon and put it onto that Pokémon. (This counts as evolving that Pokémon.) Shuffle your deck afterward.')],
137:[('Devoluter','','','Choose 1 of your opponent\'s Evolved Pokémon (excluding Pokémon LV.X). Remove the highest Stage Evolution card from that Pokémon and put that card back into your opponent\'s hand.')],
}
ABILITY_TEXT={
16:'Once during your turn, when you put Spiritomb from your hand onto your Bench, you may put 1 damage counter on all Pokémon that already have any damage counters on them (both yours and your opponent\'s). You can\'t use more than 1 Curse Breath Poké-Power each turn.',
19:'Once during your turn, when you put Azelf from your hand onto your Bench, you may look at all of your face-down Prize cards. If you do, you may choose 1 Pokémon you find there, show it to your opponent, and put it into your hand. Then, choose 1 card in your hand and put it as a Prize card face down.',
27:'As long as Ditto is your Active Pokémon, its maximum HP is the same as your opponent\'s Active Pokémon. Ditto can use the attacks of that Pokémon as its own. (You still need the necessary Energy to use each attack.) If that Pokémon is no longer your opponent\'s Active Pokémon, choose 1 of your opponent\'s Active Pokémon for Ditto to copy.',
40:'Once during your opponent\'s turn, if Shedinja would be Knocked Out by damage from an attack, you may put 4 damage counters on the Attacking Pokémon and each of the opponent\'s Pokémon that has the same name as the Attacking Pokémon.',
42:'Once during your turn, when you put Unown ! from your hand onto your Bench, you may flip a coin. If heads, put 2 damage counters on 1 of your opponent\'s Pokémon. If tails, put 2 damage counters on 1 of your Pokémon.',
45:'Once during your turn (before your attack), when you attach a Grass or Psychic Energy card from your hand to Vileplume (excluding effects of attacks or Poké-Powers), you may use this power. If you attach a Grass Energy card, the Defending Pokémon is now Asleep. If you attach a Psychic Energy card, the Defending Pokémon is now Poisoned. This power can\'t be used if Vileplume is affected by a Special Condition.',
67:'Once during your turn, when you play Ninjask from your hand to evolve 1 of your Pokémon and if your Bench isn\'t full, you may put Shedinja onto your Bench as a Basic Pokémon from your hand or your discard pile.',
77:'Once during your turn, if Unown R is on your Bench, you may discard Unown R and all cards attached to it. (This doesn\'t count as a Knocked Out Pokémon.) Then, draw a card.',
82:'Once during your turn (before your attack), if Unown ? is on your Bench, you may choose a Pokémon in your hand and put it face down. Your opponent guesses a type of that Pokémon. Reveal that card. If your opponent guessed wrong, draw a card. Then, put that card back into your hand.',
}
