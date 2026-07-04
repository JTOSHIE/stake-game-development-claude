<!-- Stake Engine live docs snapshot -->
- topic: game-replay-requirements
- requested_url: https://stake-engine.com/docs/approval-guidelines/game-replay-requirements
- resolved_url: https://stake-engine.com/docs/approval-guidelines/game-replay-requirements
- fetched: 2026-07-04
- rendered_via: headless Chrome (Playwright)
- content_sha256: 789dcfd5ff7bc592582440aae2e098156026bb88f40b2ec75224ad1cb3afa536
- content_chars: 5037
- looks_real: true

# game-replay-requirements

Bet Replay
Overview

Bet Replay is a standard iGaming feature that allows players to view and share the outcome of a round after it has completed. Games must accept a set of query parameters that place the game into replay mode, loading a specific round based on its mode and event ID, along with parameters to configure currency, language, social mode, and bet sizing.

This feature is essential for transparency, player engagement, and support operations.

Approval Requirements

Bet Replay is now a mandatory requirement for all games seeking approval.

New Games

All new games must support Bet Replay. During the game review process, we will:

Test the replay functionality
Request a range of event IDs to validate different scenarios
Games without this feature will not be approved
Existing Games

We strongly encourage existing games to implement this feature as well.

Why Bet Replay?
Benefits for Game Developers
Benefit	Description
Faster Development	Provides a useful interface for front-end development
Better Quality	Test specific scenarios and edge cases
Easier Debugging	Replay rare events that only occur occasionally (e.g., max win screen)
Fewer Bugs	Catch issues before they reach production
Benefits for Operators
Benefit	Description
Bet Queries	Support team can quickly view specific rounds to investigate player issues
Dispute Resolution	See the result exactly as the player did
Bug Investigation	If an event crashes devices, the replay will crash the same way for troubleshooting
Audit Trail	Verify that game rules were followed correctly
Benefits for Players
Benefit	Description
Transparency	Players can verify their results
Social Sharing	Share big wins on social media
Re-watch Wins	Relive exciting moments
Important Notice

PLAYER SESSION IS NOT REQUIRED FOR VIEWING BET REPLAY!

Players can view Bet Replay without an active session or authorization. This means replay URLs can be shared publicly (e.g., on social media, in chat, etc.).

Frontend Integration
1. Query Parameters

Your game will receive the following query parameters when loaded in replay mode:

Parameter	Required	Description
replay	Yes	Always true when in replay mode
game	Yes	Game ID
version	Yes	Math version of the game (e.g., 1, 2)
mode	Yes	Bet mode
event	Yes	Unique simulation ID to replay
rgs_url	Yes	RGS server URL to fetch replay data from
currency	No	Currency code
amount	No	Bet amount in units
lang	No	Language code
device	No	Device type
social	No	Social mode (true/false)
2. Fetching Replay Data (RGS Endpoint)

After parsing the query parameters, your game must fetch the replay state from the RGS server.

Endpoint
GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}

Example Request
GET https://rgs.stake-engine.com/bet/replay/01996148-eecf-7678-be46-41de88c58951/1/SUPER/55

Response Schema
{
  "payoutMultiplier": 25.0,
  "costMultiplier": 1.0,
  "state": { }
}

Field	Type	Description
payoutMultiplier	float	Multiplier for calculating total payout
costMultiplier	float	Multiplier for calculating bet cost
state	object	Game-specific state for replay animation
Expected User Experience

When loading the game in replay mode, follow these UX guidelines:

Loading Phase
Auto-load without interaction — The game should load the event data automatically
Display “Play” button — Once loaded, show a play button to prompt the user to start the replay
During Replay
Play the round as normal — Show all animations, sounds, and visual effects
Display results — Show the final outcome exactly as the player saw it
No betting allowed — All bet controls must be disabled or hidden
After Replay
Show “Play Again” button — Allow users to restart and watch the replay again
Display final results — Keep the win amount and outcome visible
UI Simplification

We recommend implementing a slimmed-down UI for replay mode:

Hide/Remove	Keep/Show
Balance display	Win amount
Play buttons	Replay controls
Bet amount selector	Replay bet amount
Autoplay settings	Currency display
Implementation Checklist

Your game must handle the following in replay mode:

 Detect replay mode — Check for replay=true query param
 Fetch replay data — Call the RGS endpoint with correct parameters
 Show loading state — Display a loader while fetching
 Display “Play” button — Prompt the user to start the replay
 Disable betting UI — Hide or disable all bet controls
 Disable session calls — Do not make any authenticated API calls
 Play full animation — Show all animations, sounds, and results
 Show results — Display bet cost, payout, and win amount
 Add “Play Again” button — Allow rewatching the replay
 Handle errors — Show an appropriate message if replay data fails to load
 Prevent session transition — No way to start normal play from replay
Testing & Review

During game review, you may be asked to provide event IDs for different scenarios for every bet mode:

Normal win
Big win
Win cap (max win)
Loss (zero payout)
Bonus round trigger (if applicable)

Make sure to test edge cases like max wins and rare bonus features before submitting for review.
