#!/usr/bin/env python3
"""r050_finals.py - R050 TASK 2: the four finals, from the owner's recorded picks.

Every source resolves through the canonical-source registry (convention (u),
this instrument is its first consumer): an unlisted path is refused before a
byte is read. Deterministic; provenance JSON with source sha256 beside every
output.

Phase one (default): produce the CHECKPOINT ONE artefacts for the owner's
YES taps under reports/art/r050_checkpoint/:
  2a  provider_logo_darkplate.png / provider_logo_transparent.png, 1024x1024
      from the studio mark master, mark at the 8 percent safe margin, plate
      tone 12,12,18, each 1 MB or less.
  2b  tile_title.png, 1600x600 transparent, the shipped wordmark scaled
      exactly 2.0x by Lanczos to 1200x240, centred, alpha cleaned, ONE
      gentle sharpen pass, no re-rendering, no type re-setting.

Phase two (--promote, only after both YES taps are on record): copy the four
finals to assets/portal/ under the platform-facing names, with provenance.

Run, from the repository root:
  scripts/assets/.venv/bin/python scripts/assets/r050_finals.py
  scripts/assets/.venv/bin/python scripts/assets/r050_finals.py --promote
"""

import hashlib
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from source_registry import canonical, assert_listed  # noqa: E402

from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHECKPOINT = os.path.join(REPO, 'reports', 'art', 'r050_checkpoint')
PORTAL = os.path.join(REPO, 'assets', 'portal')

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()

def provenance(out_path, source_key, params, note=''):
    src = canonical(source_key)
    prov = {
        'brief': 'FABLE MASTER BRIEF R050 TASK 2',
        'source_key': source_key,
        'source_path': src,
        'source_sha256': sha256(os.path.join(REPO, src)),
        'params': params,
        'output_bytes': os.path.getsize(out_path),
        'output_sha256': sha256(out_path),
        'note': note,
        'owner_decision': 'R050 owner decisions on record; promoted only on the CHECKPOINT ONE YES taps',
    }
    with open(out_path.rsplit('.', 1)[0] + '.provenance.json', 'w') as f:
        json.dump(prov, f, indent=1)

def build_provider_logo():
    src = assert_listed(canonical('studio_mark_master'))
    mark = Image.open(src).convert('RGBA')  # 1024x1024 native, opaque near-black field
    S = 1024
    margin = 0.08
    inner = int(S * (1 - 2 * margin))  # 860

    # The master is opaque neon-on-near-black; the transparent variant lifts
    # it by neon luma key (alpha follows the brightest channel), which
    # recomposes identically on a dark plate.
    r, g, b, _ = mark.split()
    luma = Image.merge('RGB', (r, g, b)).convert('L')
    keyed = Image.merge('RGBA', (r, g, b, luma.point(lambda v: 0 if v < 12 else min(255, int((v - 12) * 1.3)))))

    fitted = keyed.resize((inner, inner), Image.LANCZOS)
    off = (S - inner) // 2

    transparent = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    transparent.alpha_composite(fitted, (off, off))

    plate = Image.new('RGBA', (S, S), (12, 12, 18, 255))
    plate.alpha_composite(fitted, (off, off))

    os.makedirs(CHECKPOINT, exist_ok=True)
    p_tr = os.path.join(CHECKPOINT, 'provider_logo_transparent.png')
    p_pl = os.path.join(CHECKPOINT, 'provider_logo_darkplate.png')

    # The 1 MB budget, honestly: full RGBA first; where that exceeds the
    # budget, 256-colour quantisation with dithering (measured 1.33 MB down
    # to about 0.26 MB on the transparent variant), recorded in provenance so
    # the trade is on the record and the owner's YES covers it.
    encodings = {}
    for img, path in ((transparent, p_tr), (plate, p_pl)):
        img.save(path, optimize=True)
        encodings[path] = 'RGBA'
        if os.path.getsize(path) > 1_000_000:
            img.quantize(256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG).save(path, optimize=True)
            encodings[path] = 'P-256 dithered (RGBA exceeded the 1 MB budget)'
        if os.path.getsize(path) > 1_000_000:
            raise SystemExit(f'{os.path.basename(path)} exceeds 1 MB even quantised, refusing to keep it')
    params = {'canvas': [S, S], 'safe_margin': margin, 'plate_tone': [12, 12, 18],
              'luma_key': 'threshold 12, gain 1.3', 'resample': 'LANCZOS',
              'encoding': {os.path.basename(k): v for k, v in encodings.items()}}
    provenance(p_tr, 'studio_mark_master', params)
    provenance(p_pl, 'studio_mark_master', params)
    return p_tr, p_pl

def build_tile_title():
    src = assert_listed(canonical('title_wordmark_master'))
    mark = Image.open(src).convert('RGBA')  # 600x120, lightning included
    W, H = 1600, 600
    scaled = mark.resize((mark.width * 2, mark.height * 2), Image.LANCZOS)  # exactly 2.0x

    # ONE gentle sharpen pass, as ordered, nothing else.
    sharp = scaled.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=3))

    # Alpha cleaned: stray sub-6 alpha cut to zero so no halo survives at
    # 400 percent zoom; the lightning's deliberate partial alpha stays.
    r, g, b, a = sharp.split()
    sharp = Image.merge('RGBA', (r, g, b, a.point(lambda v: 0 if v < 6 else v)))

    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(sharp, ((W - sharp.width) // 2, (H - sharp.height) // 2))

    os.makedirs(CHECKPOINT, exist_ok=True)
    out = os.path.join(CHECKPOINT, 'tile_title.png')
    canvas.save(out, optimize=True)
    provenance(out, 'title_wordmark_master', {
        'canvas': [W, H], 'scale': 2.0, 'resample': 'LANCZOS',
        'sharpen': 'UnsharpMask r1.4 60% t3, single pass', 'alpha_floor': 6,
        'placement': 'centred',
    }, note='no re-rendering, no type re-setting, per the brief')
    return out

def promote():
    """Phase two: only after both YES taps are on record in the session."""
    os.makedirs(PORTAL, exist_ok=True)
    moves = [
        (os.path.join(REPO, assert_listed(canonical('tile_background_master'))), 'tile_background.jpg', 'tile_background_master'),
        (os.path.join(REPO, assert_listed(canonical('tile_foreground_master'))), 'tile_foreground.png', 'tile_foreground_master'),
        (os.path.join(CHECKPOINT, 'tile_title.png'), 'tile_title.png', 'title_wordmark_master'),
        (os.path.join(CHECKPOINT, 'provider_logo_darkplate.png'), 'provider_logo.png', 'studio_mark_master'),
        (os.path.join(CHECKPOINT, 'provider_logo_transparent.png'), 'provider_logo_transparent.png', 'studio_mark_master'),
    ]
    for src, name, key in moves:
        dst = os.path.join(PORTAL, name)
        shutil.copyfile(src, dst)
        prov = {
            'brief': 'FABLE MASTER BRIEF R050 CHECKPOINT ONE promotion',
            'promoted_from': os.path.relpath(src, REPO),
            'source_key': key,
            'source_path': canonical(key),
            'source_sha256': sha256(os.path.join(REPO, canonical(key))),
            'output_sha256': sha256(dst),
            'output_bytes': os.path.getsize(dst),
            'gate': 'promoted on the owner\'s two YES taps, quoted in the R050 session report',
        }
        with open(dst.rsplit('.', 1)[0] + '.provenance.json', 'w') as f:
            json.dump(prov, f, indent=1)
        print(f'promoted {name} ({os.path.getsize(dst)} bytes)')
    print(f'\nPORTAL SET: {PORTAL}')

if __name__ == '__main__':
    if '--promote' in sys.argv:
        promote()
    else:
        t, p = build_provider_logo()
        title = build_tile_title()
        for x in (t, p, title):
            print(f'{x} ({os.path.getsize(x)} bytes)')
        print('CHECKPOINT ONE artefacts ready for the owner')
