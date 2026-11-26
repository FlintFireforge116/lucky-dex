"""Exact stage-one projection of pinned Brilliant Stars main-set data."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PIN='6c33800813e0375da544c26d2e97992a768c015f'
S=dict(zip('GRWLPFDMYNC','Grass Fire Water Lightning Psychic Fighting Darkness Metal Fairy Dragon Colorless'.split()))
SUB=['Basic','Stage 1','Stage 2','V','VMAX','VSTAR','Fusion Strike','Single Strike','Rapid Strike']
RAR=['Common','Uncommon','Rare','Rare Holo','Rare Holo V','Rare Holo VSTAR','Rare Holo VMAX','Rare Ultra','Rare Rainbow','Rare Secret']
T={0:'',1:'Heal 30 damage from this Pokémon.',7:'This attack does 40 more damage for each Prize card your opponent has taken.',8:"This attack also does 30 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",9:"If your opponent's Active Pokémon is a Pokémon V, this attack does 120 more damage.",10:"Before doing damage, discard all Pokémon Tools from your opponent's Active Pokémon.",11:'If this Pokémon has any damage counters on it, this attack does 100 more damage.',12:"Discard 2 Energy from this Pokémon. (You can't use more than 1 VSTAR Power in a game.)",16:'Flip a coin. If heads, this attack does 30 more damage.',17:"During your opponent's next turn, this Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).",18:'Discard an Energy from this Pokémon.',22:"This attack does 30 more damage for each Energy attached to your opponent's Active Pokémon.",24:'This Pokémon also does 30 damage to itself.',26:'Flip 2 coins. This attack does 10 damage for each heads.',28:'Discard 2 Energy from this Pokémon.',29:"Flip a coin. If heads, your opponent's Active Pokémon is now Paralyzed.",32:'Put up to 2 Item cards from your discard pile into your hand.',34:"During your opponent's next turn, the Defending Pokémon can't attack.",44:'Heal 20 damage from this Pokémon.',45:'This attack does 10 more damage for each damage counter on this Pokémon.',46:'Flip 3 coins. This attack does 20 damage for each heads.',48:"Flip a coin. If heads, your opponent's Active Pokémon is now Confused.",49:"Your opponent's Active Pokémon is now Confused.",50:'Search your deck for up to 2 Special Energy cards, reveal them, and put them into your hand. Then, shuffle your deck.',59:'Search your deck for a Supporter card, reveal it, and put it into your hand. Then, shuffle your deck.',61:'Draw a card.',62:'Flip a coin. If heads, this attack does 10 more damage.',66:"Flip a coin. If heads, discard an Energy from your opponent's Active Pokémon.",67:'This attack does 10 more damage for each card in your hand.',68:"Your opponent's Active Pokémon is now Poisoned.",74:'Flip a coin. If tails, this attack does nothing.',75:'Search your deck for a Basic Pokémon and put it onto your Bench. Then, shuffle your deck.',79:"This attack also does 30 damage to 2 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)",80:"If your opponent's Active Pokémon already has any damage counters on it, this attack does 150 more damage.",81:"Discard the top card of your opponent's deck.",88:'Discard the top 2 cards of your deck.',93:"This attack does 10 more damage for each damage counter on your opponent's Active Pokémon.",94:'Draw 2 cards.',98:'Search your deck for up to 2 Basic Pokémon and put them onto your Bench. Then, shuffle your deck.',99:'Flip 3 coins. This attack does 50 damage for each heads.'}
AB={19:['Industrious Incisors','Ability','Once during your turn, you may draw cards until you have 5 cards in your hand.']}
RULES={0:'V rule: When your Pokémon V is Knocked Out, your opponent takes 2 Prize cards.',1:'VSTAR rule: When your Pokémon VSTAR is Knocked Out, your opponent takes 2 Prize cards.',2:'VMAX rule: When your Pokémon VMAX is Knocked Out, your opponent takes 3 Prize cards.',4:'You may play only 1 Supporter card during your turn.',5:'Draw 3 cards.',7:'You may play any number of Item cards during your turn.',8:"Attach a Pokémon Tool to 1 of your Pokémon that doesn't already have a Pokémon Tool attached.",9:"Switch 1 of your opponent's Benched Pokémon with their Active Pokémon.",12:"The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active Pokémon V (before applying Weakness and Resistance).",13:"The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active Psychic Pokémon (before applying Weakness and Resistance).",16:'Heal 20 damage from each of your Pokémon.',18:"The attacks of the Pokémon this card is attached to do 30 more damage to your opponent's Active Dragon Pokémon (before applying Weakness and Resistance).",23:'Discard your hand and draw 7 cards.',26:'You can use this card only if you discard 2 other cards from your hand. Search your deck for a Pokémon, reveal it, and put it into your hand. Then, shuffle your deck.',27:"As long as this card is attached to a Pokémon, it provides ColorlessColorless Energy. The attacks of the Pokémon this card is attached to do 20 less damage to your opponent's Pokémon (before applying Weakness and Resistance)."}
def rows():
 out=[]
 for line in (ROOT/'data/classic/swsh9-stage1.txt').read_text().splitlines():
  n,name,k,sub,hp,types,ev,w,r,ret,rar,ats,abs_,rules=line.split('|')
  attacks=[]
  for at in filter(None,ats.split('^')):
   name_,cost,dmg,txt=at.split('~');attacks.append([name_,list(cost),dmg,T[int(txt)]])
  out.append([n,name,{'P':'Pokémon','T':'Trainer','E':'Energy'}[k],[SUB[int(x)] for x in sub] if k=='P' else sub.split('/'),hp or None,[S[x] for x in types],ev or None,attacks,[AB[int(x)] for x in filter(None,abs_.split(','))],S.get(w),S.get(r),int(ret),RAR[int(rar)],[RULES[int(x)] for x in filter(None,rules.split(','))],None,None])
 b=''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in out).encode();h=2166136261
 for v in b:h=((h^v)*16777619)&0xffffffff
 assert h==2719814753,(h,len(out))
 assert len(out)==82
 b=(ROOT/'data/classic/swsh9-stage1-support.jsonl').read_bytes();h=2166136261
 for v in b:h=((h^v)*16777619)&0xffffffff
 assert h==896869425,h
 out.extend(json.loads(line) for line in b.decode().splitlines())
 assert len({r[0] for r in out})==85
 return sorted(out,key=lambda r:int(r[0]))

_stage1_rows=rows
def rows():
 out=_stage1_rows();b=(ROOT/'data/classic/swsh9-stage2.jsonl').read_bytes();h=2166136261
 for v in b:h=((h^v)*16777619)&0xffffffff
 assert h==4077627955,h
 out.extend(json.loads(line) for line in b.decode().splitlines())
 b=(ROOT/'data/classic/swsh9-stage2-support.jsonl').read_bytes();h=2166136261
 for v in b:h=((h^v)*16777619)&0xffffffff
 assert h==1051944304,h
 out.extend(json.loads(line) for line in b.decode().splitlines())
 assert len({r[0] for r in out})==121
 return sorted(out,key=lambda r:int(r[0]))
