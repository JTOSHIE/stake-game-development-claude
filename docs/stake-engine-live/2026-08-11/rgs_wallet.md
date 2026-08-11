<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: rgs_wallet
- resolved_url: https://stake-engine.com/docs/rgs/wallet
- fetched: 2026-08-11
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText, direct transport from the owner's machine.

---
Wallet

The wallet endpoints enable interactions between the RGS and the Operator’s Wallet API, managing the player’s session and balance operations.

Authenticate Request

Validates a sessionID with the operator. This must be called before using other wallet endpoints. Otherwise, they will throw ERR_IS (invalid session).

Round

The round returned may represent a currently active or the last completed round. Frontends should continue the round if it remains active.

Request
POST /wallet/authenticate

{
  "sessionID": "xxxxxxx",
}

Response
{
  "balance": {
    "amount": 100000,
    "currency": "USD"
  },
  "config": {
    "minBet": 100000,
    "maxBet": 1000000000,
    "stepBet": 100000,
    "defaultBetLevel": 1000000,
    "betLevels": [...],
    "jurisdiction": {
      "socialCasino": false,
      "disabledFullscreen": false,
      "disabledTurbo": false,
      ...
    }
  },
  "round": { ... }
}

Balance Request

Retrieves the player’s current balance. Useful for periodic balance updates.

Request
POST /wallet/balance

{
  "sessionID": "xxxxxx"
}

Response
{
  "balance": {
    "amount": 100000,
    "currency": "USD"
  }
}

Play Request

Initiates a game round and debits the bet amount from the player’s balance.

Request
{
  "amount": 100000,
  "sessionID": "xxxxxxx",
  "mode": "BASE"
}

Response
{
  "balance": {
    "amount": 100000,
    "currency": "USD"
  },
  "round": { ... }
}

End Round Request

Completes a round, triggering a payout and ending all activity for that round.

Request
POST /wallet/end-round

{
  "sessionID": "xxxxxx"
}

Response
{
  "balance": {
    "amount": 100000,
    "currency": "USD"
  }
}

Game Play
Event

Tracks in-progress player actions during a round. Useful for resuming gameplay if a player disconnects.

Request
POST /bet/event

{
  "sessionID": "xxxxxx",
  "event": "xxxxxx"
}

Response
{
  "event": "xxxxxx"
}

Response Codes

Stake Engine uses standard HTTP response codes (200, 400, 500) with specific error codes.

400 – Client Errors
Status Code	Description
ERR_VAL	Invalid Request
ERR_IPB	Insufficient Player Balance
ERR_IS	Invalid Session Token / Session Timeout
ERR_ATE	Failed User Authentication / Token Expired
ERR_GLE	Gambling Limits Exceeded
ERR_LOC	Invalid Player Location
500 – Server Errors
Status Code	Description
ERR_GEN	General Server Error
ERR_MAINTENANCE	RGS Under Planned Maintenance
Math Publication File Formats

When publishing math results, ensure that the file-format is abided by. These are strict conditions for successful math file publication.
