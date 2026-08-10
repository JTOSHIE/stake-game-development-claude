<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: math_game_state_structure
- resolved_url: https://stake-engine.com/docs/math/game-state-structure
- fetched: 2026-08-10
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText.
  Transport note for this pass: page requests were carried by node (undici
  ProxyAgent) through the run environment agent proxy, because chromium
  cannot speak to it directly; the rendered DOM and the origin are unchanged.
  The nav sidebar is chrome and is EXCLUDED, as in every prior pass.
- page_title: Math Game State Structure Simulation Acceptance - API Documentation
- chars: 3521
- sha256: 075999fbc076983108e1531b0e56d87ff4ff84350c6faa63ba222f59970515b5
- render_state: rendered
- capture_note: body below is a VERBATIM upstream capture, quoted never paraphrased
  per convention (l.7).

Simulation Acceptance Criteria

When setting up the game configuration file each mode is split into different win-criteria. Given a total number of simulations for a given bet-mode, the number of simulations required for each criteria is set using a quota, which determines the ratio of the total number of simulations satisfying a particular win criteria.

Following the example used in the Sample Games, the win criteria has been split into the following unique conditions:

0 win amounts
basegame wins
freegame scenarios
max-win scenarios

The purpose of segmenting these game outcomes is to ensure that there are sufficiently many simulations scenarios satisfying a certain criteria. For example if the hit-rate for a max-win is 1% of the available RTP for a game with a 5000x payout would be 1 in 500,000 outcomes. Though if we are only producing 1 Million simulations in total for this mode, we would like to have more than 2 simulations in total which result in the maximum win amount. This reduces the possibility of any players seeing the same outcomes for a specific win amount.

In the aforementioned list 0 dictates that the payout multiplier is ==0 for that simulation number. basegame is essentially any basegame spin where the payout is >0 and the freegame is not triggered. freegame is any scenario where the freegame is triggered from the basegame. max-win is any outcome where the maximum payout multiplier is awarded.

This segmentation of wins is also used by the optimization algorithm.

Pertinent to this section though, the simulation acceptance criteria is integral to the repeat condition implemented in all sample games. When the GameState is setup, the acceptance criteria is assigned to a specific simulation number before any simulations are carried out. So simulation 10, for example, is predetermined to be a simulation which triggers a freegame.

When the run_spin() function is called and the game-round ends, whether or not the simulation is recorded and added to the state overview is partially determined by the final win condition. If the only condition is that the simulation must be a 0 payout, then the final_win value is checked. If this condition is satisfied the self.repeat = False and the outcome is saved. Likewise if a particular simulation is determined to be freegame criteria, at the end of the spin we verify if the freegame has been triggered and accept the simulation result if so. There can be as many conditions are required in the self.check_repeat() function. Just be aware that the more stringent the criteria, the longer a simulation will likely take to run. This time can be quite substantial if the required criteria is unlikely to be achieved naturally. For the max-win scenarios for example, generally a specifically made reelstrip is used, and the probability if achieving higher multipliers, prizes etc.. is dictated in the bet-mode distribution.

Predetermining Acceptance

While it would be useful to run the simulations first and then assign the distribution criteria afterwards, this can cause issues when multi-threading larger simulation batches. Simulations relating to max-wins for example typically take substantially longer to succeed than say 0 win simulations. This means that all criteria except the max-win are likely to be filled first, leaving the final thread to deal with many or all of the max-win simulations. For this reason, the quota in the BetMode distribution conditions is used in conjunction with the total number of simulations.
