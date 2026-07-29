# W08: walk 9 requirements on the approval-core surface (part 2 of 5)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-010 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that a malfunction voids all wins and plays. |
| REQ-011 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that a consistent internet connection is required. |
| REQ-012 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must tell the player to reload the game after a disconnection to finish incomplete rounds. |
| REQ-013 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that expected return is a long-run figure. |
| REQ-014 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that the display is illustrative and models no physical machine. |
| REQ-015 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | The disclaimer must convey that the RGS response, not the frontend, settles winnings. |
| REQ-016 | ARTEFACT | YES | `approval_guidelines_general_disclaimer.md:22` | Present in the platform's template disclaimer as its closing line. Whether this line is itself mandatory, or is merely part of the template a studio may replace with its own wording under R1-19, is UNKNOWN from this page; note also that it sits against the project's own no-Stake-branding rule and should be ruled on rather than assumed. |
| REQ-017 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:18` | For stake.us release, none of the listed restricted phrases may appear anywhere in the game, including rules text, images and UI elements, not just copy. |
| REQ-018 | ARTEFACT | YES | `approval_guidelines_jurisdiction_requirements.md:20` | Read the social=true/false URL query parameter and serve social-safe phrasing when it is true; the sweeps_<lang> language-file naming is a recommendation, not stated as mandatory. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-010

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "Malfunction voids all wins and plays."
- what it requires: The disclaimer must convey that a malfunction voids all wins and plays.

### REQ-011

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "A consistent internet connection is required."
- what it requires: The disclaimer must convey that a consistent internet connection is required.

### REQ-012

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "In the event of a disconnection, reload the game to finish any uncompleted rounds."
- what it requires: The disclaimer must tell the player to reload the game after a disconnection to finish incomplete rounds.

### REQ-013

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "The expected return is calculated over many plays."
- what it requires: The disclaimer must convey that expected return is a long-run figure.

### REQ-014

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "The game display is not representative of any physical device and is for illustrative purposes only."
- what it requires: The disclaimer must convey that the display is illustrative and models no physical machine.

### REQ-015

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser."
- what it requires: The disclaimer must convey that the RGS response, not the frontend, settles winnings.

### REQ-016

- source: `approval_guidelines_general_disclaimer.md:22`
- platform text, verbatim: "TM and © 2026 Stake Engine."
- what it requires: Present in the platform's template disclaimer as its closing line. Whether this line is itself mandatory, or is merely part of the template a studio may replace with its own wording under R1-19, is UNKNOWN from this page; note also that it sits against the project's own no-Stake-branding rule and should be ruled on rather than assumed.

### REQ-017

- source: `approval_guidelines_jurisdiction_requirements.md:18`
- platform text, verbatim: "For games to be avaliable on stake.us, US requriements prohibit the use of certain gambling terms. This predominantly applies to game rules but also potentially extends to images and UI elments. For your game to be approved for release on stake.us, your game cannot contain any of the terms listed below." (upstream spellings "avaliable", "requriements", "elments" reproduced)
- what it requires: For stake.us release, none of the listed restricted phrases may appear anywhere in the game, including rules text, images and UI elements, not just copy.

### REQ-018

- source: `approval_guidelines_jurisdiction_requirements.md:20`
- platform text, verbatim: "The RGS uses the URL query parameter social=true/false to indicate wheather or not the game is loaded in a ‘social’ casino. We reccomend using an additional language file with the prefix: sweeps_<lang> to handle phrase changes." (upstream spellings "wheather", "reccomend" reproduced)
- what it requires: Read the social=true/false URL query parameter and serve social-safe phrasing when it is true; the sweeps_<lang> language-file naming is a recommendation, not stated as mandatory.

