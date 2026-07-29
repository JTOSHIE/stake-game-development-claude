# W16: walk 9 requirements on the rgs-comms-and-tile surface (part 1 of 3)

Each row below is a PLATFORM requirement, quoted from the captured docs. Your job is to find
its implementation path and its proof path in this repository, OPEN each one, and QUOTE it.

| REQ | obligation | vis | source | requirement |
|---|---|---|---|---|
| REQ-100 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:18` | All auth and all bet/wallet traffic goes to the Stake Engine RGS and nowhere else; no second transport, no studio-side wallet or session service. |
| REQ-101 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:21` | The bet ladder shown to the player is driven by the authenticate response for the session currency, not by hardcoded levels; a default bet outside the authenticated set must not be offered. Two consecutive sentences of one capture line. |
| REQ-102 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:22` | Plus/minus stepping and any typed or slider bet value must land on multiples permitted by `minStep` from the authenticate config. |
| REQ-103 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:23` | The RGS minimum and maximum must both be reachable in the UI (min bet and max bet selectable), at the values the RGS gave. |
| REQ-104 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:25` | Ship only static assets; zero runtime requests to any external host, including external font, CDN, analytics or image hosts. The same line names external font downloads as the common failure and notes they log console errors. |
| REQ-105 | ARTEFACT | NO | `approval_guidelines_rgs_communication.md:27` | Read the RGS host from the `rgs_url` query parameter at load and call that host; no hardcoded or environment-baked endpoint. |
| REQ-106 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:30` | English (`en`) must be present and complete; other languages are optional, so no other locale is required for approval. |
| REQ-107 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:30` | Passing any unsupported language code (the capture lists ar, de, en, es, fi, fr, hi, id, ja, ko, po, pt, ru, tr, zh, vi at lines 33 to 49) must fall back cleanly to readable English, never to blank, mojibake or raw key strings. |
| REQ-108 | ARTEFACT | YES | `approval_guidelines_rgs_communication.md:51` | The table at lines 51 to 100 is the display specification for every supported currency: for each currency code the game must render the platform's exact display token, on the platform's side of the amount (prefix for USD, CAD, JPY and most others; suffix for DKK, PLN, VND, CLP, ARS, SAR, ILS, AED, TND, OMR, QAR, XGC, XSC, XEC), matching the Example column. Header row, upstream tabs rendered as single spaces. |

## The verbatim platform text for each, so you never work from the paraphrase

### REQ-100

- source: `approval_guidelines_rgs_communication.md:18`
- platform text, verbatim: "Session authentication and bet transactions are handled exclusively through the Stake Engine RGS."
- what it requires: All auth and all bet/wallet traffic goes to the Stake Engine RGS and nowhere else; no second transport, no studio-side wallet or session service.

### REQ-101

- source: `approval_guidelines_rgs_communication.md:21`
- platform text, verbatim: "The authenticate HTTP response returns default bet levels, supported bet levels for a specified currency, and minimum/maximum bet amounts. The frontend must respect these values."
- what it requires: The bet ladder shown to the player is driven by the authenticate response for the session currency, not by hardcoded levels; a default bet outside the authenticated set must not be offered. Two consecutive sentences of one capture line.

### REQ-102

- source: `approval_guidelines_rgs_communication.md:22`
- platform text, verbatim: "Bet increments must reflect allowed values within authenticate/config/minStep."
- what it requires: Plus/minus stepping and any typed or slider bet value must land on multiples permitted by `minStep` from the authenticate config.

### REQ-103

- source: `approval_guidelines_rgs_communication.md:23`
- platform text, verbatim: "Minimum and maximum bet levels must be available for selection as dictated by the RGS."
- what it requires: The RGS minimum and maximum must both be reachable in the UI (min bet and max bet selectable), at the values the RGS gave.

### REQ-104

- source: `approval_guidelines_rgs_communication.md:25`
- platform text, verbatim: "The game build must consist only of static files and cannot reach external sources."
- what it requires: Ship only static assets; zero runtime requests to any external host, including external font, CDN, analytics or image hosts. The same line names external font downloads as the common failure and notes they log console errors.

### REQ-105

- source: `approval_guidelines_rgs_communication.md:27`
- platform text, verbatim: "The game must use the rgs_url query parameter to determine the server to call."
- what it requires: Read the RGS host from the `rgs_url` query parameter at load and call that host; no hardcoded or environment-baked endpoint.

### REQ-106

- source: `approval_guidelines_rgs_communication.md:30`
- platform text, verbatim: "English is the only required language."
- what it requires: English (`en`) must be present and complete; other languages are optional, so no other locale is required for approval.

### REQ-107

- source: `approval_guidelines_rgs_communication.md:30`
- platform text, verbatim: "If only English (en) is supported, on-screen text must not corrupt when other language parameters are passed."
- what it requires: Passing any unsupported language code (the capture lists ar, de, en, es, fi, fr, hi, id, ja, ko, po, pt, ru, tr, zh, vi at lines 33 to 49) must fall back cleanly to readable English, never to blank, mojibake or raw key strings.

### REQ-108

- source: `approval_guidelines_rgs_communication.md:51`
- platform text, verbatim: "Currency Abbreviation Display Example"
- what it requires: The table at lines 51 to 100 is the display specification for every supported currency: for each currency code the game must render the platform's exact display token, on the platform's side of the amount (prefix for USD, CAD, JPY and most others; suffix for DKK, PLN, VND, CLP, ARS, SAR, ILS, AED, TND, OMR, QAR, XGC, XSC, XEC), matching the Example column. Header row, upstream tabs rendered as single spaces.

