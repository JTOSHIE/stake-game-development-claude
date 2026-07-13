FS_DesignSystemSeed_Prompt.md. Save this brief verbatim as FS_DesignSystemSeed_Prompt.md and commit it with this session per convention.

On a new branch claude/design-system-seed from up-to-date main: create the files below with EXACTLY the content between their BEGIN and END markers, then verify, commit, push, and open a PR into main via gh titled "Design system seed: vector masters and system record" with the session report as description.

Verification before commit: create a Python venv with cairosvg and pillow, render each SVG master at 1024 and at 120 px, confirm each parses and renders without error and has transparent corners at 1024 (alpha 0 at all four corner pixels), and save a contact sheet of all four to ~/Desktop/FS_DesignSystem_ContactSheet.png for owner review. Write reports/SESSION_REPORT.md plus archive copy per convention.

--- BEGIN design-system/DESIGN_SYSTEM.md ---
# WRS DESIGN SYSTEM: RECORD OF TRUTH
Future Spinner and all future We Roll Spinners games. July 2026.
This document plus the masters in design-system/masters/ carry the studio's
design capital. A session with only this directory and the repository can
regenerate every pending brief.

## SYSTEM LAWS
- One design output: every visual asset derives from vector masters in this
  directory. No external generation (Manus retired July 2026).
- Front facing, always. No perspective angles on symbols or UI objects.
- Text free artwork. Localised labels render in CSS Orbitron. Single exception:
  the machined W emblem inside the Wild.
- Material language: polished chrome, brushed gunmetal, warm gold accents.
  Emissives cyan #00FFFF and magenta #FF00FF together, gold #FFD700 sparingly,
  on deep navy #060610. Key light upper left. Rich saturation, never pastel.
- Masters are 1024x1024 SVG, filter free: glows are baked as layered stroke
  stacks so rendering is deterministic in any rasteriser (cairosvg or browser).
- Exports are rendered at exact display sizes from a manifest (npm run assets in
  AssetForge v2). Layered export planned: symbol part groups (spokes, needle,
  neon rings) export separately so the engine animates parts independently.
- Every symbol must read at 120x100 px, one reel cell.

## APPROVED SYMBOL LINEUP (art is skin level; maths IDs never change)
| ID | Object | Win animation | Master status |
|----|--------|---------------|---------------|
| H1 | Spinning Rim | spin up, neon flare | v2 approved (in masters/) |
| H2 | Boost Gauge (face of Overdrive) | needle slams to redline | v2 concept approved; v3 fixes: remove stray cyan arc, aim needle into redline, heavier needle |
| M1 | Steering Wheel | quick spin with glow | to design |
| M2 | Gear | fast rotation, sparks | to design |
| M3 | Headlight | full beam flare | to design |
| L1 | Lug Nut | torque spin punch | to design |
| L2 | Spark Plug | lightning burst | to design |
| L3 | Piston | rapid pump, exhaust flash | to design |
| W | Wild hub with machined W | core flare | approved (in masters/) |
| S | Energy Burst Scatter | rupture burst | approved v2 (in masters/), may iterate in game |
Idle animations: subtle mechanical motion per object (rotation, needle flicker,
pulse), breathing scale 1.000 to 1.015, periodic light sweep. Reference motion:
the H1 idle loops seamlessly over 72 degrees (five fold symmetry); the H2 win is
an ease out back slam with overshoot and a magenta redline flare. Owner taste
calibration of speeds is pending against the preview GIFs.

## BRAND LAYER (Phase B scope)
- WRS provider logo: square, transparent background, legible at small tile
  sizes, PNG up to 10 MB, uploaded once in portal Team Settings then Branding.
- Game tile background (environmental) and foreground hero (transparent PNG)
  for the portal Tile Editor.
- We Roll Spinners presents moment on every loading screen.
- Skin manifest reserves: brandLockup slot and bgmTracks list (the selectable
  soundtrack placeholder; the Future Spinner concept is a car radio).

## PENDING PASSES (scopes sufficient to regenerate their briefs)
1. Design batches (chat, art direction): complete H2 v3 and the six remaining
   symbols per the lineup, owner approving each batch by preview sheet.
2. AssetForge v2 (Claude Code): asset pipeline (masters plus size manifest plus
   npm run assets deterministic renderer), install all symbol exports, text free
   win pod and banner (banner as CSS), spin button matte fix, loading screen
   wordmark swap, tile and provider logo exports, skin package structure
   (tokens, masters, manifest with animation descriptors, sounds, brand slot).
3. Motion Polish v2 (Claude Code): engine driven symbol animation replacing the
   MP4 pipeline (PixiJS, layered sprites, pre blurred glow copies, no live blur
   filters), win choreography, tiered celebrations (2x, 10x, 50x thresholds,
   BIG to MEGA to EPIC staged count), scatter punch, anticipation staging,
   ambient life, all turbo aware, Overdrive presentation reskinned from
   temporary CSS to system art.
4. Build Diet v2 (Claude Code): reference scan, postbuild prune of dev only
   themes and retired videos, background re encode to under 16 MB, audio
   normalisation, dist gate under 40 MB.
5. Compliance re validation (Claude Code): full checklist against the final
   build; install stakecli (pinned release or source build; session cookie in
   keychain only) for the portal upload; generate REVIEW_EVENTS.md (event ids
   per mode: wincap round, 3/4/5 scatter triggers, retrigger, win tiers) from
   the books; headless capture of the remaining live docs pages
   (approval-guidelines/math-verification, docs/approval/checklist,
   docs/approval/game-tile, docs/math pages); liability metrics already
   verified: P(payout over 5000x) is zero in both modes by the hard cap.
Then the dossier section 5 protocol, then submit.
--- END design-system/DESIGN_SYSTEM.md ---

--- BEGIN design-system/masters/W_master.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4de3ff" stop-opacity="0.4"/>
      <stop offset="55%" stop-color="#b400ff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#b400ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeRing" x1="0%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="18%" stop-color="#c2d4e6"/>
      <stop offset="38%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="84%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <radialGradient id="faceShade" cx="35%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#3d4a63"/>
      <stop offset="45%" stop-color="#1a2233"/>
      <stop offset="100%" stop-color="#0c111d"/>
    </radialGradient>
    <linearGradient id="chromeW" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="32%" stop-color="#cfe6ff"/>
      <stop offset="50%" stop-color="#7e93ad"/>
      <stop offset="56%" stop-color="#33405a"/>
      <stop offset="78%" stop-color="#aac2dc"/>
      <stop offset="100%" stop-color="#f2faff"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="486" fill="url(#bgGlow)"/>
  <circle cx="512" cy="512" r="430" fill="none" stroke="#ff00ff" stroke-width="46" opacity="0.12"/>
  <circle cx="512" cy="512" r="430" fill="none" stroke="#ff00ff" stroke-width="26" opacity="0.3"/>
  <circle cx="512" cy="512" r="430" fill="none" stroke="#ff2bd6" stroke-width="12" opacity="0.85"/>
  <circle cx="512" cy="512" r="430" fill="none" stroke="#ffc4f4" stroke-width="4" opacity="0.95"/>
  <circle cx="512" cy="512" r="392" fill="none" stroke="#00ffff" stroke-width="40" opacity="0.14"/>
  <circle cx="512" cy="512" r="392" fill="none" stroke="#00ffff" stroke-width="20" opacity="0.35"/>
  <circle cx="512" cy="512" r="392" fill="none" stroke="#5cffff" stroke-width="9" opacity="0.9"/>
  <circle cx="512" cy="512" r="392" fill="none" stroke="#eaffff" stroke-width="3"/>
  <circle cx="512" cy="512" r="356" fill="url(#chromeRing)"/>
  <circle cx="512" cy="512" r="356" fill="none" stroke="#0a0e16" stroke-width="4" opacity="0.7"/>
  <path d="M 218 320 A 356 356 0 0 1 512 156" fill="none" stroke="#ffffff" stroke-width="26" opacity="0.5" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="#0a0e16" stroke-width="5" opacity="0.75"/>
  <circle cx="512" cy="512" r="292" fill="url(#faceShade)"/>
  <circle cx="512" cy="512" r="292" fill="none" stroke="url(#gold)" stroke-width="9"/>
  <circle cx="512" cy="512" r="270" fill="none" stroke="#00ffff" stroke-width="2.5" opacity="0.45" stroke-dasharray="4 14"/>
  <circle cx="512" cy="512" r="236" fill="none" stroke="#00ffff" stroke-width="1.8" opacity="0.3" stroke-dasharray="2 10"/>
  <g id="boltG">
    <g id="bolt">
      <circle cx="512" cy="184" r="19" fill="url(#chromeRing)" stroke="#0a0e16" stroke-width="2.5"/>
      <circle cx="506" cy="178" r="6.5" fill="#ffffff" opacity="0.9"/>
    </g>
    <use href="#bolt" transform="rotate(45 512 512)"/>
    <use href="#bolt" transform="rotate(90 512 512)"/>
    <use href="#bolt" transform="rotate(135 512 512)"/>
    <use href="#bolt" transform="rotate(180 512 512)"/>
    <use href="#bolt" transform="rotate(225 512 512)"/>
    <use href="#bolt" transform="rotate(270 512 512)"/>
    <use href="#bolt" transform="rotate(315 512 512)"/>
  </g>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="#ff00ff" stroke-width="86" opacity="0.14"/>
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="#ff00ff" stroke-width="56" opacity="0.22"/>
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="#00ffff" stroke-width="38" opacity="0.4"/>
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="url(#gold)" stroke-width="24"/>
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="url(#chromeW)" stroke-width="13"/>
    <path d="M 318 372 L 422 668 L 512 448 L 602 668 L 706 372" stroke="#ffffff" stroke-width="3.5" opacity="0.85"/>
  </g>
  <ellipse cx="400" cy="340" rx="200" ry="90" fill="#ffffff" opacity="0.07" transform="rotate(-32 400 340)"/>
</svg>
--- END design-system/masters/W_master.svg ---

--- BEGIN design-system/masters/S_master.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="haze" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff00ff" stop-opacity="0.4"/>
      <stop offset="55%" stop-color="#8a2be2" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#8a2be2" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="22%" stop-color="#ccfdff"/>
      <stop offset="48%" stop-color="#00e5ff" stop-opacity="0.95"/>
      <stop offset="75%" stop-color="#c400ff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ff00ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff2bd6" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ff2bd6" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
    <linearGradient id="chromeSeg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#8fa2b8"/>
      <stop offset="100%" stop-color="#2e3a4c"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="500" fill="url(#haze)"/>
  <g id="rays" opacity="0.9">
    <g id="ray">
      <polygon points="512,60 552,330 472,330" fill="url(#rayGrad)" opacity="0.35"/>
      <polygon points="512,80 540,330 484,330" fill="url(#rayGrad)" opacity="0.6"/>
      <polygon points="512,100 528,330 496,330" fill="#ff9bea" opacity="0.75"/>
    </g>
    <use href="#ray" transform="rotate(36 512 512)"/>
    <use href="#ray" transform="rotate(80 512 512)"/>
    <use href="#ray" transform="rotate(118 512 512)"/>
    <use href="#ray" transform="rotate(155 512 512)"/>
    <use href="#ray" transform="rotate(198 512 512)"/>
    <use href="#ray" transform="rotate(238 512 512)"/>
    <use href="#ray" transform="rotate(283 512 512)"/>
    <use href="#ray" transform="rotate(322 512 512)"/>
  </g>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g id="boltSet">
      <path id="b1" d="M 512 512 L 462 372 L 516 318 L 464 196"/>
      <use href="#b1" transform="rotate(95 512 512)"/>
      <use href="#b1" transform="rotate(170 512 512)"/>
      <use href="#b1" transform="rotate(255 512 512)"/>
      <path id="b2" d="M 512 512 L 606 420 L 676 396 L 726 282"/>
      <use href="#b2" transform="rotate(120 512 512)"/>
      <use href="#b2" transform="rotate(230 512 512)"/>
    </g>
  </g>
  <use href="#boltSet" stroke="#00e5ff" stroke-width="30" opacity="0.15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <use href="#boltSet" stroke="#00e5ff" stroke-width="16" opacity="0.35" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <use href="#boltSet" stroke="#9df4ff" stroke-width="8" opacity="0.85" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <use href="#boltSet" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <g fill="none">
    <g stroke="#00ffff" stroke-width="64" opacity="0.16">
      <path d="M 512 244 A 268 268 0 0 1 744 380" transform="rotate(7 512 512)"/>
      <path d="M 768 552 A 268 268 0 0 1 642 748" transform="rotate(9 512 512)"/>
      <path d="M 512 780 A 268 268 0 0 1 290 664" transform="rotate(6 512 512)"/>
      <path d="M 252 468 A 268 268 0 0 1 376 288" transform="rotate(-8 512 512)"/>
    </g>
    <g stroke-width="42">
      <path d="M 512 244 A 268 268 0 0 1 744 380" stroke="url(#gold)" transform="rotate(7 512 512)"/>
      <path d="M 768 552 A 268 268 0 0 1 642 748" stroke="url(#chromeSeg)" transform="rotate(9 512 512)"/>
      <path d="M 512 780 A 268 268 0 0 1 290 664" stroke="url(#gold)" transform="rotate(6 512 512)"/>
      <path d="M 252 468 A 268 268 0 0 1 376 288" stroke="url(#chromeSeg)" transform="rotate(-8 512 512)"/>
    </g>
    <g stroke="#ffffff" stroke-width="10" opacity="0.55">
      <path d="M 512 258 A 254 254 0 0 1 732 386" transform="rotate(7 512 512)"/>
      <path d="M 512 766 A 254 254 0 0 1 302 656" transform="rotate(6 512 512)"/>
    </g>
  </g>
  <rect x="806" y="430" width="44" height="26" rx="6" fill="url(#gold)" transform="rotate(24 828 443)"/>
  <rect x="176" y="560" width="38" height="22" rx="6" fill="url(#chromeSeg)" transform="rotate(-18 195 571)"/>
  <circle cx="512" cy="512" r="215" fill="url(#core)"/>
  <circle cx="512" cy="512" r="132" fill="#dffdff" opacity="0.9"/>
  <circle cx="512" cy="512" r="82" fill="#ffffff"/>
  <g stroke="#ffffff" stroke-linecap="round" opacity="0.9">
    <line x1="512" y1="356" x2="512" y2="668" stroke-width="7" opacity="0.5"/>
    <line x1="356" y1="512" x2="668" y2="512" stroke-width="7" opacity="0.5"/>
    <line x1="512" y1="396" x2="512" y2="628" stroke-width="3"/>
    <line x1="396" y1="512" x2="628" y2="512" stroke-width="3"/>
  </g>
</svg>
--- END design-system/masters/S_master.svg ---

--- BEGIN design-system/masters/H1_master_v2.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4de3ff" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#b400ff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#b400ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <linearGradient id="chromeDark" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#93a7bd"/>
      <stop offset="35%" stop-color="#42506a"/>
      <stop offset="60%" stop-color="#1b2334"/>
      <stop offset="100%" stop-color="#55677f"/>
    </linearGradient>
    <radialGradient id="barrel" cx="40%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#232c40"/>
      <stop offset="55%" stop-color="#121828"/>
      <stop offset="100%" stop-color="#080c16"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
    <radialGradient id="tyre" cx="42%" cy="36%" r="80%">
      <stop offset="0%" stop-color="#2a3346"/>
      <stop offset="60%" stop-color="#141a28"/>
      <stop offset="100%" stop-color="#070a12"/>
    </radialGradient>
  </defs>
  <circle cx="512" cy="512" r="492" fill="url(#bgGlow)"/>
  <circle cx="512" cy="512" r="452" fill="url(#tyre)"/>
  <circle cx="512" cy="512" r="452" fill="none" stroke="#000208" stroke-width="6" opacity="0.8"/>
  <circle cx="512" cy="512" r="424" fill="none" stroke="#39445c" stroke-width="4" opacity="0.5" stroke-dasharray="18 26"/>
  <circle cx="512" cy="512" r="386" fill="url(#chromeU)"/>
  <circle cx="512" cy="512" r="386" fill="none" stroke="#0a0e16" stroke-width="4" opacity="0.75"/>
  <path d="M 206 330 A 358 358 0 0 1 500 154" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.5" stroke-linecap="round"/>
  <path d="M 760 796 A 358 358 0 0 0 866 560" fill="none" stroke="#ffffff" stroke-width="14" opacity="0.3" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="336" fill="none" stroke="#0a0e16" stroke-width="6" opacity="0.8"/>
  <g id="lipRivets">
    <circle id="rv" cx="512" cy="152" r="9" fill="url(#chromeDark)" stroke="#0a0e16" stroke-width="1.5"/>
    <use href="#rv" transform="rotate(36 512 512)"/>
    <use href="#rv" transform="rotate(72 512 512)"/>
    <use href="#rv" transform="rotate(108 512 512)"/>
    <use href="#rv" transform="rotate(144 512 512)"/>
    <use href="#rv" transform="rotate(180 512 512)"/>
    <use href="#rv" transform="rotate(216 512 512)"/>
    <use href="#rv" transform="rotate(252 512 512)"/>
    <use href="#rv" transform="rotate(288 512 512)"/>
    <use href="#rv" transform="rotate(324 512 512)"/>
  </g>
  <circle cx="512" cy="512" r="330" fill="url(#barrel)"/>
  <g fill="none">
    <circle cx="512" cy="512" r="276" stroke="#ff00ff" stroke-width="34" opacity="0.14"/>
    <circle cx="512" cy="512" r="276" stroke="#ff00ff" stroke-width="16" opacity="0.35"/>
    <circle cx="512" cy="512" r="276" stroke="#ff2bd6" stroke-width="7" opacity="0.9"/>
    <circle cx="512" cy="512" r="276" stroke="#ffd2f4" stroke-width="2.5"/>
    <circle cx="512" cy="512" r="196" stroke="#00ffff" stroke-width="30" opacity="0.15"/>
    <circle cx="512" cy="512" r="196" stroke="#00ffff" stroke-width="14" opacity="0.38"/>
    <circle cx="512" cy="512" r="196" stroke="#5cffff" stroke-width="6" opacity="0.9"/>
    <circle cx="512" cy="512" r="196" stroke="#eaffff" stroke-width="2"/>
    <circle cx="512" cy="512" r="236" stroke="#00ffff" stroke-width="2" opacity="0.35" stroke-dasharray="3 12"/>
  </g>
  <g id="spokeShadows" opacity="0.45">
    <g id="pairS" transform="translate(7 9)">
      <path d="M 496 216 L 508 216 L 520 470 L 490 470 Z" fill="#04060c" transform="rotate(-8 512 512)"/>
      <path d="M 516 216 L 528 216 L 534 470 L 504 470 Z" fill="#04060c" transform="rotate(8 512 512)"/>
    </g>
    <use href="#pairS" transform="rotate(72 512 512)"/>
    <use href="#pairS" transform="rotate(144 512 512)"/>
    <use href="#pairS" transform="rotate(216 512 512)"/>
    <use href="#pairS" transform="rotate(288 512 512)"/>
  </g>
  <g id="spokes">
    <g id="pair">
      <g transform="rotate(-8 512 512)">
        <path d="M 494 214 L 530 214 L 524 476 L 486 476 Z" fill="url(#chromeDark)" stroke="#0a0e16" stroke-width="3.5"/>
        <path d="M 501 220 L 519 220 L 515 468 L 495 468 Z" fill="url(#chromeU)"/>
        <path d="M 503 224 L 505 464" stroke="#ffffff" stroke-width="4" opacity="0.6" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="rotate(8 512 512)">
        <path d="M 494 214 L 530 214 L 524 476 L 486 476 Z" fill="url(#chromeDark)" stroke="#0a0e16" stroke-width="3.5"/>
        <path d="M 501 220 L 519 220 L 515 468 L 495 468 Z" fill="url(#chromeU)"/>
        <path d="M 503 224 L 505 464" stroke="#ffffff" stroke-width="4" opacity="0.6" fill="none" stroke-linecap="round"/>
      </g>
    </g>
    <use href="#pair" transform="rotate(72 512 512)"/>
    <use href="#pair" transform="rotate(144 512 512)"/>
    <use href="#pair" transform="rotate(216 512 512)"/>
    <use href="#pair" transform="rotate(288 512 512)"/>
  </g>
  <circle cx="512" cy="512" r="132" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <circle cx="512" cy="512" r="98" fill="url(#barrel)"/>
  <circle cx="512" cy="512" r="98" fill="none" stroke="url(#gold)" stroke-width="7"/>
  <g id="hubBolts">
    <g id="hbolt">
      <circle cx="512" cy="402" r="12" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="2"/>
      <circle cx="508" cy="398" r="4" fill="#ffffff" opacity="0.9"/>
    </g>
    <use href="#hbolt" transform="rotate(72 512 512)"/>
    <use href="#hbolt" transform="rotate(144 512 512)"/>
    <use href="#hbolt" transform="rotate(216 512 512)"/>
    <use href="#hbolt" transform="rotate(288 512 512)"/>
  </g>
  <circle cx="512" cy="512" r="48" fill="none" stroke="#00ffff" stroke-width="10" opacity="0.25"/>
  <circle cx="512" cy="512" r="48" fill="none" stroke="#5cffff" stroke-width="4" opacity="0.9"/>
  <circle cx="512" cy="512" r="32" fill="url(#gold)" stroke="#0a0e16" stroke-width="3"/>
  <circle cx="506" cy="504" r="9" fill="#ffffff" opacity="0.75"/>
  <ellipse cx="392" cy="330" rx="210" ry="86" fill="#ffffff" opacity="0.06" transform="rotate(-33 392 330)"/>
</svg>
--- END design-system/masters/H1_master_v2.svg ---

--- BEGIN design-system/masters/H2_master_v2.svg ---
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4de3ff" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#b400ff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#b400ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="chromeU" x1="150" y1="150" x2="880" y2="880" gradientUnits="userSpaceOnUse">
      <stop offset="0%"  stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#c8daea"/>
      <stop offset="40%" stop-color="#6d8098"/>
      <stop offset="52%" stop-color="#2e3a4c"/>
      <stop offset="66%" stop-color="#7d92aa"/>
      <stop offset="85%" stop-color="#e9f5ff"/>
      <stop offset="100%" stop-color="#8ea3ba"/>
    </linearGradient>
    <radialGradient id="face" cx="42%" cy="36%" r="80%">
      <stop offset="0%" stop-color="#1d2536"/>
      <stop offset="55%" stop-color="#0e1424"/>
      <stop offset="100%" stop-color="#070a12"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0a0"/>
      <stop offset="45%" stop-color="#e0ac1c"/>
      <stop offset="100%" stop-color="#7d5a06"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="492" fill="url(#bgGlow)"/>
  <circle cx="512" cy="512" r="418" fill="none" stroke="#ff00ff" stroke-width="38" opacity="0.13"/>
  <circle cx="512" cy="512" r="418" fill="none" stroke="#ff00ff" stroke-width="18" opacity="0.32"/>
  <circle cx="512" cy="512" r="418" fill="none" stroke="#ff2bd6" stroke-width="8" opacity="0.9"/>
  <circle cx="512" cy="512" r="418" fill="none" stroke="#ffd2f4" stroke-width="3"/>
  <circle cx="512" cy="512" r="380" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="5"/>
  <path d="M 212 336 A 352 352 0 0 1 502 162" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.5" stroke-linecap="round"/>
  <g id="bezelBolts">
    <g id="bb"><circle cx="512" cy="164" r="13" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="2.5"/><circle cx="508" cy="160" r="4.5" fill="#ffffff" opacity="0.9"/></g>
    <use href="#bb" transform="rotate(60 512 512)"/>
    <use href="#bb" transform="rotate(120 512 512)"/>
    <use href="#bb" transform="rotate(180 512 512)"/>
    <use href="#bb" transform="rotate(240 512 512)"/>
    <use href="#bb" transform="rotate(300 512 512)"/>
  </g>
  <circle cx="512" cy="512" r="318" fill="url(#face)" stroke="#0a0e16" stroke-width="6"/>
  <circle cx="512" cy="512" r="318" fill="none" stroke="url(#gold)" stroke-width="6"/>
  <g id="ticks" stroke="#bfe9ff" stroke-linecap="round">
    <g id="tickMaj"><line x1="512" y1="262" x2="512" y2="316" stroke-width="10"/></g>
    <use href="#tickMaj" transform="rotate(-135 512 512)"/>
    <use href="#tickMaj" transform="rotate(-90 512 512)"/>
    <use href="#tickMaj" transform="rotate(-45 512 512)"/>
    <use href="#tickMaj" transform="rotate(45 512 512)"/>
    <use href="#tickMaj" transform="rotate(90 512 512)"/>
    <g id="tickMin" stroke-width="5" opacity="0.7">
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-112 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-67 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(-22 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(22 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(67 512 512)"/>
      <line x1="512" y1="262" x2="512" y2="296" transform="rotate(112 512 512)"/>
    </g>
  </g>
  <g fill="none">
    <path d="M 682 288 A 286 286 0 0 1 794 480" stroke="#ff00ff" stroke-width="44" opacity="0.2"/>
    <path d="M 682 288 A 286 286 0 0 1 794 480" stroke="#ff2bd6" stroke-width="26" opacity="0.85"/>
    <path d="M 682 288 A 286 286 0 0 1 794 480" stroke="#ffd2f4" stroke-width="8" opacity="0.9"/>
  </g>
  <g transform="rotate(96 512 512)">
    <path d="M 512 512 L 496 540 L 512 236 L 528 540 Z" fill="#ff2bd6" stroke="#7a0d63" stroke-width="3"/>
    <path d="M 509 300 L 512 246 L 515 300 Z" fill="#ffd2f4"/>
  </g>
  <circle cx="512" cy="512" r="74" fill="url(#chromeU)" stroke="#0a0e16" stroke-width="4"/>
  <circle cx="512" cy="512" r="46" fill="url(#gold)" stroke="#0a0e16" stroke-width="3"/>
  <circle cx="504" cy="502" r="11" fill="#ffffff" opacity="0.8"/>
  <path d="M 300 340 A 280 280 0 0 1 640 262" fill="none" stroke="#ffffff" stroke-width="30" opacity="0.10" stroke-linecap="round"/>
  <ellipse cx="400" cy="350" rx="190" ry="80" fill="#ffffff" opacity="0.05" transform="rotate(-33 400 350)"/>
</svg>
--- END design-system/masters/H2_master_v2.svg ---
