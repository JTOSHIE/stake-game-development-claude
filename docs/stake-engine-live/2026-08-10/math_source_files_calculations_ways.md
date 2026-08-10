<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_calculations_ways
- resolved_url: https://stake-engine.com/docs/math/source-files/calculations/ways
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Source Files Calculations Ways - API Documentation
- chars: 1530
- sha256: 35913f8aae963abde0fe691fd9ce362d997fc1ac87268220daf1ec30e3618fd5
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Ways wins evaluation

The WaysWins object evaluates winning symbol combinations for the current self.board state. Generally 3 or more consecutive symbols result in a win, though these specific combination numbers and payouts can be defined in:

config.paytable = {(kind[int], symbol[string]): payout[float]}


The ways calculation will search for like-symbols (or Wilds) on consecutive reels. The maximum number of ways is determined from the board size: max_ways = (num_rows)^(num_columns). Note: the ways calculation does not account for Wild symbols appearing on the first reel.

The Ways evaluation takes also takes into account multiplier values attached to symbols containing the multiplier attribute. Unlike lines calculations where multiplier values are added together for symbols on consecutive reels, the total number of ways is instead multiplied by the multiplier value. Leading to the payout amount to grow substantially more quickly. So for example given the board:

L5 H1 L4 L4 L4 
L1 H4 L3 H2 L4 
H1 H1 H1 L3 H3 


If there is a multiplier value of, say 3x on the H1 symbol on reel 3, the total ways for symbol H1 is (3,H1) pays:

(1) * (2) * (3) = 6 ways


The return_data will include all winning symbol names, number of consecutive like-symbols, winning positions and total win amounts for each unique symbol type. the meta tag will additionally include the total number of ways a symbol wins, which will range from 1 to (num_rows)^(num_columns) and and additional symbol and/or global multiplier contributions.
