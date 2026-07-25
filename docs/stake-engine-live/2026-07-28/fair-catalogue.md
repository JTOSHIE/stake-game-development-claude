<!-- Stake Engine FAIR API snapshot -->
- topic: fair-catalogue
- resolved_url: https://fair.stake-engine.com/catalogue
- fetched: 2026-07-28
- rendered_via: headless Chrome (Claude Browser pane)
- looks_real: true
- capture_note: the endpoint returns a raw JSON array. A representative excerpt is
  reproduced below verbatim; the full payload lists every published game on the
  platform. Structure, not the full list, is what matters for our compliance.

# FAIR catalogue

## What it is

A public, unauthenticated JSON endpoint publishing, for every game on the platform, its
active version(s) and per-mode figures. No key, no login.

## Schema, as observed

```
[
  {
    "game":      { "name": str, "slug": str, "image": url },
    "publisher": { "name": str, "slug": str },
    "versions": [
      {
        "version": int,
        "active":  bool,
        "modes": [
          { "name": str, "rtp": float, "weight_range": int, "events": int }
        ]
      }
    ]
  },
  ...
]
```

Note `versions` is an array and more than one entry may be `active: true`
(observed on "Lokis Vault", versions 746 and 789 both active).

## Verbatim excerpt

```json
[{"game":{"name":"Scrollkeeper","slug":"scrollkeeper","image":"https://stake-engine.com/api/asset/image/01975e26-22b8-7c55-af74-ebbb9f2f49ba"},"publisher":{"name":"Paperclip Gaming","slug":"paperclip"},"versions":[{"version":4,"active":true,"modes":[{"name":"BASE","rtp":0.9603056421929274,"weight_range":4503599626279964,"events":1410986},{"name":"ANTE","rtp":0.9566250198652595,"weight_range":4503599628187016,"events":1410986},{"name":"BONUS","rtp":0.960481270642431,"weight_range":4504049987308234,"events":1410986}]}]},
{"game":{"name":"Obey The Reptillians","slug":"obey-the-reptillians"},"publisher":{"name":"skygaming","slug":"skygaming"},"versions":[{"version":51,"active":true,"modes":[{"name":"base","rtp":0.9600202895140023,"weight_range":95604995256,"events":10000000},{"name":"feature_spins","rtp":0.9600046820096041,"weight_range":81775692229,"events":8000000},{"name":"buy_bonus_1","rtp":0.9600159051842151,"weight_range":10370297270,"events":1000000},{"name":"buy_bonus_2","rtp":0.9600268732652709,"weight_range":10009423300,"events":1000000},{"name":"bonus_hunt","rtp":0.9600677639287497,"weight_range":82674226885,"events":10000000}]}]},
{"game":{"name":"Rush of Olympus","slug":"rush-of-olympus"},"publisher":{"name":"Rapid Games","slug":"rapid-games"},"versions":[{"version":39,"active":true,"modes":[{"name":"base","rtp":0.9629999992795376,"weight_range":1125899906242247,"events":1000000},{"name":"scatter_boost","rtp":0.9629999998678686,"weight_range":1125899906301284,"events":1000000},{"name":"wrath","rtp":0.9630000001317274,"weight_range":1125899906206362,"events":1000000},{"name":"regular_bonus","rtp":0.9629759254339487,"weight_range":1125928054036167,"events":600000},{"name":"super_bonus","rtp":0.962942222166395,"weight_range":1125967460533172,"events":600000},{"name":"extreme_bonus","rtp":0.9628459442867323,"weight_range":1126080050739629,"events":200000}]}]},
{"game":{"name":"Golden Boy","slug":"25_97"},"publisher":{"name":"Twist Gaming","slug":"twist"},"versions":[{"version":11,"active":true,"modes":[{"name":"base","rtp":0.969999997907439,"weight_range":1125899906806860,"events":100000},{"name":"ante-one","rtp":0.9699999983158037,"weight_range":1125899906807378,"events":100000}]}]},
{"game":{"name":"Lokis Vault","slug":"the-lokis-vault"},"publisher":{"name":"Valkyrie","slug":"valkyrie"},"versions":[{"version":746,"active":true,"modes":[{"name":"base","rtp":0.9799987929896853,"weight_range":1125899905463249,"events":3600000},{"name":"ante","rtp":0.9799995772044318,"weight_range":1125899904415295,"events":3600000},{"name":"bonus","rtp":0.9821134548340037,"weight_range":1125034488124009,"events":240000}]}]}]
```

## What it means for us

**No additional work is owed.** Our maths package is the data source for these figures:
FAIR publishes what the ACP already holds after upload. The endpoint asks nothing of the
frontend or the build.

Two computed observations, recorded because they are checkable facts rather than
impressions:

1. **Our `weight_range` convention is conventional.** Published games cluster around
   `1.1259e15` (2^50). Our own per-mode totals sit in exactly that range (base
   `1,125,899,906,813,400`). Several publishers use other magnitudes
   (`4.5036e15`, `9.56e10`), so the field is not uniform, but we are squarely inside the
   most common convention.

2. **Our 100,000 events per mode is at the low end of the published field.** Observed
   values run from 6,514 (Drop The Boss) through 100,000 (Golden Boy, Krakens Curse) to
   1,410,986, 3,600,000 and 10,000,000 (Obey The Reptillians, exactly at the platform
   cap). We are compliant, sitting on the platform's stated 100,000 minimum and two
   orders of magnitude below the 10,000,000 ceiling. It is nonetheless a publicly
   visible differentiator and worth an owner decision at some point, since a reviewer or
   a competitor can read it.

Also visible: several published games run RTPs **above** the 96.70% new-submission
ceiling (Lokis Vault at 0.98, several Twist titles at 0.97). Consistent with the ceiling
applying to new submissions rather than retroactively.

## Missing input, named rather than guessed

The ruling also asked for "the outcome endpoint contract".
`https://fair.stake-engine.com/` returns **404 page not found**, and the catalogue
payload carries no endpoint documentation, no schema link and no per-game outcome URL.
The outcome endpoint is therefore **not captured**: its URL has not been supplied and is
not discoverable from what is published. Per convention (m) and the facts discipline,
it is named and waited for rather than inferred from a guessed URL pattern.
