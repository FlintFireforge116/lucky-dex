"""Printed DP6 Fossils using the preexisting Trainer-as-Pokemon engine."""
FOSSILS={
 138:{'name':'Claw Fossil','hp':40,'rarity':'Common','trainerType':'Item','abilityName':'Jagged Stone',
  'rules':["Play Claw Fossil as if it were a Colorless Basic Pokémon. (Claw Fossil counts as a Trainer card as well, but if Claw Fossil is Knocked Out, this counts as a Knocked Out Pokémon.) Claw Fossil can't be affected by any Special Conditions and can't retreat. At any time during your turn before your attack, you may discard Claw Fossil from play. (This doesn't count as a Knocked Out Pokémon.)"],
  'abilityText':'If Claw Fossil is your Active Pokémon and is damaged by an opponent\'s attack (even if Claw Fossil is Knocked Out), put 1 damage counter on the Attacking Pokémon.',
  'ability':{'name':'Jagged Stone','type':'triggered','event':'damagedByAttack','activeOnly':True,'printedPowerType':'body','disabledByStatus':False,'effect':{'type':'neoRule','rule':'dp6:138:jaggedStone'}}},
 139:{'name':'Root Fossil','hp':40,'rarity':'Common','trainerType':'Item','abilityName':'Spongy Stone',
  'rules':["Play Root Fossil as if it were a Colorless Basic Pokémon. (Root Fossil counts as a Trainer card as well, but if Root Fossil is Knocked Out, this counts as a Knocked Out Pokémon.) Root Fossil can't be affected by any Special Conditions and can't retreat. At any time during your turn before your attack, you may discard Root Fossil from play. (This doesn't count as a Knocked Out Pokémon.)"],
  'abilityText':'At any time between turns, remove 1 damage counter from Root Fossil.',
  'ability':{'name':'Spongy Stone','type':'triggered','event':'checkup','printedPowerType':'body','disabledByStatus':False,'effect':{'type':'heal','target':'self','amount':10}}},
}
