#!/usr/bin/env python3
"""Offline pre-push structural audit of app/build.gradle, independent of Gradle.

Detects unterminated quotes, unbalanced delimiters and malformed XY10 audit
commandLine before a GitHub Gradle build begins. This is a lightweight guard,
not a replacement for compiling the real Groovy DSL with Gradle.
"""
from __future__ import annotations
import argparse
import bisect
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_XY10_AUDIT = [
    'node', '--test',
    'tests/v07383-fates-collide-integration.test.cjs',
    'tests/v07383-fates-collide-effects.test.cjs',
    'tests/v07384-fates-collide-stage2.test.cjs',
    'tests/v07385-fates-collide-stage3.test.cjs',
    'tests/v07386-fates-collide-stage4.test.cjs',
    'tests/v07387-fates-collide-stage5.test.cjs',
    'tests/v07388-fates-collide-complete.test.cjs',
    'tests/v07389-fates-collide-independent-audit.test.cjs',
]

EXPECTED_XY11_AUDIT = ['node','--test','tests/v07390-steam-siege-integration.test.cjs','tests/v07391-steam-siege-audit.test.cjs','tests/v07392-steam-siege-batch2.test.cjs','tests/v07393-steam-siege-abilities.test.cjs','tests/v07394-steam-siege-completion.test.cjs','tests/v07395-steam-siege-independent-audit.test.cjs','tests/v07403-wild-edge-cpu-turn.test.cjs','tests/v07404-basic-energy-search-coins.test.cjs','tests/v07405-basic-energy-search-completeness-audit.test.cjs','tests/v07406-basic-energy-search-special-cases.test.cjs']

class GradleSourceError(ValueError):
    pass


def check_balanced(source: str) -> None:
    """Scan Groovy source for malformed strings and mismatched delimiters."""
    starts = [0] + [m.end() for m in re.finditer('\n', source)]
    def loc(i):
        row = bisect.bisect_right(starts, i)
        return f'line {row}, column {i-starts[row-1]+1}'
    stack = []
    matching = {')': '(', ']': '[', '}': '{'}
    i, n = 0, len(source)
    while i < n:
        if source.startswith('//', i):
            end = source.find('\n', i+2)
            i = n if end < 0 else end+1
            continue
        if source.startswith('/*', i):
            end = source.find('*/', i+2)
            if end < 0:
                raise GradleSourceError('Unclosed block comment at '+loc(i))
            i = end+2
            continue
        ch = source[i]
        if ch in "'\"":
            start = i
            delimiter = ch * (3 if source.startswith(ch*3, i) else 1)
            i += len(delimiter)
            while i < n:
                if source[i] == '\\':
                    i += 2
                    continue
                if source.startswith(delimiter, i):
                    i += len(delimiter)
                    break
                if len(delimiter) == 1 and source[i] == '\n':
                    raise GradleSourceError('Unterminated single-line Groovy string at '+loc(start))
                i += 1
            else:
                raise GradleSourceError('Unterminated Groovy string at '+loc(start))
            continue
        if ch in '([{':
            stack.append((ch, i))
        elif ch in ')]}':
            if not stack or stack[-1][0] != matching[ch]:
                raise GradleSourceError('Unexpected '+ch+' at '+loc(i))
            stack.pop()
        i += 1
    if stack:
        ch, start = stack[-1]
        raise GradleSourceError('Unclosed '+ch+' at '+loc(start))


def check_xy10_command(source: str, root: Path) -> None:
    match = re.search(r"(?ms)^tasks\.register\('auditXY10ForApk', Exec\) \{(.*?)^\}", source)
    if not match:
        raise GradleSourceError('Missing auditXY10ForApk task registration')
    commands = [x.strip() for x in match.group(1).splitlines() if x.strip().startswith('commandLine')]
    if len(commands) != 1:
        raise GradleSourceError('Expected exactly one XY10 audit commandLine')
    tail = commands[0][len('commandLine'):]
    # Ensure that only comma-separated Groovy string literals occur in the
    # command; a missing comma or a quote swallowing the next argument fails.
    quoted = r"'(?:[^'\\]|\\.)*'"
    syntax = r'\s*' + quoted + r'(?:\s*,\s*' + quoted + r')*\s*'
    if not re.fullmatch(syntax, tail):
        raise GradleSourceError('Malformed XY10 audit commandLine: '+commands[0])
    args = [m.group(0)[1:-1] for m in re.finditer(quoted, tail)]
    if args != EXPECTED_XY10_AUDIT:
        raise GradleSourceError('XY10 audit command must enumerate all required tests as separate quoted arguments; got '+repr(args))
    for name in args[2:]:
        if not (root/name).is_file():
            raise GradleSourceError('Missing mandatory XY10 audit test: '+name)


def check_xy11_command(source: str, root: Path) -> None:
    match = re.search(r"(?ms)^tasks\.register\('auditXY11ForApk', Exec\) \{(.*?)^\}", source)
    if not match:
        raise GradleSourceError('Missing auditXY11ForApk task registration')
    commands = [x.strip() for x in match.group(1).splitlines() if x.strip().startswith('commandLine')]
    if len(commands) != 1:
        raise GradleSourceError('Expected exactly one XY11 audit commandLine')
    tail = commands[0][len('commandLine'):]
    quoted = r"'(?:[^'\\]|\\.)*'"
    syntax = r'\s*' + quoted + r'(?:\s*,\s*' + quoted + r')*\s*'
    if not re.fullmatch(syntax, tail):
        raise GradleSourceError('Malformed XY11 audit commandLine: '+commands[0])
    args = [m.group(0)[1:-1] for m in re.finditer(quoted, tail)]
    if args != EXPECTED_XY11_AUDIT:
        raise GradleSourceError('XY11 audit must enumerate strict tests: '+repr(args))
    for name in args[2:]:
        if not (root/name).is_file():
            raise GradleSourceError('Missing XY11 audit test: '+name)

def verify(source: str, root: Path = ROOT) -> None:
    check_balanced(source)
    check_xy10_command(source, root)
    check_xy11_command(source, root)


def self_test() -> None:
    good = (ROOT/'app/build.gradle').read_text(encoding='utf-8')
    verify(good)
    bad_quote = good.replace(
        "'tests/v07383-fates-collide-effects.test.cjs', 'tests/v07384-fates-collide-stage2.test.cjs'",
        "'tests/v07383-fates-collide-effects.test.cjs, 'tests/v07384-fates-collide-stage2.test.cjs'"
    )
    assert bad_quote != good, 'fixture did not match expected audit arguments'
    for name, source in [
        ('missing quote', bad_quote),
        ('missing test comma', good.replace("effects.test.cjs', 'tests/", "effects.test.cjs' 'tests/")),
        ('missing newest-stage test', good.replace(", 'tests/v07389-fates-collide-independent-audit.test.cjs'", "")),
        ('unclosed Gradle block', good+'\n{'),
        ('missing XY11 audit', good.replace("'tests/v07391-steam-siege-audit.test.cjs'","'tests/not-our-test.test.cjs'")),
        ('XY11 broken separator', good.replace("'--test', 'tests/v07390-steam-siege-integration.test.cjs'","'--test' 'tests/v07390-steam-siege-integration.test.cjs'")),
    ]:
        try:
            verify(source)
        except GradleSourceError:
            pass
        else:
            raise AssertionError('Preflight failed to catch '+name)
    print('PASS: Gradle guard detects missing quote, missing separator and unbalanced blocks.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--file', type=Path, default=ROOT/'app/build.gradle')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    try:
        verify(args.file.read_text(encoding='utf-8'), ROOT)
        print('PASS: Gradle source strings, delimiters and XY10 audit test arguments.')
        if args.self_test:
            self_test()
    except (OSError, GradleSourceError, AssertionError) as err:
        print('GRADLE SOURCE PREFLIGHT FAILED: '+str(err), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
