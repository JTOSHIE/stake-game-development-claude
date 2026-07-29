# W18: walk 7 requirements on the rgs-comms-and-tile surface (part 3 of 3)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-169 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:36` | Foreground is delivered as a high resolution PNG with a genuine alpha channel; JPG is not permitted for this asset. |
| REQ-170 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:37` | Name the foreground file `<GameTitle>-FG.png`. |
| REQ-171 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:39` | Supply the studio's official provider logo, not the game logo or a wordmark variant. |
| REQ-172 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:40` | Provider logo is delivered as a high resolution PNG with a genuine alpha channel (same clause as R4-20 but stated for the logo asset). |
| REQ-173 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:41` | Name the logo file `<ProviderName>-Logo.png`, provider name first, `-Logo` suffix. |
| REQ-174 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:42` | The provider logo must stay readable when scaled down to tile size, so thin strokes and small type in the logo are a defect. |
| REQ-175 | PROCESS | UNKNOWN | `approval_guidelines_game_tile_requirements.md:16 to :43` | Tile pixel geometry is NOT stated anywhere in this capture: no pixel dimensions, no aspect ratio, no minimum resolution number, no safe area, no colour space. The only size-adjacent clauses are "High resolution" (lines 32, 36, 40) and the 3MB combined cap (line 28). Any specific tile geometry figure must come from another source, not from this page. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-169

- source: `approval_guidelines_game_tile_requirements.md:36`
- platform text, verbatim: "File format: High resolution PNG with a transparent background"
- what it requires: Foreground is delivered as a high resolution PNG with a genuine alpha channel; JPG is not permitted for this asset.

### REQ-170

- source: `approval_guidelines_game_tile_requirements.md:37`
- platform text, verbatim: "Naming convention: GameTitle-FG.png (e.g., CrownConquest-FG.png)"
- what it requires: Name the foreground file `<GameTitle>-FG.png`.

### REQ-171

- source: `approval_guidelines_game_tile_requirements.md:39`
- platform text, verbatim: "The official logo of the game provider or studio"
- what it requires: Supply the studio's official provider logo, not the game logo or a wordmark variant.

### REQ-172

- source: `approval_guidelines_game_tile_requirements.md:40`
- platform text, verbatim: "File format: High resolution PNG with a transparent background"
- what it requires: Provider logo is delivered as a high resolution PNG with a genuine alpha channel (same clause as R4-20 but stated for the logo asset).

### REQ-173

- source: `approval_guidelines_game_tile_requirements.md:41`
- platform text, verbatim: "Naming convention: ProviderName-Logo.png (e.g., ZuckGames-Logo.png)"
- what it requires: Name the logo file `<ProviderName>-Logo.png`, provider name first, `-Logo` suffix.

### REQ-174

- source: `approval_guidelines_game_tile_requirements.md:42`
- platform text, verbatim: "Should be clear and legible at small sizes"
- what it requires: The provider logo must stay readable when scaled down to tile size, so thin strokes and small type in the logo are a defect.

### REQ-175

- source: `approval_guidelines_game_tile_requirements.md:16 to :43`
- platform text, verbatim: UNKNOWN
- what it requires: Tile pixel geometry is NOT stated anywhere in this capture: no pixel dimensions, no aspect ratio, no minimum resolution number, no safe area, no colour space. The only size-adjacent clauses are "High resolution" (lines 32, 36, 40) and the 3MB combined cap (line 28). Any specific tile geometry figure must come from another source, not from this page.

