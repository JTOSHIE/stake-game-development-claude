<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files_calculations_tumble
- resolved_url: https://stake-engine.com/docs/math/source-files/calculations/tumble
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Source Files Calculations Tumble - API Documentation
- chars: 879
- sha256: d780ebc36024bc98b4d7c6f7fa88ce785171c3836ca1bafe9d2210cce68e13e7
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Tumbling boards

The Tumble class inherits Board and handles removing winning symbols from self.board and filling vacant positions with symbols which appear directly above winning positions using the properties reel_positions and reelstrip_id. Examples of applications surrounding tumbling (cascading) events can be found in the 0_0_cluster and 0_0_scatter sample games.

The win evaluation functions for the cluster and scatter win-types assign the property explode = True to winning symbol objects. A new board is select by scanning the current self.board object reel-by-reel and counting the number of symbols which satisfy sym.check_attribute("explode"). This same number of symbols is then appended, counting backwards from the initial self.reel_positions values. If padding symbols are used, the symbol stored in top_symbols will be used to fill the first vacated position.
