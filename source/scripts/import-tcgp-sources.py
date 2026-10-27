#!/usr/bin/env python3
"""Verify or reproduce pinned MIT Pocket source inputs; never execute upstream code.

Default: offline hash verification. --reproduce reads local revision archives and
compares derived English records byte for byte. --refresh explicitly downloads
the pinned sources, checks licences first, and replaces inputs only after every
expected payload hash matches. Updating revisions requires a reviewed provenance
manifest/hash update; this command never advances branches or edits the cutoff,
identity evidence, corrections, generated runtime data, or source provenance.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
INPUTS = ROOT / 'data/tcgp/import'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def js_json(value):
    # These upstream literals contain integer numbers; this reproduces the
    # original JSON.stringify(value, null, 2) output, including insertion order.
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


class LiteralParser:
    """Restricted JSON-like TS data grammar, with no calls or expressions.

    Accepts objects, arrays, quoted strings, numbers, booleans/null, and only
    the imported data placeholders Set/serie (converted to null). Rejects all
    other identifiers, spreads, methods, templates and executable expressions.
    Import declarations and export lines are never evaluated.
    """
    def __init__(self, source):
        match = re.search(r'const\s+(?:card|set):\s*(?:Card|Set)\s*=\s*', source)
        if not match:
            raise ValueError('Missing card/set literal declaration')
        self.s = source
        self.i = match.end()

    def skip(self):
        while self.i < len(self.s):
            if self.s[self.i].isspace():
                self.i += 1
            elif self.s.startswith('//', self.i):
                end = self.s.find('\n', self.i)
                self.i = len(self.s) if end < 0 else end + 1
            elif self.s.startswith('/*', self.i):
                end = self.s.find('*/', self.i + 2)
                if end < 0:
                    raise ValueError('Unclosed comment')
                self.i = end + 2
            else:
                break

    def expect(self, token):
        self.skip()
        if not self.s.startswith(token, self.i):
            raise ValueError('Expected %r at %s' % (token, self.i))
        self.i += len(token)

    def string(self):
        quote = self.s[self.i]
        self.i += 1
        result = []
        escapes = {'n': '\n', 'r': '\r', 't': '\t', 'b': '\b', 'f': '\f', 'v': '\v', '0': '\0'}
        while self.i < len(self.s):
            c = self.s[self.i]
            self.i += 1
            if c == quote:
                return ''.join(result)
            if c in '\r\n':
                raise ValueError('Unescaped newline in string')
            if c != '\\':
                result.append(c)
                continue
            if self.i == len(self.s):
                break
            c = self.s[self.i]
            self.i += 1
            if c in ('u', 'x'):
                count = 4 if c == 'u' else 2
                digits = self.s[self.i:self.i + count]
                if not re.fullmatch('[0-9a-fA-F]{%d}' % count, digits):
                    raise ValueError('Invalid hexadecimal string escape')
                result.append(chr(int(digits, 16)))
                self.i += count
            elif c == '\n':
                pass
            elif c == '\r':
                if self.s[self.i:self.i + 1] == '\n':
                    self.i += 1
            else:
                result.append(escapes.get(c, c))
        raise ValueError('Unclosed string')

    def identifier(self):
        match = re.match(r'[A-Za-z_$][A-Za-z0-9_$]*', self.s[self.i:])
        if not match:
            raise ValueError('Expected identifier at %s' % self.i)
        self.i += len(match[0])
        return match[0]

    def value(self):
        self.skip()
        c = self.s[self.i:self.i + 1]
        if c in ('"', "'"):
            return self.string()
        if c == '{':
            self.i += 1
            result = {}
            self.skip()
            while self.s[self.i:self.i + 1] != '}':
                self.skip()
                key = self.string() if self.s[self.i] in ('"', "'") else self.identifier()
                if key in ('__proto__', 'constructor', 'prototype') or key in result:
                    raise ValueError('Unsafe or duplicate object key: ' + key)
                self.expect(':')
                result[key] = self.value()
                self.skip()
                if self.s[self.i:self.i + 1] != ',':
                    break
                self.i += 1
                self.skip()
            self.expect('}')
            return result
        if c == '[':
            self.i += 1
            result = []
            self.skip()
            while self.s[self.i:self.i + 1] != ']':
                result.append(self.value())
                self.skip()
                if self.s[self.i:self.i + 1] != ',':
                    break
                self.i += 1
                self.skip()
            self.expect(']')
            return result
        number = re.match(r'-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?', self.s[self.i:])
        if number:
            self.i += len(number[0])
            return json.loads(number[0])
        name = self.identifier()
        allowed = {'null': None, 'true': True, 'false': False, 'Set': None, 'serie': None}
        if name not in allowed:
            raise ValueError('Nonliteral identifier rejected: ' + name)
        return allowed[name]

    def parse(self):
        value = self.value()
        tail = self.s[self.i:].strip()
        if not re.fullmatch(r';?\s*export\s+default\s+(?:card|set)\s*;?', tail):
            raise ValueError('Unexpected code after data literal')
        return value


def english(value):
    if isinstance(value, list):
        return [english(v) for v in value]
    if isinstance(value, dict):
        if 'en' in value:
            return value['en']
        return {k: english(v) for k, v in value.items()}
    return value


def extract(archive, deluxe_only=False):
    # Archive entries are read in memory; no upstream path is extracted to disk.
    marker = '/data/Pokémon TCG Pocket/'
    raw = {}
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        for name in z.namelist():
            if marker not in name or not name.endswith('.ts'):
                continue
            relative = name.split(marker, 1)[1]
            if deluxe_only and not relative.startswith('Deluxe Pack: ex'):
                continue
            raw[relative] = z.read(name).decode('utf-8-sig')
    parsed = {p: LiteralParser(s).parse() for p, s in raw.items()}
    sets = [{'path': p, **v} for p, v in parsed.items() if '/' not in p]
    cards = []
    for p, v in parsed.items():
        if '/' not in p:
            continue
        folder, number_file = p.split('/')
        number = number_file.removesuffix('.ts')
        set_id = parsed[folder + '.ts']['id']
        record = {'id': set_id + '-' + number, 'setId': set_id, 'localId': number}
        record.update({k: x for k, x in english(v).items() if k != 'set'})
        record['sourcePath'] = 'data/Pokémon TCG Pocket/' + p
        record['sourceSha256'] = sha(raw[p].encode('utf-8'))
        cards.append(record)
    return cards, english(sets)


def download(url):
    if not url.startswith(('https://raw.githubusercontent.com/', 'https://codeload.github.com/')):
        raise ValueError('Only pinned public GitHub source URLs are permitted')
    request = urllib.request.Request(url, headers={'User-Agent': 'LuckyDex-source-import/1'})
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def verify(manifest, payloads=None):
    checked = 0
    for source in manifest['sources']:
        for expected in source['files']:
            data = payloads[expected['path']] if payloads is not None else (INPUTS / expected['path']).read_bytes()
            if sha(data) != expected['sha256'] or len(data) != expected['bytes']:
                raise ValueError('Source hash/length mismatch: ' + expected['path'])
            checked += 1
    return checked


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--refresh', action='store_true', help='Fetch only manifest-pinned MIT inputs; require exact expected hashes before replacing.')
    modes.add_argument('--reproduce', action='store_true', help='Reproduce English JSON from local pinned archives and compare exact hashes, without writes/network.')
    parser.add_argument('--archive-main', type=Path)
    parser.add_argument('--archive-a4b', type=Path)
    args = parser.parse_args()
    manifest = json.loads((INPUTS / 'provenance.json').read_text(encoding='utf-8'))
    if not all(re.fullmatch('[0-9a-f]{40}', source['commit']) for source in manifest['sources']):
        raise ValueError('Every source revision must be a full immutable commit hash')
    if not args.refresh and not args.reproduce:
        checked = verify(manifest)
        for name in ('PocketDecks-LICENSE-MIT.txt', 'flibustier-LICENSE-MIT.txt', 'TCGdex-LICENSE-MIT.txt'):
            text = (INPUTS / name).read_text(encoding='utf-8')
            if 'MIT License' not in text or 'Permission is hereby granted' not in text:
                raise ValueError('Missing MIT notice: ' + name)
        print('PASS: %d pinned source payloads match; all three MIT notices present. Offline verification only.' % checked)
        return
    if args.refresh:
        # Check all three licence grants BEFORE retrieving card data.
        notices = {}
        for source in manifest['sources']:
            repo = source['repository'].split('https://github.com/', 1)[1].split('/tree/')[0]
            licence = 'LICENSE-MIT' if repo.startswith('PocketDecks/') else 'LICENSE'
            data = download('https://raw.githubusercontent.com/%s/%s/%s' % (repo, source['commit'], licence))
            text = data.decode('utf-8')
            if 'MIT License' not in text or 'Permission is hereby granted' not in text:
                raise ValueError('Pinned source no longer has expected MIT grant: ' + repo)
            if data != (INPUTS / source['noticeFile']).read_bytes():
                raise ValueError('Licence changed; review before importing: ' + repo)
            notices[source['noticeFile']] = data
        payloads = {}
        for source in manifest['sources'][:2]:
            repo = source['repository'].split('https://github.com/', 1)[1]
            for entry, upstream in zip(source['files'], source['upstreamPaths']):
                payloads[entry['path']] = download('https://raw.githubusercontent.com/%s/%s/%s' % (repo, source['commit'], upstream))
        main_revision = manifest['sources'][2]['commit']
        deluxe_revision = manifest['sources'][3]['commit']
        if not all(re.fullmatch('[0-9a-f]{40}', revision) for revision in (main_revision, deluxe_revision)):
            raise ValueError('TCGdex revisions must be full immutable commit hashes')
        main_archive = download('https://codeload.github.com/tcgdex/cards-database/zip/' + main_revision)
        deluxe_archive = download('https://codeload.github.com/tcgdex/cards-database/zip/' + deluxe_revision)
    else:
        if not args.archive_main or not args.archive_a4b:
            parser.error('--reproduce requires --archive-main and --archive-a4b')
        payloads = {entry['path']: (INPUTS / entry['path']).read_bytes() for source in manifest['sources'][:2] for entry in source['files']}
        main_archive = args.archive_main.read_bytes()
        deluxe_archive = args.archive_a4b.read_bytes()
    cards, sets = extract(main_archive)
    deluxe, _ = extract(deluxe_archive, True)
    payloads.update({'tcgdex-pocket-cards.json': js_json(cards), 'tcgdex-pocket-sets.json': js_json(sets), 'tcgdex-A4b-cards.json': js_json(deluxe)})
    count = verify(manifest, payloads)
    if args.refresh:
        # All validation completed before the first mutation. Exact hashes mean
        # this refresh preserves existing input bytes and reviewed corrections.
        for name, data in {**payloads, **notices}.items():
            target = INPUTS / name
            temporary = target.with_name(target.name + '.download')
            temporary.write_bytes(data)
            temporary.replace(target)
    print('PASS: %d pinned payloads; reproduced %d main cards, %d sets and %d Deluxe cards byte for byte. %s' % (count, len(cards), len(sets), len(deluxe), 'Pinned inputs refreshed.' if args.refresh else 'No files changed.'))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, zipfile.BadZipFile) as error:
        print('FAIL: ' + str(error), file=sys.stderr)
        sys.exit(1)
