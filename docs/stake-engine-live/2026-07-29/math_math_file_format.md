<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_math_file_format
- resolved_url: https://stake-engine.com/docs/math/math-file-format
- fetched: 2026-07-29
- rendered_via: headless chromium (Playwright 1.61.1), document.querySelector('main').innerText.
  A plain fetch returns only "Loading...", because the docs site is client rendered.
  The nav sidebar is chrome and is EXCLUDED: capturing document.body added about 1020
  chars of navigation to every page and would have read as a platform-wide change.
- page_title: Math Math File Format - API Documentation
- chars: 3113
- sha256: 87ceb156d31869af8d4d577396b8b5d3dd9ee7247db94187a18a33f396499a55
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Math verification

When uploading static math files to the RGS, Stake Engine will carry out preliminary checks to ensure ensure game-logic is of the expected format. The corresponding payout multipliers and probabilities are analyzed as a means of providing a quick summary of game statistics on the backend.

Minimum file requirements

For a game with one game-mode, there will be 3 files required for the Math to be published successfully.

Index file (must be called *index.json and contain the mode name, cost multiplier and logic/CSV filenames)
Lookup table (CSV file, with each line containing ID, Probability, Payout)
Game logic (zStandard compressed JSON-lines (__.jsonl.zst))
Index file format

When selecting a directory to upload from for the Stake Engine math there must exist a JSON-encoded file called index.json with the strictly enforced form:

{
    "modes": [
        {
            "name": <string>,
            "cost": <float>,
            "events": <string>"<logic_file>.jsonl.zst",
            "weights": <string>"<lookup_table>.csv"
        },
        ...
    ]
}


For example, for a game with 2-modes:

{
    "modes": [
        {
            "name": "base",
            "cost": 1.0,
            "events": "books_base.jsonl.zst",
            "weights": "lookUpTable_base_0.csv"
        },
        {
            "name": "bonus",
            "cost": 100.0,
            "events": "books_bonus.jsonl.zst",
            "weights": "lookUpTable_bonus_0.csv"
        }
    ]
}

CSV format

When calculating various statistical values on the RGS side, it is much more efficient and robust to work with unsigned integer values (since no payouts or probabilities will ever be negative). This avoids misinterpreting values due to rounding or floating-point errors. For every game-round uploded within the game-logic there must a summary CSV table containing rows of uint64 values. We require the payoutMuliplier value in the third column to exactly match those provided in the game-logic file. There values are extracted and hashed to ensure identical payoutMultiplier values.

    simulation number, round probability, payout multiplier


For example:

1,199895486317,0
2,25668581149,20
3,126752606,140
...

Game logic format

Round information returned through the /play API corresponds to a single simulation outcome returned in JSON format. For efficiency, we require this data to be stored in compressed .jsonl format. Currently zStandard (.zst) encoding must be used, though this will be expanded upon in the near future. In order to identify simulation IDs, payouts and logic we enforce the condition that every simulation contains the key fields:

    "id": <int>,
    "events" <list<dict>>,
    "payoutMultiplier": <int>


For example, at a minimum the game round, printed to jsonl before compression will have the format:

{
    "id": 1, 
    "events": [{}, ...],
    "payoutMultiplier": 1150
}


Where the payoutMultiplier value corresponds to an 11.5x payout for a base game round (costing 1.0x). The three JSON key fields: id, events, payoutMultipler are required for every round returned.
