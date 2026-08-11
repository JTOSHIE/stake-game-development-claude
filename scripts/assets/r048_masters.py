#!/usr/bin/env python3
"""r048_masters.py - FABLE ART MASTERS R048: sixteen seeded candidates.

Four masters, four candidates each, base seed 20260811 plus offsets 0 to 3,
per the brief at reports/briefs/FS_FABLE_R048_ART_MASTERS_Prompt.md. Owner
promotes exactly one per master; nothing ships without the promotion reply.

THE PIPELINE POSITION, stated before any output is kept (the standing licence
rule). No diffusion model exists on this machine and none is installed by
this instrument. "img2img" is realised the way this pipeline has always
derived art from art (backgrounds.py, background_overdrive_derive.py):
DETERMINISTIC, SEEDED, PARAMETERISED transforms of the SHIPPED assets, so
every candidate is unmistakably this game's own art, re-runnable byte for
byte from its recorded seed. The M3 wordmark takes the brief's regeneration
branch because the shipped wordmark exists only as a 600x120 flat raster
(no layered source): it is re-set in the brand face (Orbitron 900, shipped
with the game via @fontsource) with a deterministic chrome treatment.

TOOL LICENCES, confirmed before generation:
  Pillow 12.3.0        HPND (permissive)
  CairoSVG 2.9.0       LGPL-3.0, dynamically linked, unmodified
  cairocffi 1.7.1      BSD-3-Clause
  fontTools 4.63.0     MIT
  Brotli 1.2.0         MIT
  Orbitron (font)      SIL OFL 1.1 (embedding in raster output permitted)
All permissive for producing owned raster art; no output leaves the machine.

Run, from the repository root:
  scripts/assets/.venv/bin/python scripts/assets/r048_masters.py

Writes candidates, provenance JSON beside each, contact sheets and RUN_LOG.md
under reports/art/r048/. Deterministic: same tree, same bytes.
"""

import hashlib
import io
import json
import os
import random
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(REPO, 'reports', 'art', 'r048')
BASE_SEED = 20260811

SRC = {
    'bg': 'frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg',
    'car': 'frontend/public/assets/themes/future-spinner/ui/scene_car.png',
    'robot': 'frontend/public/assets/themes/future-spinner/ui/scene_character.png',
    'wordmark': 'frontend/public/assets/themes/future-spinner/ui/logo.png',
    'provider': 'design-system/archive/delivery/WeRollSpinners-Logo.png',
    'font': 'frontend/node_modules/@fontsource/orbitron/files/orbitron-latin-900-normal.woff2',
}

PROMPTS = {
    'M1': ('neon-noir cyberpunk street at night in heavy rain, low camera, wet asphalt '
           'reflections, magenta and violet signage bokeh against deep blacks, cyan accent '
           'light, sleek dark sports car silhouette low left, atmosphere haze, centre and '
           'right kept clear for a foreground subject',
           'no text, no logos, no characters, no watermarks'),
    'M2': ('full-body clean re-render of the shipped robot mascot, confident lean, cyan rim '
           'light left and magenta right, subtle reflection clipped out, transparent everywhere else',
           'no text, no background elements, no clipping of limbs'),
    'M3': ('chrome bevelled retro-futuristic wordmark reading exactly FUTURE SPINNER, slight '
           'italic, cyan-white metal gradient, thin electric arcs, transparent background',
           'no other text'),
    'M4': ('the We Roll Spinners wheel-slot emblem, centred, 8 percent safe margin all round, '
           'ring text legible', ''),
}

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()

def save_provenance(master, name, seed, params, sources, out_path, note=''):
    prompt, negative = PROMPTS[master]
    prov = {
        'master': master,
        'candidate': name,
        'base_seed': BASE_SEED,
        'seed': seed,
        'prompt': prompt,
        'negative': negative,
        'pipeline': ('AssetForge deterministic Pillow/CairoSVG transforms; img2img realised '
                     'as seeded parameterised transforms of the shipped assets (no diffusion '
                     'model on this machine), per the backgrounds.py precedent'),
        'tools': [
            {'name': 'Pillow 12.3.0', 'licence': 'HPND'},
            {'name': 'fontTools 4.63.0 + Brotli 1.2.0', 'licence': 'MIT'},
            {'name': 'Orbitron 900 (@fontsource)', 'licence': 'SIL OFL 1.1'},
        ],
        'source_assets': [{'path': p, 'sha256': sha256(os.path.join(REPO, p))} for p in sources],
        'recipe_params': params,
        'output_bytes': os.path.getsize(out_path),
        'output_sha256': sha256(out_path),
        'note': note,
    }
    with open(out_path.rsplit('.', 1)[0] + '.provenance.json', 'w') as f:
        json.dump(prov, f, indent=1)

# ── M1: tile background ──────────────────────────────────────────────────────

def gradient_map(im, shadows, highlights):
    """Push shadows toward `shadows` and highlights toward `highlights`."""
    im = im.convert('RGB')
    r, g, b = im.split()
    out = []
    for ch, lo, hi in zip((r, g, b), shadows, highlights):
        lut = [int(min(255, max(0, (i / 255) * hi + (1 - i / 255) * lo * (1 - i / 255) + i * 0))) for i in range(256)]
        lut = [int(min(255, max(0, i + (lo * (1 - i / 255) ** 2) + (hi - 255) * ((i / 255) ** 2)))) for i in range(256)]
        out.append(ch.point(lut))
    return Image.merge('RGB', out)

# Each seed offset is a DISTINCT look profile, so the owner chooses between
# four genuinely different reads of the same shipped scene rather than four
# near-twins (the first run's sheets were too close to call).
M1_PROFILES = {0: 'balanced', 1: 'magenta-noir', 2: 'cyan-wash', 3: 'deep-contrast'}

def m1_candidate(seed):
    rng = random.Random(seed)
    profile = M1_PROFILES[seed - BASE_SEED]
    bg = Image.open(os.path.join(REPO, SRC['bg'])).convert('RGB')  # 1920x1080 native
    W, H = 1920, 1080
    im = bg.copy()

    # Grade per profile: violet-magenta shadow lift, cyan highlight accent.
    if profile == 'magenta-noir':
        sh, hi = (44, 4, 40), (255, 236, 250)
        sat, con = rng.uniform(0.22, 0.30), rng.uniform(0.04, 0.08)
    elif profile == 'cyan-wash':
        sh, hi = (8, 14, 34), (225, 255, 255)
        sat, con = rng.uniform(0.10, 0.16), rng.uniform(0.02, 0.06)
    elif profile == 'deep-contrast':
        sh, hi = (16, 2, 22), (248, 252, 255)
        sat, con = rng.uniform(0.04, 0.10), rng.uniform(0.16, 0.24)
    else:
        sh = (rng.randint(14, 30), rng.randint(2, 8), rng.randint(20, 40))
        hi = (255 - rng.randint(0, 18), 255, 255)
        sat, con = rng.uniform(0.05, 0.22), rng.uniform(0.03, 0.10)
    im = gradient_map(im, sh, hi)
    im = ImageEnhance.Color(im).enhance(1.0 + sat)
    im = ImageEnhance.Contrast(im).enhance(1.0 + con)

    # Wet asphalt: reflect the mid band into the bottom band, blurred vertically.
    band_h = int(H * rng.uniform(0.24, 0.30))
    src_band = im.crop((0, H - 2 * band_h, W, H - band_h)).transpose(Image.FLIP_TOP_BOTTOM)
    src_band = src_band.filter(ImageFilter.GaussianBlur(rng.uniform(2.5, 4.5)))
    mask = Image.new('L', (W, band_h), 0)
    md = ImageDraw.Draw(mask)
    for y in range(band_h):
        md.line([(0, y), (W, y)], fill=int(90 * (y / band_h) ** 0.7))
    im.paste(Image.blend(im.crop((0, H - band_h, W, H)), src_band, 0.5), (0, H - band_h), mask)

    # Signage bokeh, kept to the LEFT THIRD and upper band, never centre-right.
    bokeh = Image.new('RGB', (W, H), (0, 0, 0))
    bd = ImageDraw.Draw(bokeh)
    for _ in range(rng.randint(9, 14)):
        x = rng.randint(int(W * 0.02), int(W * 0.34))
        y = rng.randint(int(H * 0.06), int(H * 0.62))
        rad = rng.randint(10, 44)
        col = rng.choice([(214, 64, 214), (156, 70, 255), (64, 210, 230)])
        bd.ellipse([x - rad, y - rad, x + rad, y + rad], fill=col)
    bokeh = bokeh.filter(ImageFilter.GaussianBlur(rng.uniform(10, 18)))
    im = Image.blend(im, ImageOps.autocontrast(Image.blend(im, bokeh, 0.0)), 0.0)
    im = Image.composite(Image.blend(im, bokeh, rng.uniform(0.16, 0.26)), im,
                         bokeh.convert('L').point(lambda v: min(255, v * 3)))

    # Car silhouette low left, from the shipped car, crushed toward black.
    car = Image.open(os.path.join(REPO, SRC['car'])).convert('RGBA')
    cw = int(W * rng.uniform(0.30, 0.36))
    ch = int(car.height * cw / car.width)
    car = car.resize((cw, ch), Image.LANCZOS)
    dark = ImageEnhance.Brightness(car.convert('RGB')).enhance(rng.uniform(0.10, 0.18))
    dark = gradient_map(dark, (10, 2, 16), (140, 150, 190))
    car_sil = Image.merge('RGBA', (*dark.split(), car.split()[3]))
    cx = int(W * rng.uniform(0.00, 0.03))
    cy = H - ch - int(H * rng.uniform(0.02, 0.05))
    im_rgba = im.convert('RGBA')
    im_rgba.alpha_composite(car_sil, (cx, cy))
    im = im_rgba.convert('RGB')

    # Rain: sparse, thin, steep diagonal streaks, low alpha; then haze.
    rain = Image.new('L', (W, H), 0)
    rd = ImageDraw.Draw(rain)
    drift = rng.randint(-60, -30)
    for _ in range(rng.randint(260, 380)):
        x, y = rng.randint(-80, W), rng.randint(-40, H)
        ln = rng.randint(14, 34)
        rd.line([(x, y), (x + int(drift * ln / 100), y + ln)], fill=rng.randint(28, 60), width=1)
    rain = rain.filter(ImageFilter.GaussianBlur(0.6))
    im = Image.composite(ImageEnhance.Brightness(im).enhance(1.9), im, rain)
    haze = Image.new('L', (W, H), 0)
    hd = ImageDraw.Draw(haze)
    for y in range(H):
        hd.line([(0, y), (W, y)], fill=int(rng.uniform(26, 40) * (1 - abs(y / H - 0.58) * 1.6) ** 2 if abs(y / H - 0.58) < 0.79 else 0))
    tint = Image.new('RGB', (W, H), (120, 140, 190))
    im = Image.composite(Image.blend(im, tint, 0.5), im, haze.point(lambda v: v // 2))

    # CENTRE AND RIGHT KEPT CLEAR: quiet the upper-right (the scene's flying
    # car and its light streaks) with a soft directional darkening, so the
    # tile's foreground subject owns that region.
    quiet = Image.new('L', (W, H), 0)
    qd = ImageDraw.Draw(quiet)
    for x in range(W // 2, W):
        t = (x - W / 2) / (W / 2)
        qd.line([(x, 0), (x, int(H * 0.55))], fill=int(150 * t))
    quiet = quiet.filter(ImageFilter.GaussianBlur(60))
    im = Image.composite(ImageEnhance.Brightness(im).enhance(0.42), im, quiet)

    return im, {
        'profile': profile, 'shadow_lift': sh, 'highlight': hi,
        'reflect_band_frac': band_h / H, 'car_width_frac': cw / W,
        'car_pos': [cx, cy], 'rain_drift': drift,
    }

def save_m1(im, path):
    for q in (88, 84, 80, 74, 68):
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
        if buf.tell() <= 1_500_000:
            with open(path, 'wb') as f:
                f.write(buf.getvalue())
            return q
    raise SystemExit('M1 candidate cannot reach 1.5 MB, refusing to keep it')

# ── M2: foreground hero ──────────────────────────────────────────────────────

def m2_candidate(seed):
    rng = random.Random(seed)
    robot = Image.open(os.path.join(REPO, SRC['robot'])).convert('RGBA')
    S = 1200
    lean = rng.uniform(3.5, 7.5)  # confident lean, seeded
    rot = robot.rotate(lean, expand=True, resample=Image.BICUBIC)
    scale = (S * 0.92) / rot.height
    rot = rot.resize((int(rot.width * scale), int(rot.height * scale)), Image.LANCZOS)

    canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    px = (S - rot.width) // 2
    py = S - rot.height - int(S * 0.02)
    canvas.alpha_composite(rot, (px, py))

    # Directional rim light from the alpha edge: cyan left, magenta right.
    alpha = canvas.split()[3]
    edge = alpha.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    glow_r = rng.randint(4, 7)
    strength = rng.uniform(0.75, 1.0)
    for side, colour in (('left', (64, 224, 255)), ('right', (255, 64, 216))):
        shift = -glow_r if side == 'left' else glow_r
        side_mask = Image.new('L', (S, S), 0)
        side_mask.paste(edge, (shift, 0))
        half = Image.new('L', (S, S), 0)
        hd = ImageDraw.Draw(half)
        if side == 'left':
            hd.rectangle([0, 0, S // 2, S], fill=255)
        else:
            hd.rectangle([S // 2, 0, S, S], fill=255)
        side_mask = Image.composite(side_mask, Image.new('L', (S, S), 0), half)
        side_mask = side_mask.filter(ImageFilter.GaussianBlur(glow_r)).point(lambda v: int(v * strength))
        rim = Image.new('RGBA', (S, S), colour + (0,))
        rim.putalpha(side_mask)
        canvas = Image.alpha_composite(canvas, rim)

    # The rim must light the SUBJECT, not spray the void: clip to a slightly
    # dilated subject alpha so edges stay clean at 400 percent.
    clip = alpha.filter(ImageFilter.MaxFilter(2 * glow_r + 1)).filter(ImageFilter.GaussianBlur(1.2))
    r, g, b, a = canvas.split()
    canvas = Image.merge('RGBA', (r, g, b, Image.composite(a, Image.new('L', (S, S), 0), clip.point(lambda v: 255 if v > 8 else 0))))
    return canvas, {'lean_deg': round(lean, 2), 'rim_radius': glow_r, 'rim_strength': round(strength, 3)}

# ── M3: title layer, the regeneration branch ─────────────────────────────────

def orbitron_ttf():
    from fontTools.ttLib import TTFont
    cache = os.path.join(OUT, '_orbitron900.ttf')
    if not os.path.exists(cache):
        f = TTFont(os.path.join(REPO, SRC['font']))
        f.flavor = None
        f.save(cache)
    return cache

def m3_candidate(seed):
    rng = random.Random(seed)
    W, H = 1600, 600
    SS = 2  # supersample
    text = 'FUTURE SPINNER'
    font = ImageFont.truetype(orbitron_ttf(), size=150 * SS)

    # Set the text, then shear for the slight italic.
    probe = Image.new('L', (W * SS * 2, H * SS), 0)
    pd = ImageDraw.Draw(probe)
    pd.text((60, H * SS // 2), text, font=font, fill=255, anchor='lm')
    bbox = probe.getbbox()
    mask = probe.crop(bbox)
    shear = rng.uniform(0.10, 0.16)
    mask = mask.transform(
        (int(mask.width + shear * mask.height), mask.height), Image.AFFINE,
        (1, -shear, shear * mask.height, 0, 1, 0), resample=Image.BICUBIC)
    scale = min((W * SS * 0.94) / mask.width, (H * SS * 0.62) / mask.height)
    mask = mask.resize((int(mask.width * scale), int(mask.height * scale)), Image.LANCZOS)

    canvas = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    tx, ty = (W * SS - mask.width) // 2, (H * SS - mask.height) // 2

    # Chrome: vertical cyan-white metal gradient with a horizon line.
    grad = Image.new('RGB', (1, mask.height))
    horizon = rng.uniform(0.52, 0.60)
    for y in range(mask.height):
        t = y / mask.height
        if t < horizon:
            v = 1 - t / horizon
            col = (int(190 + 65 * v), int(235 + 20 * v), 255)
        else:
            v = (t - horizon) / (1 - horizon)
            col = (int(40 + 70 * v), int(140 + 60 * v), int(190 + 50 * v))
        grad.putpixel((0, y), col)
    fill = grad.resize(mask.size)
    body = Image.new('RGBA', mask.size, (0, 0, 0, 0))
    body.paste(fill, (0, 0), mask)

    # Bevel: bright top-edge, dark bottom-edge, from shifted masks.
    up = Image.new('L', mask.size, 0); up.paste(mask, (0, -3 * SS))
    dn = Image.new('L', mask.size, 0); dn.paste(mask, (0, 3 * SS))
    top_e = Image.composite(mask, Image.new('L', mask.size, 0), up.point(lambda v: 255 - v))
    bot_e = Image.composite(mask, Image.new('L', mask.size, 0), dn.point(lambda v: 255 - v))
    body.paste((255, 255, 255, 235), (0, 0), top_e.filter(ImageFilter.GaussianBlur(0.6 * SS)))
    body.paste((8, 30, 52, 220), (0, 0), bot_e.filter(ImageFilter.GaussianBlur(0.6 * SS)))

    canvas.alpha_composite(body, (tx, ty))

    # Thin electric arcs: CLEAR of the letterforms (above the caps or below
    # the baseline with real margin), with small forks so they read electric
    # rather than scratched. The first run let them graze the letters.
    arcs = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ad = ImageDraw.Draw(arcs)
    for _ in range(rng.randint(2, 3)):
        yy = ty + rng.choice([int(-0.14 * mask.height), int(1.14 * mask.height)])
        x = tx + rng.randint(0, int(mask.width * 0.20))
        pts = [(x, yy)]
        while x < tx + mask.width * rng.uniform(0.6, 0.95):
            x += rng.randint(30, 90) * SS // 2
            pts.append((x, yy + rng.randint(-7, 7) * SS // 2))
        ad.line(pts, fill=(150, 242, 255, 220), width=SS)
        for fx, fy in rng.sample(pts[1:-1], k=min(2, max(0, len(pts) - 2))):
            ad.line([(fx, fy), (fx + rng.randint(-14, 14) * SS // 2, fy + rng.choice([-1, 1]) * rng.randint(8, 18) * SS // 2)],
                    fill=(150, 242, 255, 190), width=SS)
    glow = arcs.filter(ImageFilter.GaussianBlur(2 * SS))
    canvas = Image.alpha_composite(canvas, glow)
    canvas = Image.alpha_composite(canvas, arcs)

    out = canvas.resize((W, H), Image.LANCZOS)
    # No stray glow outside the alpha: anything below 6/255 is cut to zero.
    r, g, b, a = out.split()
    out = Image.merge('RGBA', (r, g, b, a.point(lambda v: 0 if v < 6 else v)))
    return out, {'shear': round(shear, 3), 'chrome_horizon': round(horizon, 3)}

# ── M4: provider logo ────────────────────────────────────────────────────────

SRC['provider_ring'] = 'design-system/archive/provider_mark/provider_mark_a-master_512.png'

def m4_candidate(seed):
    rng = random.Random(seed)
    S = 1024
    # TWO LINEAGES for the owner to choose between, the trade stated: seeds
    # base and base+1 use the ORIGINAL a-master, the full wheel-slot emblem
    # with the WE ROLL SPINNERS ring text the brief describes (512 native,
    # upscaled 2x, transparent variant lifted by neon luma key because the
    # master is opaque); seeds base+2 and base+3 use the ADOPTED candidate F,
    # which the derivation record chose precisely because it wins all three
    # small-size legibility measures at 32px (PROVIDER_LOGO_DERIVATION.md
    # section 4) at the cost of the ring text.
    lineage = 'a-master-ring-text' if seed - BASE_SEED < 2 else 'f-adopted'
    if lineage == 'a-master-ring-text':
        mark = Image.open(os.path.join(REPO, SRC['provider_ring'])).convert('RGBA')
        mark = mark.resize((1024, 1024), Image.LANCZOS)
        # Neon luma key: the emblem is neon on near-black, so alpha follows
        # the brightest channel; recomposing on a dark plate is identity.
        r, g, b, _ = mark.split()
        luma = Image.merge('RGB', (r, g, b)).convert('L')
        keyed_alpha = luma.point(lambda v: 0 if v < 14 else min(255, int((v - 14) * 1.35)))
        mark = Image.merge('RGBA', (r, g, b, keyed_alpha))
    else:
        mark = Image.open(os.path.join(REPO, SRC['provider'])).convert('RGBA')
    margin = 0.08
    inner = int(S * (1 - 2 * margin))
    # Seeded scale INSIDE the safe margin, never past it.
    scale = rng.uniform(0.94, 1.0)
    side = int(inner * scale)
    mark_fit = mark.resize((side, side), Image.LANCZOS)

    transparent = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    off = (S - side) // 2
    transparent.alpha_composite(mark_fit, (off, off))

    plate_tone = rng.choice([(12, 12, 18), (16, 14, 24), (10, 14, 20), (14, 12, 16)])
    plate = Image.new('RGBA', (S, S), plate_tone + (255,))
    vg = Image.new('L', (S, S), 0)
    vd = ImageDraw.Draw(vg)
    vd.ellipse([-S * 0.25, -S * 0.25, S * 1.25, S * 1.25], fill=26)
    plate = Image.composite(Image.new('RGBA', (S, S), (30, 34, 48, 255)), plate, vg.filter(ImageFilter.GaussianBlur(S * 0.2)))
    plate.alpha_composite(mark_fit, (off, off))

    return transparent, plate, {'lineage': lineage, 'mark_scale_in_margin': round(scale, 4), 'plate_tone': plate_tone}

# ── contact sheets and the run ───────────────────────────────────────────────

def contact_sheet(master, images, labels, size):
    cols = 2
    pad = 24
    tw, th = size
    sheet = Image.new('RGB', (cols * tw + 3 * pad, 2 * th + 3 * pad + 40), (24, 24, 30))
    d = ImageDraw.Draw(sheet)
    for i, (im, lab) in enumerate(zip(images, labels)):
        x = pad + (i % cols) * (tw + pad)
        y = pad + (i // cols) * (th + pad + 20)
        thumb = im.convert('RGB') if im.mode != 'RGB' else im
        checker = Image.new('RGB', im.size, (52, 52, 60))
        if im.mode == 'RGBA':
            checker.paste(im, (0, 0), im.split()[3])
            thumb = checker
        sheet.paste(thumb.resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x, y + th + 4), lab, fill=(210, 210, 220))
    sheet.save(os.path.join(OUT, f'{master}_contact_sheet.png'), optimize=True)

def main():
    os.makedirs(OUT, exist_ok=True)
    log = ['# R048 art masters run log', '',
           f'- base seed: {BASE_SEED}, offsets 0 to 3, deterministic',
           '- licence position confirmed BEFORE generation: Pillow (HPND), fontTools '
           '(MIT), Brotli (MIT), Orbitron (SIL OFL 1.1), CairoSVG (LGPL-3.0, unused '
           'this run), all permissive for producing owned raster art; no diffusion '
           'model exists on this machine and none was installed; every candidate is '
           'a seeded deterministic transform of the shipped assets, the pipeline\'s '
           'recorded img2img form (backgrounds.py precedent).',
           '- M3 takes the brief\'s regeneration branch: the shipped wordmark is a '
           '600x120 flat raster, no layered source exists, so the mark is re-set in '
           'the shipped brand face (Orbitron 900) with a deterministic chrome '
           'treatment.', '']
    budgets = []

    for master in ('M1', 'M2', 'M3', 'M4'):
        images, labels = [], []
        for off in range(4):
            seed = BASE_SEED + off
            name = f'{master}_seed{seed}'
            if master == 'M1':
                im, params = m1_candidate(seed)
                path = os.path.join(OUT, name + '.jpg')
                q = save_m1(im, path)
                params['jpeg_quality'] = q
                save_provenance(master, name, seed, params, [SRC['bg'], SRC['car']], path)
                budgets.append(('M1', name, os.path.getsize(path)))
                images.append(im); labels.append(f'seed {seed}  q{q}  {os.path.getsize(path)//1024}KB')
            elif master == 'M2':
                im, params = m2_candidate(seed)
                path = os.path.join(OUT, name + '.png')
                im.save(path, optimize=True)
                if os.path.getsize(path) > 1_200_000:
                    raise SystemExit(f'{name} exceeds 1.2 MB, refusing to keep it')
                save_provenance(master, name, seed, params, [SRC['robot']], path)
                budgets.append(('M2', name, os.path.getsize(path)))
                images.append(im); labels.append(f'seed {seed}  {os.path.getsize(path)//1024}KB')
            elif master == 'M3':
                im, params = m3_candidate(seed)
                path = os.path.join(OUT, name + '.png')
                im.save(path, optimize=True)
                save_provenance(master, name, seed, params, [SRC['wordmark'], SRC['font']], path,
                                note='regeneration branch: shipped wordmark is 600x120 flat, no layered source')
                images.append(im); labels.append(f'seed {seed}  {os.path.getsize(path)//1024}KB')
            else:
                tr, plate, params = m4_candidate(seed)
                p1 = os.path.join(OUT, name + '_transparent.png')
                p2 = os.path.join(OUT, name + '_darkplate.png')
                tr.save(p1, optimize=True)
                plate.save(p2, optimize=True)
                m4_src = [SRC['provider_ring']] if params['lineage'] == 'a-master-ring-text' else [SRC['provider']]
                m4_note = ('a-master lineage: 512 native upscaled 2x, transparent variant lifted by '
                           'neon luma key from the opaque master; ring text as the brief describes'
                           if params['lineage'] == 'a-master-ring-text' else
                           'adopted candidate F lineage: wins all three 32px legibility measures '
                           '(PROVIDER_LOGO_DERIVATION.md section 4), no ring text by design')
                save_provenance(master, name + '_transparent', seed, params, m4_src, p1, note=m4_note)
                save_provenance(master, name + '_darkplate', seed, params, m4_src, p2, note=m4_note)
                images.append(plate); labels.append(f'seed {seed}  tr+plate')
        sheet_size = {'M1': (640, 360), 'M2': (400, 400), 'M3': (640, 240), 'M4': (400, 400)}[master]
        contact_sheet(master, images, labels, sheet_size)
        log.append(f'- {master}: 4 candidates, contact sheet written')

    # THE PAIR GATE, enforced by construction: every M1 is 1.5 MB or less and
    # every M2 is 1.2 MB or less, so EVERY promotable M1+M2 pairing is 2.7 MB
    # or less against the 3 MB rule. The worst actual pairing is logged.
    worst = max(b for m, _, b in budgets if m == 'M1') + max(b for m, _, b in budgets if m == 'M2')
    log.append(f'- pair gate: worst M1+M2 pairing {worst} bytes against 3,000,000; every pairing passes by construction')
    if worst > 3_000_000:
        raise SystemExit('pair gate FAILED')
    ttf = os.path.join(OUT, '_orbitron900.ttf')
    if os.path.exists(ttf):
        os.remove(ttf)
    with open(os.path.join(OUT, 'RUN_LOG.md'), 'w') as f:
        f.write('\n'.join(log) + '\n')
    print('\n'.join(log))
    print('R048 MASTERS: COMPLETE')

if __name__ == '__main__':
    main()
