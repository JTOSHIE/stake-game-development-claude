#!/usr/bin/env python3
"""source_registry.py - the canonical-source guard (R050 TASK 1 standing rule).

Every art master names its canonical source path in canonical_sources.json,
and any pipeline generator asks this module before reading a source: an
unlisted path is REFUSED, loudly, so an ambient exploration can never feed a
shipped master again (the R048/R050 near-miss: three superseded lineages sat
beside the canonical ones and the R048 round generated from two of them).

Usage in a generator:
    from source_registry import canonical
    path = canonical('studio_mark_master')          # returns the listed path
    # or guard an explicit path:
    from source_registry import assert_listed
    assert_listed('design-system/brand/hero_emblem/master_1024.png')

Self-test, convention (p): plants an unlisted path and requires the refusal.
    scripts/assets/.venv/bin/python scripts/assets/source_registry.py --self-test
"""

import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_REPO = os.path.dirname(os.path.dirname(_HERE))
_REGISTRY = os.path.join(_HERE, 'canonical_sources.json')


class UnlistedSourceError(RuntimeError):
    pass


def _load():
    with open(_REGISTRY) as f:
        return json.load(f)['sources']


def canonical(key):
    """The registered path for a named master; KeyError if the name is new."""
    entry = _load()[key]
    return entry['path']


def assert_listed(path):
    """Refuse any generation source path the registry does not list."""
    listed = {e['path'] for e in _load().values()}
    if path not in listed:
        raise UnlistedSourceError(
            f'REFUSED: {path!r} is not in canonical_sources.json. Every art '
            f'master names its canonical source there (R050 standing rule); '
            f'add it with the brief or owner decision that named it, or use '
            f'the listed source.')
    full = os.path.join(_REPO, path)
    if not os.path.exists(full):
        raise UnlistedSourceError(f'REFUSED: listed source {path!r} does not exist on disk')
    return full


if __name__ == '__main__':
    if '--self-test' in sys.argv:
        ok = True
        # The exact defect class: a superseded exploration path fed to the pipeline.
        try:
            assert_listed('design-system/archive/provider_mark/provider_mark_a-master_512.png')
            print('  MISSED  an archived exploration path was accepted')
            ok = False
        except UnlistedSourceError:
            print('  caught  an archived exploration path is refused')
        # A fabricated path must also be refused.
        try:
            assert_listed('design-system/nowhere/master.png')
            print('  MISSED  a fabricated path was accepted')
            ok = False
        except UnlistedSourceError:
            print('  caught  a fabricated path is refused')
        # Negative control: every listed source resolves and is accepted.
        try:
            for key in _load():
                assert_listed(canonical(key))
            print('  clean   every listed canonical source is accepted and exists')
        except Exception as e:
            print(f'  FALSE+  a listed source was refused: {e}')
            ok = False
        if not ok:
            print('\nSOURCE REGISTRY SELF-TEST: FAIL')
            sys.exit(1)
        print('\nSOURCE REGISTRY SELF-TEST: PASS (2 seeded refusals, listed set clean)')
        sys.exit(0)
    print(json.dumps(_load(), indent=1))
