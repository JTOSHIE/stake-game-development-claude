FS_ChatCloseout_Prompt.md. Save this brief verbatim and commit it with this session per convention.

On branch claude/chat-closeout from up-to-date main: create docs/CHAT_CLOSEOUT_2026-07-06.md containing EXACTLY the content between the BEGIN and END markers, write the session report plus archive per convention, commit explicit paths, push, and open a PR into main via gh titled "Chat closeout: full snapshot of undocumented decisions and parked work" with the session report as description.

--- BEGIN docs/CHAT_CLOSEOUT_2026-07-06.md ---
# CHAT CLOSEOUT SNAPSHOT (2026-07-06)
The strategist chat that ran this project from compliance foundation through the graphics
overhaul is retired for token economics. This document captures everything that lived only
in that chat: decisions, parked work, open eye-calls and queued items, so nothing is lost.
Reconcile against HANDOVER_2026-07-06_Fable.md (PR 38), which covers the recent build arc.

## 1. FABLE'S RATIFIED VERDICTS (the consolidated review, canonical record)
- D1 to D6 locks ratified as implemented: OVERBOOST at 1.25x, Cruise ships, ladder is
  100x standard plus 400x super with no mini buy, no second interacting mechanic for
  Future Spinner, 5,000x cap kept, 96.3500 percent parity across every mode.
- Super Buy maths reasoning HOLDS (stateless per-mode meter init, tail 3.2e-3 under the
  1e-2 gate). Ship name: NITRO OVERDRIVE. Fable independently recomputes the FeatureMath
  v2 output in the locked package when it lands.
- The 11-mode library never enters the shipping package; it stays reference on
  claude/gap-analysis.
- HARD SUBMISSION RULE: COMING SOON placeholder modes must never be visible in a
  submitted build; FeatureMath v2 ships first so all five modes are live.
- LUMEN: greenlit as title two, work begins only after Future Spinner submits.
- Animation Path A is the launch ceiling; Path B (rigged symbols) is post-launch.
- Per-symbol bespoke win animations: briefed to the designer, built on Path A using the
  layered and flipbook exports; seed the brief with the per-symbol motion table in the
  Reel Feel v3 session report.
- Logo vector rebuild: FABLE'S LANE (art master evolving the committed brand_mark, real
  game symbols not 777s, favicon-scale test). Queued as a Fable art turn.
- build-original-slot skill additions requested: submission and compliance checklist as
  steps, validate_math gate, proof-media and FOR THE NEXT SESSION conventions, the
  surgical per-mode workflow, and the art laws (silhouette first, signature colour
  identity, tile plates) as templates.

## 2. QUEUED ITEMS NOT IN PR 38
- GAME TILE artwork (the Stake storefront tile per their tile guidelines): a Fable art
  turn, racer plus hover car plus logo composed to spec. Required for the portal upload.
- Blurb final approval: PROMO_BLURB.md restores its soundtrack sentence once audio ships,
  then the owner approves the final text.
- External audit refresh: re-run the FS_AuditPack plus auditor prompt through external
  AIs after audio and FeatureMath v2, before submission.
- The single surviving 150ms cold frame from the Reel Feel v3 gate: attribute via a
  timestamped harness run in the compliance session; fix only if trivially attributable.
- Live RGS endpoint test and the dossier section 5 protocol walkthrough: post-deploy,
  Fable walks the owner through it on submission day.
- Trademark comfort check on We Roll Spinners, Future Spinner, OVERBOOST and NITRO
  OVERDRIVE (owner action, basic search suffices at this scale).
- Portal one-timers (owner): team profile, payment details, provider logo upload (the
  brand_mark 512 export), public high-res asset folder link.
- OPEN OWNER EYE-CALLS never given: strip versus drop reel mode (strip is the shipping
  default; the drop toggle exists dev-side), and the Overdrive flame-jet scale (0.55) and
  flame orientation. Confirm at the next check-in whether these are still live questions
  after the graphics overhaul, then close them.

## 3. AUDIO PLAN (owner-gated, the loudest creative blocker)
Delivery: files into ~/Desktop/fs_audio/ then the integration pass per the Elevate 2
handover spec (webm opus ~128k plus m4a fallback, sound-toggle persistence, rain stem at
low gain, ducking under BIG-plus stingers). SFX map to source from CC0 libraries
(Pixabay, freesound): spin whoosh, per-reel stop thuds, tiered win stingers, gauge slam,
jet ignition, buy stinger, UI clicks. The approved generation prompt for Suno or Udio:
"Instrumental only, no vocals. Dark cyberpunk synthwave for a futuristic street racing
slot game. Heavy analog bass, driving 100 BPM techno pulse, neon arpeggios, distant
thunder and soft rain ambience underneath, occasional turbo whoosh accents. Loopable, no
intro or outro, consistent energy, 2 minutes. Mood: rain-slicked neon city at night,
confident, hypnotic, not aggressive." Request a seamless loop and a separate rain-only
stem if stems are offered.

## 4. PARKED CREATIVE INVENTORY (concepts approved as parked, chat-delivered only)
The rendered files were delivered as chat downloads to the owner; the repo holds the
shipped masters only. Everything below is regenerable from these specs.
- STYLE SET 2, NEON WIREFRAME: all ten symbols as glowing signature-colour line art on
  dark circuit tiles. PARKED as the SIMULATION MODE skin concept: during the NITRO
  OVERDRIVE super buy, symbols glitch to wireframe while the racer becomes the hologram.
- STYLE SET 3, CYBER POP: the ten symbols cel-shaded, thick black outlines, flat fills,
  hard gleams. PARKED as a possible future arcade skin.
- HOLOGRAM RACER: cyan projection of the pilot, scanlines, alpha flicker, glitch slices,
  rising from an emitter pool. APPROVED for the super buy activation state.
- CHARACTER CONCEPTS 2 AND 3: the chrome Pilot Bot and the cel Street Racer. PARKED
  (candidate mascots for future titles).
- ANIMATION LANGUAGE SETS: Set A Living Machine (mechanical idles) and Set B Charge and
  Burst (energy states) were absorbed into Reel Feel v3 as the shipped idle and charge
  languages; the exploration GIFs were chat-delivered.

## 5. TOOLS POSTURE (decided, for the record)
- stakecli (mnemoo/cli): ADOPTED for submission uploads only; pinned release or built
  from source; session cookie in the keychain only, never repo or CI.
- mnemoo/tools (Event Finder): NOT adopted; REVIEW_EVENTS generated natively from our
  books with full provenance.
- simnJS/stake-dev-tool: evaluate-only; at most one smoke test of the final bundle.
- Launch-week bookmarks: stakecruncher.com/slots-tracker (live Engine market data) and
  stakestats.net (stats and verification index).

## 6. MODEL ECONOMICS (measured, for planning)
Opus 4.8 High: about 20 percent of a five-hour window per focused half-hour session;
xhigh roughly triples cost. Sonnet Medium: 2 to 4 percent per session. Sonnet High:
about 10 percent per long build. Escalation rule: a brief failing its gates twice on
Sonnet re-runs on Opus. Fable check-ins run in fresh conversations only, two-read
budget, per the pinned OPERATING CADENCE.
--- END docs/CHAT_CLOSEOUT_2026-07-06.md ---
