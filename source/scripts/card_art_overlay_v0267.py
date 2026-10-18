#!/usr/bin/env python3
"""Identity-safe artwork overlay for LuckyDex's physical-card index.

The primary LuckyDex metadata snapshot contains exact physical card identities,
but some of its historic ``img`` URLs come from card-site hotlinks.  This module
cross-references the maintained PokémonTCG JSON catalogue and substitutes its
card artwork only when set identity + collector number + card name all agree.

No image is ever guessed from a collector number alone.
"""
from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping, Sequence, Tuple


def _normalize_text(value: object) -> str:
    text = unicodedata.normalize('NFKD', str(value or ''))
    text = ''.join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().replace('pokémon', 'pokemon')
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def _normalize_set_id(value: object) -> str:
    return re.sub(r'[^a-z0-9]+', '', str(value or '').lower())


def _normalize_number(value: object) -> str:
    raw = str(value or '').strip().upper()
    if not raw:
        return ''
    if re.fullmatch(r'0*\d+', raw):
        return str(int(raw))
    return re.sub(r'[^A-Z0-9]+', '', raw)


def _best_image(card: Mapping[str, object]) -> str:
    images = card.get('images') if isinstance(card, Mapping) else None
    if not isinstance(images, Mapping):
        return ''
    for key in ('large', 'small'):
        url = str(images.get(key) or '').strip()
        if url.startswith('https://'):
            return url
    return ''


class PokemonTcgArtworkResolver:
    """Resolve stable PokémonTCG artwork using exact cross-catalogue identity."""

    def __init__(
        self,
        by_set: Mapping[str, Mapping[Tuple[str, str], Sequence[str]]],
        set_ids_by_name: Mapping[str, Sequence[str]],
    ) -> None:
        self._by_set = {
            str(set_id): {key: tuple(urls) for key, urls in rows.items()}
            for set_id, rows in by_set.items()
        }
        self._set_ids_by_name = {
            str(name): tuple(ids) for name, ids in set_ids_by_name.items()
        }

    @classmethod
    def from_paths(cls, cards_root: Path, sets_path: Path) -> 'PokemonTcgArtworkResolver':
        cards_root = Path(cards_root)
        sets_path = Path(sets_path)
        sets_payload = json.loads(sets_path.read_text(encoding='utf-8'))
        if not isinstance(sets_payload, list):
            raise ValueError(f'PokémonTCG set metadata must be a list: {sets_path}')

        set_ids_by_name: MutableMapping[str, List[str]] = defaultdict(list)
        known_ids = set()
        for row in sets_payload:
            if not isinstance(row, Mapping):
                continue
            set_id = _normalize_set_id(row.get('id'))
            if not set_id:
                continue
            known_ids.add(set_id)
            name = _normalize_text(row.get('name'))
            if name and set_id not in set_ids_by_name[name]:
                set_ids_by_name[name].append(set_id)

        by_set: Dict[str, Dict[Tuple[str, str], List[str]]] = {}
        for path in sorted(cards_root.glob('*.json')):
            set_id = _normalize_set_id(path.stem)
            try:
                payload = json.loads(path.read_text(encoding='utf-8'))
            except Exception as exc:
                raise ValueError(f'Could not parse PokémonTCG card file {path}: {exc}') from exc
            if not isinstance(payload, list):
                continue
            rows: MutableMapping[Tuple[str, str], List[str]] = defaultdict(list)
            for card in payload:
                if not isinstance(card, Mapping):
                    continue
                number = _normalize_number(card.get('number'))
                name = _normalize_text(card.get('name'))
                art = _best_image(card)
                if not number or not name or not art:
                    continue
                key = (number, name)
                if art not in rows[key]:
                    rows[key].append(art)
            if rows:
                by_set[set_id] = dict(rows)
                known_ids.add(set_id)

        return cls(by_set, set_ids_by_name)

    def resolve(self, set_code: object, set_name: object, number: object, name: object) -> str:
        number_key = _normalize_number(number)
        name_key = _normalize_text(name)
        if not number_key or not name_key:
            return ''

        candidate_sets: List[str] = []
        direct = _normalize_set_id(set_code)
        if direct and direct in self._by_set:
            candidate_sets.append(direct)
        for set_id in self._set_ids_by_name.get(_normalize_text(set_name), ()):
            if set_id in self._by_set and set_id not in candidate_sets:
                candidate_sets.append(set_id)

        matches: List[str] = []
        for set_id in candidate_sets:
            for art in self._by_set.get(set_id, {}).get((number_key, name_key), ()):
                if art not in matches:
                    matches.append(art)
        return matches[0] if len(matches) == 1 else ''


__all__ = ['PokemonTcgArtworkResolver']
