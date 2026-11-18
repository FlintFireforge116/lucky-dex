#!/usr/bin/env python3
"""Source-fixture checks for Arceus strategy metadata; no external downloads."""
import importlib.util,sys
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'scripts/build-arceus.py'
sys.path.insert(0,str(p.parent))
spec=importlib.util.spec_from_file_location('audited_roles',p)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def card(text, attack_effect, ability_text='', ability_effect=None):
 c={'attacks':[{'name':'Test','text':text}], 'abilities':[{'name':'Ability','text':ability_text}] if ability_text else []}
 a=[{'effect':attack_effect}];b=[{'effect':ability_effect}] if ability_effect else []
 return m.deck_roles(c,a,b)
noop={'type':'noop'}
assert 'ramp' not in card('Discard 1 Energy attached to Charizard.',noop)
assert 'ramp' not in card('If Pikachu has any Lightning Energy attached to it, deal 10 more damage.',noop)
assert 'ramp' not in card('When you attach Grass Energy from your hand to Sceptile, remove 2 damage counters.',noop)
assert 'heal' not in card('Remove the highest Stage Evolution card from that Pokémon.',noop)
assert 'heal' not in card('Remove all Energy cards attached to Arceus and put them in the Lost Zone.',noop)
assert 'ramp' in card('Attach a basic Energy card from your hand to 1 of your Pokémon.',{'type':'neoRule','rule':'pl4:31:leafSupply'})
assert 'ramp' in card('Move all Grass Energy from your discard pile to your Pokémon.',{'type':'neoRule','rule':'pl4:99:bigGrowth'})
assert 'status' in card('The Defending Pokémon is now Confused.',{'type':'status','target':'opponentActive','status':'confusion'})
assert 'heal' in card('Remove 2 damage counters.',{'type':'heal','amount':20,'target':'self'})
assert 'search' in card('Search your deck for any 1 card.',{'type':'searchChosen','source':'deck','amount':1})
print('Arceus metadata roles: 10 focussed false-positive/positive checks PASS')
