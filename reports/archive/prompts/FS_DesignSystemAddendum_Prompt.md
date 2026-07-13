FS_DesignSystemAddendum_Prompt.md. Save this brief verbatim as FS_DesignSystemAddendum_Prompt.md and commit it with this session per convention.

On a new branch claude/design-system-addendum from up-to-date main: append the content between the markers below to design-system/DESIGN_SYSTEM.md (after the PENDING PASSES section), update the two pending-pass entries as noted, write reports/SESSION_REPORT.md plus archive copy, commit, push, and open a PR into main via gh titled "Design system addendum: hierarchy, anchor, backgrounds, brand, feel, QA" with the session report as description.

Also amend within the existing PENDING PASSES section: in entry 3 (Motion Polish v2) append "plus the reel feel requirements and Overdrive transition in the addendum"; in entry 4 (Build Diet v2) replace "background re encode to under 16 MB" with "background video removed from the build (static backgrounds ship instead), dist gate under 25 MB"; in entry 5 prepend "QA soak harness per the addendum, then".

--- BEGIN APPEND ---

## ADDENDUM (July 2026): OWNER-RATIFIED LAWS AND SCOPES

### Visual hierarchy by pay tier
Premium symbols carry the most elaborate rendering and the richest animation.
Low tier symbols keep the identical palette and materials with simpler forms.
Order of elaboration: Gauge and Wild and Scatter above all, then H, then M,
then L. The player's eye must learn the value ladder without the paytable.

### The Boost Gauge is the design anchor
The Overdrive meter in the bonus IS the gauge, large and central. The H2 reel
symbol is its miniature. Win presentation borrows its language: needles,
redlines, flares. Everything else flows outward from it with less intensity.

### Static environment backgrounds
Backgrounds are premium static images, one base scene and one feature-state
variant per skin, with only whisper-level engine ambience (slow brightness
breathing). No background video ships. Future Spinner's pair derives from the
retired video: base hero graded to palette with a seating vignette, Overdrive
variant pushed magenta and darkened. Rationale: focus stays on the reels,
loops cannot betray us, and reskins need one image not one video.

### Brand layer (enriched)
We Roll Spinners plays on "we ride spinners" (spinning rim culture; the Soul
Plane nod). The brand mark is a neon chrome rim whose inner spins
independently, derived from the H1 master's layers. The standard loading
screen for EVERY WRS game: the rim spinning as the loader, the WE ROLL
SPINNERS wordmark above, the game logo slot beneath. Brand voice is playful;
generic "Studios/Gaming/Labs" tonality is forbidden.

### Intro splash (new standard screen)
After load, before the game: a feature explainer card in system style
(Overdrive rules in one glance: 3/4/5 scatters award 8/12/16 free spins, every
winning spin adds +1x to a meter that never resets, retrigger +5, feature
available for 100x where permitted) with a Continue control. Localised across
all 16 locales with social overrides. Counts toward the review clarity
criterion.

### Overdrive transition (concept of record)
Trigger: scatters flare, screen dips, the gauge slams into centre frame with
the needle ripping into the redline, a speed-line burst, background swaps to
the Overdrive variant, frame neon shifts hue, BGM shifts layer. Exit: reverse
behind the total win presentation.

### Reel feel requirements (Motion Polish v2 scope)
Ticker-driven transforms only, 60 fps, motion blur during spin, per-reel
staggered stops with overshoot slam and impact audio, the final reel extends
and holds under anticipation when two scatters are live, screen shake on
feature trigger and on 50x and above wins, reduced-motion aware. Jitter is a
defect class, not a style.

### QA programme
A repo soak harness (headless) plays 1,000+ mock spins across the locale,
social and turbo matrix asserting: integer micros balance arithmetic exact,
presented totals equal book payouts exactly, zero console errors, memory flat,
frame rate above floor. Runs as its own pass before compliance re-validation
and is inherited by every future skin. The community stake dev tool is
evaluated as a local RGS emulator. Post-deploy testing follows
SUBMISSION_DOSSIER.md section 5.

--- END APPEND ---
