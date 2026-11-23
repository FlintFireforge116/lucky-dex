"""Ultra Prism Stage 8: text-locked, fully exercised actions and Abilities."""
import re
from copy import deepcopy

def N(s): return re.sub(r'\s+', ' ', str(s or '')).strip().casefold()
def E(t,**kw):return {'type':t,**kw}
ATTACKS={
 'Total Command':('This attack does 20 damage for each Benched Pokémon (both yours and your opponent\'s).',E('benchCountDamage',side='both',amount=20,mode='replace')),
 'Whirlpool':('Discard an Energy from your opponent\'s Active Pokémon.',E('discardEnergyCard',target='opponentActive',amount=1)),
 'Gold Rush':('Discard any number of Metal Energy cards from your hand. This attack does 30 damage for each card you discarded in this way.',E('chooseDiscardForBonus',zone='hand',max=8,amount=30,filter={'kind':'energy','basicEnergy':True,'subtype':'Metal'})),
 'Royal Blades':('If you played Cynthia from your hand during this turn, this attack does 100 more damage.',E('sm5Rule',rule='royalBlades')),
 'Outrage':('This attack does 10 more damage for each damage counter on this Pokémon.',E('damageFromDamage',source='self',amount=1)),
 'Eleventh Hour Tackle':('If there are 3 or fewer cards in your deck, this attack does 130 more damage.',E('sm5Rule',rule='eleventhHour')),
 'Lighting-GX':('Your opponent reveals their hand. Add a card you find there to their Prize cards face down. (You can\'t use more than 1 GX attack in a game.)',E('sm5Rule',rule='lightingGX')),
 'Blaster-GX':('Turn all of your Prize cards face up. (Those Prize cards remain face up for the rest of the game.) (You can\'t use more than 1 GX attack in a game.)',E('sm5Rule',rule='blasterGX')),
 'Grand Bloom-GX':('For each of your Benched Basic Pokémon, search your deck for a card that evolves from that Pokémon and put it onto that Pokémon to evolve it. Then, shuffle your deck. (You can\'t use more than 1 GX attack in a game.)',E('sm5Rule',rule='grandBloom')),
}
ABILITIES={
 'Weather Guard':('Your Grass Pokémon have no Weakness.',{'type':'passive','effect':E('weaknessGuard',duration='whileInPlay',scope='team',filter={'subtype':'Grass'})}),
 'Incandescent Body':('If this Pokémon is your Active Pokémon and is damaged by an opponent\'s attack (even if this Pokémon is Knocked Out), the Attacking Pokémon is now Burned.',{'type':'triggered','event':'damagedByAttack','activeOnly':True,'opponentAttackOnly':True,'effect':E('status',status='burn',target='opponentActive')}),
 'Evolutionary Advantage':('If you go second, this Pokémon can evolve during your first turn.',{'type':'passive','effect':E('evolutionTimingOverride',firstTurn=True)}),
 'Change Clothes':('Once during your turn (before your attack), you may put a Pokémon Tool card attached to 1 of your Pokémon into your hand.',{'type':'activated','oncePerTurn':True,'effect':E('sm5Rule',rule='changeClothes')}),
}
TRAINERS={
 'Escape Board':('Pokémon Tool',E('modifier',stat='retreatCost',amount=-1,scope='self',duration='whileInPlay')),
 'Electric Memory':('Pokémon Tool',E('sm5Rule',rule='memoryTool')),
 'Fire Memory':('Pokémon Tool',E('sm5Rule',rule='memoryTool')),
}
TRAINER_RULES={
 'Escape Board':('The Retreat Cost of the Pokémon this card is attached to is Colorless less, and it can retreat even if it\'s Asleep or Paralyzed.',),
 'Electric Memory':('The Silvally-GX this card is attached to is a Lightning Pokémon.',),
 'Fire Memory':('The Silvally-GX this card is attached to is a Fire Pokémon.',),
}
def attack(row,a):
 e=ATTACKS.get(a[0]);return deepcopy(e[1]) if e and N(e[0])==N(a[3]) else None
def ability(row,a):
 e=ABILITIES.get(a[0]);return deepcopy(e[1]) if e and N(e[0])==N(a[2]) else None
def trainer(row):
 e=TRAINERS.get(row[1]);required=TRAINER_RULES.get(row[1]);printed=N(' '.join(row[13] or []))
 return deepcopy(e) if row[2]=='Trainer' and e and required and all(N(r) in printed for r in required) else None
