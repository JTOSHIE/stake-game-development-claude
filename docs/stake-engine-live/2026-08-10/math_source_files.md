<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_source_files
- resolved_url: https://stake-engine.com/docs/math/source-files
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Source Files Config - API Documentation
- chars: 508
- sha256: b96f772fe351e9223d5a9e8fca376349e0dd5eb8582ea68915e9a945495e9bca
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Config class object

The game-specific configuration GameConfig inherits the Config super class. This contains all game specifications, many of which will be set manually for each new game within GameConfig. Config allows for setting custom win_levels, which are returned during win-events and can indicate the type of animation which needs to be played. Additionally the class sets up several path destinations used for writing files and functions to read in and verify reelstrips stored in the .csv format.
