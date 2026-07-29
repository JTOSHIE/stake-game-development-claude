# W17: walk 9 requirements on the rgs-comms-and-tile surface (part 2 of 3)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-109 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:54` | Some currencies are specified with NO minor units in the Example column (JPY ¥10, IDR Rp10, KRW ₩10, VND 10 ₫, CLP 10 CLP at lines 54, 60, 61, 66, 68), so the amount formatter's decimal count is per currency and not globally two. Single table row, upstream tabs rendered as single spaces. |
| REQ-110 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:99 and :100` | Two distinct currency codes, XSC and XEC, share one display token "SC" as a suffix with two decimals and a space before the token; the game must not derive the display token by assuming a one-to-one code-to-symbol mapping, and must not print the raw code. Two adjacent table rows quoted separately, upstream tabs rendered as single spaces. |
| REQ-162 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:18` | Every submission package includes the tile source assets; the platform composes the tile from them, so the submission is incomplete without them. |
| REQ-163 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:22 to :26` | Exactly three assets are required per tile: background, foreground and provider logo. Spans capture lines 22, 24, 25 and 26, joined with single spaces. |
| REQ-164 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:28` | Background plus foreground must total 3MB or less as a pair; the provider logo is not named in this cap. |
| REQ-165 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:31` | The background asset must depict the game's environment or setting, not a logo, a symbol sheet or a flat colour field. |
| REQ-166 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:32` | Background is delivered as a high resolution PNG or JPG; either is acceptable for this asset only. |
| REQ-167 | PROCESS | NO | `approval_guidelines_game_tile_requirements.md:33` | Name the background file `<GameTitle>-BG.<ext>`, game title first, `-BG` suffix, real extension. |
| REQ-168 | PROCESS | YES | `approval_guidelines_game_tile_requirements.md:35` | The foreground asset must be a single representative character or hero item, cut out from any scene. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-109

- source: `approval_guidelines_rgs_communication.md:54`
- platform text, verbatim: "Japanese Yen JPY ¥ ¥10"
- what it requires: Some currencies are specified with NO minor units in the Example column (JPY ¥10, IDR Rp10, KRW ₩10, VND 10 ₫, CLP 10 CLP at lines 54, 60, 61, 66, 68), so the amount formatter's decimal count is per currency and not globally two. Single table row, upstream tabs rendered as single spaces.

### REQ-110

- source: `approval_guidelines_rgs_communication.md:99 and :100`
- platform text, verbatim: "Stake Cash XSC SC 10.00 SC" "Stake Euro Cash XEC SC 10.00 SC"
- what it requires: Two distinct currency codes, XSC and XEC, share one display token "SC" as a suffix with two decimals and a space before the token; the game must not derive the display token by assuming a one-to-one code-to-symbol mapping, and must not print the raw code. Two adjacent table rows quoted separately, upstream tabs rendered as single spaces.

### REQ-162

- source: `approval_guidelines_game_tile_requirements.md:18`
- platform text, verbatim: "With each game submission, they must include the submission of visual assets to be used to create the game tile."
- what it requires: Every submission package includes the tile source assets; the platform composes the tile from them, so the submission is incomplete without them.

### REQ-163

- source: `approval_guidelines_game_tile_requirements.md:22 to :26`
- platform text, verbatim: "For the creation of each game tile, we require the following assets: Background image Foreground image Provider Logo"
- what it requires: Exactly three assets are required per tile: background, foreground and provider logo. Spans capture lines 22, 24, 25 and 26, joined with single spaces.

### REQ-164

- source: `approval_guidelines_game_tile_requirements.md:28`
- platform text, verbatim: "Please ensure that the background & foreground images don’t exceed more than 3MB combined."
- what it requires: Background plus foreground must total 3MB or less as a pair; the provider logo is not named in this cap.

### REQ-165

- source: `approval_guidelines_game_tile_requirements.md:31`
- platform text, verbatim: "An environmental background that shows the world of the game"
- what it requires: The background asset must depict the game's environment or setting, not a logo, a symbol sheet or a flat colour field.

### REQ-166

- source: `approval_guidelines_game_tile_requirements.md:32`
- platform text, verbatim: "File format: High resolution PNG or JPG file"
- what it requires: Background is delivered as a high resolution PNG or JPG; either is acceptable for this asset only.

### REQ-167

- source: `approval_guidelines_game_tile_requirements.md:33`
- platform text, verbatim: "Naming convention: GameTitle-BG.format (e.g., CrownConquest-BG.png or PixelCastle-BG.jpg)"
- what it requires: Name the background file `<GameTitle>-BG.<ext>`, game title first, `-BG` suffix, real extension.

### REQ-168

- source: `approval_guidelines_game_tile_requirements.md:35`
- platform text, verbatim: "A feature character or key item that represents the game"
- what it requires: The foreground asset must be a single representative character or hero item, cut out from any scene.

