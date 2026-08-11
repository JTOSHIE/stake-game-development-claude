FABLE BRIEF R047: THE THREE MAJORS AND THE ROUND 4 TAIL (TR-125 to TR-130)
Verified against main bd1169c6. Owner paste is ratification. Judgement tier
(Opus or above). One session. Australian English, no em or en dashes. Save
and commit this brief verbatim. Product scope is display layer only; the
maths package and locked paths are untouched.
TASK 1 (TR-125). Every figure on the paytable routes through the locale
formatter: the 1,024 ways line renders per locale grouping (de 1.024, fi, fr
and ru 1 024, others per the ratified A2 conventions) and every pays value
renders its locale decimal form. Extend the component-figure scan to .svelte
templates (digits beside separators), seeded per (p). Frames of the de and
tr paytable into the evidence pack.
TASK 2 (TR-126). New key allModesLabel wired at FeatureMenu.svelte:526 as
{$tr('allModesLabel')} with the existing localised RTP beside it. Values en
then ar, de, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh:
All modes | جميع الأوضاع | Alle Modi | Todos los modos | Kaikki tilat | Tous les modes | सभी मोड | Semua mode | 全モード | 모든 모드 | Wszystkie tryby | Todos os modos | Все режимы | Tüm modlar | Tất cả chế độ | 所有模式
TASK 3 (TR-127). The feature entry pod's first paint reads the entered
mode's seeded pre-rev from fsModes (NITRO OVERDRIVE 5x) instead of the
pre-seed meter value, both locales, no other timing change. Proof asserts
pod-at-first-paint equals the fsModes pre-rev for every buy mode; frame the
NITRO entry pod showing 5x in en and de.
TASK 4 (TR-128). German register unifies to du across all player-facing
keys, per the prose precedent. Replace these three exactly:
errSessionUnavailable: Spiel nicht verfügbar. Deine Sitzung konnte nicht bestätigt werden. Bitte lade neu oder kontaktiere den Support.
errRoundIncomplete: Spiel nicht verfügbar. Deine letzte Runde konnte nicht abgeschlossen werden. Bitte lade neu oder kontaktiere den Support.
sessionExpired: Sitzung abgelaufen. Bitte starte das Spiel neu.
Then sweep the de block for any remaining Sie form in a player-facing key
and list every conversion in the session report.
TASK 5 (TR-129). Wire both autoplay proofs as CI browser legs under the
runner contract, and frame the autoplay surface (selection state and the
Start control) into the evidence pack.
TASK 6 (TR-130). Align the GAME_FACTS award-basis wording to the ruled
base-bet basis with the BOOKS_MANIFEST.md:102-105 citation; where the
sentence quotes the config's own specification language, keep the quote and
add the ruled player-facing basis beside it. Old and new quoted verbatim in
the session report.
TASK 7. Documentation: record in frontend/scripts/README.md that the
preview language parameter is lang (rgsService.ts:531), with the example
URL, so no future play-test instruction gets it wrong again.
TASK 8. r047_verify supersedes the r043 pins under the same design, covers
tasks 1 to 4, seeded failure proven; predecessor archived with a note.
CLOSE: comms folded per (t), session report set, tracker rows TR-125 to
TR-129 closed and TR-130 dispositioned, remote CI green per rule 10
including the two new autoplay legs, tree clean, preview refreshed.
DONE MEANS: frames present for tasks 1, 3 and 5; all gates and the enlarged
matrix green; every conversion and quote in the report; nothing outside the
named scope touched.
