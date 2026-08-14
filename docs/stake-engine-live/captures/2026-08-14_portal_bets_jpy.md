# Portal Bets ledger, JPY rendering, captured first-hand 2026-08-14 (R066 TASK 3)

Method: the logged-in pane's play modal on the game page (the owner restored
the login for this pass). One minimum spin placed on a JPY test session
(balance ¥1,000, bet ¥100, spin settled, balance ¥900), then the modal's
Bets sidebar read via the DOM, strings verbatim.

The settled bet row:

- TIME 21:04:42, MODE base, COST **¥100**, PAYOUT **¥0**, STATUS Settled
- Event ID 78956, Operator stake-engine, Currency JPY,
  Cost (USD) $0.63, Payout (USD) $0.00, Cost multiplier +1.00

DOM text extraction (every yen-bearing leaf node, deduplicated):
`"¥100"`, `"¥0"`, `"JPY"`.

**THE LEDGER RENDERS JPY WITH ZERO DECIMALS.** Per the R065 TASK 2 rule
(decimals by ledger agreement) and the R066 TASK 3 instruction, the JPY row
flips to zero decimals.

**Tension recorded per (n) rather than smoothed over**: the owner's Valkyrie
production capture of the same day (`2026-08-14_valkyrie_jpy.jpg`) shows
stake.com production rendering ¥100.00, two decimals, on Waylander's Forge.
The two first-party surfaces disagree with each other; the ruling names the
LEDGER as the authority for our decimals, so the ledger governs, and this
note is what a future session re-derives from if the platform reconciles
the two.
