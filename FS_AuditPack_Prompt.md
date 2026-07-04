# FS AUDIT PACK: assemble the external-auditor submission package

READ FIRST: reports/SESSION_REPORT.md and its FOR THE NEXT SESSION block. Autonomy posture per CLAUDE.md (g). Hard locks unchanged; copying FILES OUT of locked paths is reading, not writing, and is permitted. Branch claude/audit-pack from up-to-date main.

## Task 1: Generate GAME_FACTS.md
A single authoritative facts sheet compiled from the repo (PAR sheet, dossier, compliance watch, session reports), containing: game identity (Future Spinner, We Roll Spinners, 5x4, 1,024 ways); verified mathematics (base and bonus RTP both exactly 96.3500 percent, base hit rate 29.11 percent, standard deviation 17.28x, natural trigger 1 in 184.7, bonus buy 100x with 96.35x average return, hard cap 5,000x with zero rounds over cap in both books, the tail-risk gate numbers); feature rules (scatter awards, meter behaviour, retrigger); technology summary (Svelte plus PixiJS frontend, deterministic vector asset pipeline, static graded backgrounds, three speed tiers); compliance summary (16 locales, social mode, replay, disclaimer, responsive viewports, fps gate results). Every number sourced from a repo document, none invented.

## Task 2: Assemble the pack
Create ~/Desktop/FS_AuditPack/ containing: GAME_FACTS.md; INDEX.md manifesting every file with one-line descriptions; copies of SUBMISSION_DOSSIER.md, COMPLIANCE_WATCH.md, HANDOVER.md, design-system/DESIGN_SYSTEM.md, design-system/LAYOUT_SPEC.md, the PAR sheet copied out of games/future_spinner, and the latest three reports/archive entries; a media/ folder with the best evidence set: the base and bonus layout screenshots, the v3.3 clean shot, the buy modal shot, the paytable shot, and all four proof GIFs from the motion and elevate passes; and AUDITOR_PROMPT.md containing verbatim the auditor prompt text that is committed alongside this brief in the session report appendix (the owner will paste its text plus this pack into external AIs). Zip the folder to ~/Desktop/FS_AuditPack.zip and report the final size.

## Task 3: Ship
Session report including the auditor prompt text as an appendix and the FOR THE NEXT SESSION block, archive, commit explicit paths (the pack itself stays on the Desktop, only the brief and reports are committed), push, PR into main via gh titled "Audit pack assembly" with the report as description.
