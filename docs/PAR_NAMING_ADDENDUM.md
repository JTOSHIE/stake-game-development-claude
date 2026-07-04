# PAR NAMING ADDENDUM

Maths symbol IDs are immutable and are the only symbol identity the game engine
and the PAR sheet use. Several symbols were given new cosmetic display names at
the art level (AssetForge v2 and the Opus-elevate passes). The maths IDs, reel
frequencies, paytable values and RTP are byte-identical to the hashed PAR
artefacts. No maths file was touched; `games/future_spinner/` is unchanged.

## Maths ID to display-name reconciliation

| Maths ID (immutable) | PAR sheet original name | Current shipped art name |
|----------------------|-------------------------|--------------------------|
| H1 | Spinning Rim | Spinning Rim (unchanged) |
| H2 | Turbocharger | Nitro Canister |
| M1 | Car Grille | Steering Wheel |
| M2 | Exhaust Pipe | Coilover |
| M3 | Steering Wheel | Plasma Booster |
| L1 | Lug Nut | Lug Nut (unchanged) |
| L2 | Spark Plug | Blade Fuse |
| L3 | Piston | Piston (unchanged) |

The reel frequency and paytable rows in `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`
are keyed by the maths ID (H1..L3, W, S). The art rename changes only the label a
player sees on the reel; it does not touch any frequency, multiplier, scatter or
wincap value. The PAR sheet's own symbol table (section with the reel-frequency
counts) shows the original names alongside each ID; this addendum maps them to the
current shipped names so a reviewer comparing the running game to the PAR sheet
sees no discrepancy.

## Integrity statement

Reel strips, per-way paytable multipliers, the scatter table (1x / 3x / 10x), the
5,000x wincap, and both-mode RTP (96.3500% at 4dp) are byte-identical to the
artefacts hashed in the SHA-256 manifest recorded in
`FUTURE_SPINNER_PAR_SHEET.md` section 9 (covering `index.json`,
`game_metadata.json`, both lookup tables and both compressed book files). To
verify, hash those files and compare against that manifest.

Note on scope: the audit-remediation brief that requested this addendum enumerated
H2, M1, M2 and M3. L2 (Spark Plug to Blade Fuse) is the same class of art-level
cosmetic rename and is included above so the reconciliation is exhaustive.
