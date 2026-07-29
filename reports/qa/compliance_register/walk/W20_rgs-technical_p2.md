# W20: walk 13 requirements on the rgs-technical surface (part 2 of 2)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-120 | ARTEFACT | YES | `rgs.md:144` | Format displayed balances with the platform's per-currency symbol, decimal count and symbol placement (the CurrencyMeta table at rgs.md:204 to 257), falling back to code-after-amount for unknown codes. Normative force is weaker than the other rows here: the page offers the functions as help rather than mandating them, and the obligation is the display format they produce. |
| REQ-121 | ARTEFACT | YES | `rgs.md:288` | Clamp every wager the game can submit to the authenticated minBet and maxBet, not to a hardcoded ladder. |
| REQ-122 | ARTEFACT | YES | `rgs.md:289` | Every submittable bet is an exact integer multiple of the authenticated stepBet. |
| REQ-123 | ARTEFACT | YES | `rgs.md:291` | Drive the player-facing bet ladder from the betLevels array in the authenticate response. |
| REQ-124 | ARTEFACT | YES | `rgs.md:295` | Offer bet levels starting at $0.01, $0.02, $0.05 and $0.10 rather than a $0.10 floor. |
| REQ-125 | ARTEFACT | YES | `rgs.md:295` | Determine the game's minimum win multiplier and render win amounts with 3 decimal places if it is >= 0.1x, 4 if it is below. |
| REQ-126 | ARTEFACT | YES | `rgs.md:297` | Show the extra decimal places only while the base bet is under $0.10; above that, use normal currency precision. |
| REQ-127 | ARTEFACT | YES | `rgs.md:297` | In-game win readouts must show the exact win amount with no rounding; the balance readout may stay at 2 decimal places. |
| REQ-128 | ARTEFACT | YES | `rgs.md:319 and rgs.md:321` | Compute and present the cost of a play as base bet times the selected bet mode's cost multiplier, and expect the wallet to debit that amount. |
| REQ-129 | ARTEFACT | NO | `rgs_wallet.md:81-85` | The play request body carries amount (integer micros), sessionID and mode, so the selected bet mode must reach the RGS on every play. Note the page gives an explicit POST path for authenticate, balance, end-round and /bet/event but none for play. |
| REQ-130 | ARTEFACT | YES | `rgs_example.md:33` | A winning round is not paid until the frontend itself calls /end-round; the game must call it rather than assume the RGS settles automatically. |
| REQ-131 | ARTEFACT | YES | `rgs_example.md:57` | A Vite-built frontend must set base to "./" so the bundle resolves its assets relative to the hosted game path. |
| REQ-176 | PROCESS | NO | `rgs_example.md:68` | At submission, upload the contents of dist/ (not the folder itself) into the platform's frontend files slot. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-120

- source: `rgs.md:144`
- platform text, verbatim: "Here are some functions that will help you achieve the display format for the currencies."
- what it requires: Format displayed balances with the platform's per-currency symbol, decimal count and symbol placement (the CurrencyMeta table at rgs.md:204 to 257), falling back to code-after-amount for unknown codes. Normative force is weaker than the other rows here: the page offers the functions as help rather than mandating them, and the obligation is the display format they produce.

### REQ-121

- source: `rgs.md:288`
- platform text, verbatim: "The bet must fall between minBet and maxBet (returned from /wallet/authenticate)." (lead-in on rgs.md:286 reads "Although bet levels are not mandatory, bets must satisfy these conditions:")
- what it requires: Clamp every wager the game can submit to the authenticated minBet and maxBet, not to a hardcoded ladder.

### REQ-122

- source: `rgs.md:289`
- platform text, verbatim: "The bet must be divisible by stepBet."
- what it requires: Every submittable bet is an exact integer multiple of the authenticated stepBet.

### REQ-123

- source: `rgs.md:291`
- platform text, verbatim: "It is recommended to use the predefined betLevels to guide players."
- what it requires: Drive the player-facing bet ladder from the betLevels array in the authenticate response.

### REQ-124

- source: `rgs.md:295`
- platform text, verbatim: "New game submissions should incorporate small denomination bets, which are not yet industry standard, these are levels (in USD): [$0.01, $0.02, $0.05, $0.10, ....]."
- what it requires: Offer bet levels starting at $0.01, $0.02, $0.05 and $0.10 rather than a $0.10 floor.

### REQ-125

- source: `rgs.md:295`
- platform text, verbatim: "If the game has a minimum win of >= 0.1x, three points of precision are required: 0.1x * $0.01 = $0.001, while games with minimum wins <0.1x will require 4 points of precision."
- what it requires: Determine the game's minimum win multiplier and render win amounts with 3 decimal places if it is >= 0.1x, 4 if it is below.

### REQ-126

- source: `rgs.md:297`
- platform text, verbatim: "How these win values are displayed is at the discrecion of the publisher, though it is reccomonded that the extra precions is only displayed with the base bet-size is <$0.10."
- what it requires: Show the extra decimal places only while the base bet is under $0.10; above that, use normal currency precision.

### REQ-127

- source: `rgs.md:297`
- platform text, verbatim: "The ‘balance’ value displaying the players bankroll does not need to display more than 2 points of precision at any time, and it is only a requirement that wins in-game show exact win amounts."
- what it requires: In-game win readouts must show the exact win amount with no rounding; the balance readout may stay at 2 decimal places.

### REQ-128

- source: `rgs.md:319 and rgs.md:321`
- platform text, verbatim: "When making a play request: Player debit amount = Base bet amount × Bet mode cost multiplier" (joined from two source lines with a single space)
- what it requires: Compute and present the cost of a play as base bet times the selected bet mode's cost multiplier, and expect the wallet to debit that amount.

### REQ-129

- source: `rgs_wallet.md:81-85`
- platform text, verbatim: "{ "amount": 100000, "sessionID": "xxxxxxx", "mode": "BASE" }" (joined from the request JSON block, one space per line break)
- what it requires: The play request body carries amount (integer micros), sessionID and mode, so the selected bet mode must reach the RGS on every play. Note the page gives an explicit POST path for authenticate, balance, end-round and /bet/event but none for play.

### REQ-130

- source: `rgs_example.md:33`
- platform text, verbatim: "If your win is greater than 0, you’ll need to manually call the /end-round API to finalize the bet—just like in a custom frontend implementation."
- what it requires: A winning round is not paid until the frontend itself calls /end-round; the game must call it rather than assume the RGS settles automatically.

### REQ-131

- source: `rgs_example.md:57`
- platform text, verbatim: "Edit the vite.config.ts file: Make sure the defineConfig function includes: base: "./" (under plugins),"
- what it requires: A Vite-built frontend must set base to "./" so the bundle resolves its assets relative to the hosted game path.

### REQ-176

- source: `rgs_example.md:68`
- platform text, verbatim: "Upload the contents of the dist/ folder to the Stake Engine under frontend files"
- what it requires: At submission, upload the contents of dist/ (not the folder itself) into the platform's frontend files slot.

