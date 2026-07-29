# R1, approval-core: requirement register from the approval spine captures

Enumeration only. Every row below was opened and quoted from the named capture file. No
application source was read and no implementation judgement is offered here.

Pages read (all under `/Users/jt/math-sdk/docs/stake-engine-live/2026-07-29/`):
`approval_guidelines.md`, `approval_guidelines_submission_checklist.md`,
`approval_guidelines_general_disclaimer.md`, `approval_guidelines_jurisdiction_requirements.md`.

Two quoting conventions, declared once so no cell is silently reworded:

1. Some upstream sentences contain an em dash or a curly apostrophe. These are reproduced
   exactly inside the quote marks, as convention (l.7) requires.
2. For the prohibited-terms table in `approval_guidelines_jurisdiction_requirements.md`
   (lines 24 to 63) each captured row is two tab-separated cells. The `verbatim_quote` cell
   gives the two cell values as two adjacent double-quoted strings, restricted phrase first
   then replacement phrase, in the captured order. The tab itself is not reproduced. No
   character inside either string is altered.

| REQ | source_file:line | verbatim_quote | obligation_on | what_it_requires | player_visible |
| --- | --- | --- | --- | --- | --- |
| R1-01 | approval_guidelines.md:18 | "Approval requests will be actioned for a specific frontend and math version." | PROCESS | Name the exact frontend build and maths version in the approval request, and expect approval to bind to that pair only. | NO |
| R1-02 | approval_guidelines.md:18 | "Our team will inspect the game for functionality, clarity, communication, and technical performance. These factors determine the suitability of your game for publication." | ARTEFACT | The shipped game must be functional, clear, communicative of what is happening, and technically performant, because these are the stated inspection axes. | YES |
| R1-03 | approval_guidelines.md:20 | "Approval requests must be accompanied by a short blurb describing your game theme and mechanics for use in promotional material and the game description tag." | PROCESS | Write and submit a short theme-and-mechanics blurb alongside the approval request. | NO |
| R1-04 | approval_guidelines.md:23 | "Stake Engine games are strictly stateless: Each bet must be independent of previous outcomes." | MATHS | The maths package must produce each round independently, with no carry-over of outcome state between bets. | UNKNOWN |
| R1-05 | approval_guidelines.md:23 | "Games cannot include jackpots, gamble features, continuation, or early cashout options." | ARTEFACT | Ship no jackpot, no gamble/double-up, no continuation of a prior round, and no early cashout control. | YES |
| R1-06 | approval_guidelines.md:24 | "Team names, game titles, and assets must comply with intellectual property/copyright law. Infringement is grounds for rejection." | ARTEFACT | Every shipped asset and the game title must be clear of third-party IP; the team name carries the same obligation on the studio side. | YES |
| R1-07 | approval_guidelines.md:25 | "Games must be original designs. Pre-purchased or licensed games existing on other third-party websites will not be permitted." | STUDIO | Be able to show the game is an original design and is not a purchased or licensed title already live elsewhere. | NO |
| R1-08 | approval_guidelines.md:26 | "Game assets cannot include material with Stake™ branding or themes." | ARTEFACT | No Stake marks, logos or Stake-themed motifs anywhere in shipped art, audio or text. | YES |
| R1-09 | approval_guidelines.md:27 | "Approval is at the discretion of the reviewer. Games deemed offensive, explicit, in poor taste, or of insufficient quality may be rejected." | ARTEFACT | Content and finish must clear a subjective reviewer bar for taste and quality; there is no objective threshold to satisfy. | YES |
| R1-10 | approval_guidelines.md:28 | "Games that promote, encourage, or are likely to appeal to underage persons are not permitted. This includes artistic depictions of children or child-like characters in any gambling context." | ARTEFACT | No child or child-like characters and no art, theme or tone that would appeal to minors. | YES |
| R1-11 | approval_guidelines.md:29 | "Games will be automatically considered for publication on stake.us under the condition that they abide by strict language requirements (see Jurisdiction Requirements below)." | ARTEFACT | Meet the social language requirements, since stake.us consideration is automatic and conditional on them. | YES |
| R1-12 | approval_guidelines.md:32 | "Ensure that when submitting a review request, the game is finalized and ready for publication." | PROCESS | Submit only a finished build; work-in-progress submissions are out of order. | NO |
| R1-13 | approval_guidelines.md:34 | "Once a game has been approved for publication on Stake/Stake-US, only minor updates to address visual issues are permitted, unless otherwise requested by the Stake Engine team. Changes to the underlying math model, the addition of new game modes, or modifications to gameplay mechanics will not be allowed." | PROCESS | Treat the maths model, the mode list and the gameplay mechanics as frozen at approval; post-approval changes are limited to minor visual fixes. | NO |
| R1-14 | approval_guidelines_submission_checklist.md:18 | "Incomplete submissions cause delays — games that do not meet all requirements will be held until the issues are resolved, which may push your go-live date back significantly." (em dash is upstream) | PROCESS | Clear every requirement before submitting; a partial submission is held rather than reviewed. | NO |
| R1-15 | approval_guidelines_submission_checklist.md:28 | "You must be logged in to view the approval guidelines." | PROCESS | The itemised approval criteria are behind a platform login and are NOT in this capture. The actual checklist items are UNKNOWN to this register and must be retrieved from a logged-in session before any squad claims coverage of them. | NO |
| R1-16 | approval_guidelines_submission_checklist.md:24 | "The checklist below reflects the exact criteria your game will be reviewed against. Requirements may vary based on your team’s trust level." | PROCESS | Retrieve the criteria list that applies to this team's own trust level, because the applicable set is not fixed across teams. | NO |
| R1-17 | approval_guidelines_submission_checklist.md:32,34,35 | "Each reviewer rates your game from 0 to 3 stars across design, gameplay, and math compliance." "Average ≥ 1 star → Game is approved for production." "Average < 1 star → Game is rejected." (three sentences joined from lines 32, 34 and 35 with single spaces) | PROCESS | The build must average at least 1 star over three independent reviewers across design, gameplay and maths compliance, or it is rejected. | NO |
| R1-18 | approval_guidelines_general_disclaimer.md:18 | "The game rules/information popup must include a brief disclaimer regarding game operation." | ARTEFACT | The rules/info popup must carry a disclaimer about how the game operates. | YES |
| R1-19 | approval_guidelines_general_disclaimer.md:18 | "You are able to use our template disclaimer, or your own, so long as the same message is clearly conveyed." | ARTEFACT | Either reproduce the platform template disclaimer or write one that clearly conveys the same message; wording may differ, meaning may not. | YES |
| R1-20 | approval_guidelines_general_disclaimer.md:22 | "Malfunction voids all wins and plays." | ARTEFACT | The disclaimer must convey that a malfunction voids all wins and plays. | YES |
| R1-21 | approval_guidelines_general_disclaimer.md:22 | "A consistent internet connection is required." | ARTEFACT | The disclaimer must convey that a consistent internet connection is required. | YES |
| R1-22 | approval_guidelines_general_disclaimer.md:22 | "In the event of a disconnection, reload the game to finish any uncompleted rounds." | ARTEFACT | The disclaimer must tell the player to reload the game after a disconnection to finish incomplete rounds. | YES |
| R1-23 | approval_guidelines_general_disclaimer.md:22 | "The expected return is calculated over many plays." | ARTEFACT | The disclaimer must convey that expected return is a long-run figure. | YES |
| R1-24 | approval_guidelines_general_disclaimer.md:22 | "The game display is not representative of any physical device and is for illustrative purposes only." | ARTEFACT | The disclaimer must convey that the display is illustrative and models no physical machine. | YES |
| R1-25 | approval_guidelines_general_disclaimer.md:22 | "Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser." | ARTEFACT | The disclaimer must convey that the RGS response, not the frontend, settles winnings. | YES |
| R1-26 | approval_guidelines_general_disclaimer.md:22 | "TM and © 2026 Stake Engine." | ARTEFACT | Present in the platform's template disclaimer as its closing line. Whether this line is itself mandatory, or is merely part of the template a studio may replace with its own wording under R1-19, is UNKNOWN from this page; note also that it sits against the project's own no-Stake-branding rule and should be ruled on rather than assumed. | YES |
| R1-27 | approval_guidelines_jurisdiction_requirements.md:18 | "For games to be avaliable on stake.us, US requriements prohibit the use of certain gambling terms. This predominantly applies to game rules but also potentially extends to images and UI elments. For your game to be approved for release on stake.us, your game cannot contain any of the terms listed below." (upstream spellings "avaliable", "requriements", "elments" reproduced) | ARTEFACT | For stake.us release, none of the listed restricted phrases may appear anywhere in the game, including rules text, images and UI elements, not just copy. | YES |
| R1-28 | approval_guidelines_jurisdiction_requirements.md:20 | "The RGS uses the URL query parameter social=true/false to indicate wheather or not the game is loaded in a ‘social’ casino. We reccomend using an additional language file with the prefix: sweeps_<lang> to handle phrase changes." (upstream spellings "wheather", "reccomend" reproduced) | ARTEFACT | Read the social=true/false URL query parameter and serve social-safe phrasing when it is true; the sweeps_<lang> language-file naming is a recommendation, not stated as mandatory. | YES |
| R1-29 | approval_guidelines_jurisdiction_requirements.md:25 | "win feature" "play feature" | ARTEFACT | In social mode, never render "win feature"; use "play feature". Restated at line 60 with the same replacement. | YES |
| R1-30 | approval_guidelines_jurisdiction_requirements.md:26 | "pay out" "win / won" | ARTEFACT | In social mode, never render "pay out"; use "win" or "won". Restated at line 56 with the same replacement. | YES |
| R1-31 | approval_guidelines_jurisdiction_requirements.md:27 | "paid out" "win" | ARTEFACT | In social mode, never render "paid out". Replacement given as "win" here and as "won" at line 57; upstream disagrees with itself. | YES |
| R1-32 | approval_guidelines_jurisdiction_requirements.md:28 | "stake" "play amount" | ARTEFACT | In social mode, never render "stake"; use "play amount". | YES |
| R1-33 | approval_guidelines_jurisdiction_requirements.md:29 | "pays out" "won" | ARTEFACT | In social mode, never render "pays out". Replacement given as "won" here and as "win" at line 59. | YES |
| R1-34 | approval_guidelines_jurisdiction_requirements.md:30 | "betting" "play / playing" | ARTEFACT | In social mode, never render "betting"; use "play" or "playing". Restated at line 54 as "playing" alone. | YES |
| R1-35 | approval_guidelines_jurisdiction_requirements.md:31 | "total bet" "total play" | ARTEFACT | In social mode, never render "total bet". Replacement given as "total play" here and as "play" at line 55. | YES |
| R1-36 | approval_guidelines_jurisdiction_requirements.md:32 | "bet" "play" | ARTEFACT | In social mode, never render "bet"; use "play". | YES |
| R1-37 | approval_guidelines_jurisdiction_requirements.md:33 | "bets" "plays" | ARTEFACT | In social mode, never render "bets"; use "plays". | YES |
| R1-38 | approval_guidelines_jurisdiction_requirements.md:34 | "cash" "coins" | ARTEFACT | In social mode, never render "cash"; use "coins". | YES |
| R1-39 | approval_guidelines_jurisdiction_requirements.md:35 | "payer" "winner" | ARTEFACT | In social mode, never render "payer"; use "winner". | YES |
| R1-40 | approval_guidelines_jurisdiction_requirements.md:36 | "pay" "win" | ARTEFACT | In social mode, never render "pay"; use "win". | YES |
| R1-41 | approval_guidelines_jurisdiction_requirements.md:37 | "pays" "wins" | ARTEFACT | In social mode, never render "pays"; use "wins". | YES |
| R1-42 | approval_guidelines_jurisdiction_requirements.md:38 | "paid" "won" | ARTEFACT | In social mode, never render "paid"; use "won". | YES |
| R1-43 | approval_guidelines_jurisdiction_requirements.md:39 | "money" "coins" | ARTEFACT | In social mode, never render "money"; use "coins". | YES |
| R1-44 | approval_guidelines_jurisdiction_requirements.md:40 | "buy" "play" | ARTEFACT | In social mode, never render "buy"; use "play". | YES |
| R1-45 | approval_guidelines_jurisdiction_requirements.md:41 | "bought" "instantly triggered" | ARTEFACT | In social mode, never render "bought"; use "instantly triggered". | YES |
| R1-46 | approval_guidelines_jurisdiction_requirements.md:42 | "purchase" "play" | ARTEFACT | In social mode, never render "purchase"; use "play". | YES |
| R1-47 | approval_guidelines_jurisdiction_requirements.md:43 | "at the cost of" "for" | ARTEFACT | In social mode, never render "at the cost of"; use "for". | YES |
| R1-48 | approval_guidelines_jurisdiction_requirements.md:44 | "rebet" "respin" | ARTEFACT | In social mode, never render "rebet"; use "respin". | YES |
| R1-49 | approval_guidelines_jurisdiction_requirements.md:45 | "cost of" "can be played for" | ARTEFACT | In social mode, never render "cost of"; use "can be played for". | YES |
| R1-50 | approval_guidelines_jurisdiction_requirements.md:46 | "credit" "balance" | ARTEFACT | In social mode, never render "credit"; use "balance". | YES |
| R1-51 | approval_guidelines_jurisdiction_requirements.md:47 | "buy bonus" "get bonus" | ARTEFACT | In social mode, never render "buy bonus"; use "get bonus". | YES |
| R1-52 | approval_guidelines_jurisdiction_requirements.md:48 | "gamble" "play" | ARTEFACT | In social mode, never render "gamble"; use "play". | YES |
| R1-53 | approval_guidelines_jurisdiction_requirements.md:49 | "wager" "play" | ARTEFACT | In social mode, never render "wager"; use "play". | YES |
| R1-54 | approval_guidelines_jurisdiction_requirements.md:50 | "deposit" "get coins" | ARTEFACT | In social mode, never render "deposit"; use "get coins". | YES |
| R1-55 | approval_guidelines_jurisdiction_requirements.md:51 | "withdraw" "redeem" | ARTEFACT | In social mode, never render "withdraw"; use "redeem". | YES |
| R1-56 | approval_guidelines_jurisdiction_requirements.md:52 | "bonus buy" "bonus / feature" | ARTEFACT | In social mode, never render "bonus buy"; use "bonus" or "feature". | YES |
| R1-57 | approval_guidelines_jurisdiction_requirements.md:53 | "be awarded to player’s accounts" "appear in player’s accounts" | ARTEFACT | In social mode, never render "be awarded to player's accounts"; use "appear in player's accounts". Curly apostrophe is upstream. | YES |
| R1-58 | approval_guidelines_jurisdiction_requirements.md:58 | "place your bets" "come and play / join in the game" | ARTEFACT | In social mode, never render "place your bets"; use "come and play" or "join in the game". | YES |
| R1-59 | approval_guidelines_jurisdiction_requirements.md:61 | "bet/s" "play/s" | ARTEFACT | In social mode, never render "bet/s"; use "play/s". | YES |
| R1-60 | approval_guidelines_jurisdiction_requirements.md:62 | "currency" "token" | ARTEFACT | In social mode, never render "currency"; use "token". | YES |
| R1-61 | approval_guidelines_jurisdiction_requirements.md:63 | "fund" "balance" | ARTEFACT | In social mode, never render "fund"; use "balance". | YES |

What was deliberately NOT given a row, so the omissions are visible rather than looking like
gaps: the capture header blocks (provenance, not content); the platform-side description at
`approval_guidelines_general_disclaimer.md:18` that Stake Engine "utilises pre-calculated game
results" (states what the platform does, and its normative consequence is already R1-25); the
shared-review-queue and deprioritisation paragraph at
`approval_guidelines_submission_checklist.md:20` (a consequence of failing other requirements,
not a separate obligation); the reviewer-assignment mechanics in the same file at line 32 beyond
the rating clause captured in R1-17; and the sentence at `approval_guidelines.md:29` that "Stake
Engine offers a social mode setting within the play modal to test social languages" (a facility
offered, not an obligation placed).

The single largest gap in this squad's coverage is R1-15. The submission checklist page renders
a login wall exactly where the itemised criteria would be, so the "exact criteria your game will
be reviewed against" are not in the 2026-07-29 capture at all. Rows R1-01 to R1-61 are therefore
the approval spine as PUBLICLY captured, and must not be read as the complete review checklist.

rows_enumerated: 61
pages_read: approval_guidelines.md, approval_guidelines_submission_checklist.md, approval_guidelines_general_disclaimer.md, approval_guidelines_jurisdiction_requirements.md
duplicates_noted: R1-11 and R1-27 both carry the stake.us language condition, R1-11 from the index page and R1-27 from the jurisdiction page, so the same obligation appears twice in my own shard by design (index states the condition, jurisdiction page states its content); a social-language or localisation squad will almost certainly restate R1-27 to R1-61, and a rules-popup or disclosure squad will almost certainly restate R1-18 to R1-26. R1-04, R1-05 and R1-13 touch the locked maths package and any maths squad will restate them. Within my own pages, the upstream prohibited-terms table restates six entries with sometimes DIFFERENT replacements: line 54 restates R1-34, line 55 restates R1-35, line 56 restates R1-30, line 57 restates R1-31 with "won" instead of "win", line 59 restates R1-33 with "win" instead of "won", line 60 restates R1-29. I kept one row per distinct restricted phrase and recorded the conflicting replacement inside the affected row, rather than creating duplicate rows. I was NOT bounded on any page; all four are short and were enumerated in full.
could_not_open: NONE
tree_clean_after: `?? reports/qa/compliance_register/` (the single untracked entry is the register directory holding this shard and the other squads' shards; nothing tracked was modified, no project script was run)
