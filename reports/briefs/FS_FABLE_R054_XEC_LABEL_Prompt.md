FABLE BRIEF R054: EURO CASH DISPLAY LABEL (2026-08-13)
Owner report with screenshot: launching social with currency=XEC renders
SC as the currency label. Root cause on record: currencySymbolFor's XEC
stopgap pinned to SC at currency.test.ts:99. Ruling: social currency
display labels derive by the platform's own naming rule, a code matching
X followed by two letters strips the X (XGC to GC, XSC to SC, XEC to EC);
the never-show-the-raw-code property is retained for anything outside the
pattern. Flip the test at :99 to assert EC, add the three-way assertion
and a seeded unknown-code case per (p). No other behaviour changes; XEC's
social-mode engagement is already correct. One session, small, CI green
per rule 10, comms folded per (t), tracker row opened and closed in the
same pass. Rebuild so the owner can delta-sync dist and publish.
