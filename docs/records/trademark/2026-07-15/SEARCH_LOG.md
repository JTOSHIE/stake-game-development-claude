# Trademark Search Log: "We Roll Spinners" / "Future Spinner"

Supporting record for `WRS_MASTER_DOCUMENT.md` section 1, "Trademark
clearance" row. Logs every search run against these two names/marks, by
whom, on what system, and what came back. Append new entries below as
further searches land; never overwrite a prior entry.

## 2026-07-15: exact-phrase quick searches, official AU register

- **System:** Australian Trade Mark Search (`search.ipaustralia.gov.au`),
  IP Australia's official trade mark register.
- **Search type:** Quick search, exact phrase.
- **Date run:** 2026-07-15.

| Search term | Result count | Notes |
|---|---|---|
| "we roll spinners" | 0 | No exact-phrase matches on the register. |
| "Future Spinner" | 0 | No exact-phrase matches on the register. |

### Register's own caveat on word searching (quoted, not paraphrased)

From IP Australia's own Trade Mark Search help centre
(`https://search.ipaustralia.gov.au/trademarks/help`, fetched 2026-07-15):

> "Word searching is very precise. An effective trade mark search should
> consider slight variations of your trade mark, including plurals, common
> misspellings and trade marks that sound or look very similar."

On prefix versus part-word searching specifically (same source):

> "Prefix word search will return records with word indexing constituents
> that start with the search term entered."
>
> "Part word search will return records where the term searched forms part
> of any of the record's word indexing constituents."

In plain terms: a prefix search only catches the term at the START of a
word (e.g. a prefix search on "MAX" will not catch "POWERMAX" - that needs
a part-word search instead), and neither search type is exhaustive on its
own - the register explicitly recommends searching prefixes, part-words,
suffixes, plurals, common misspellings, and marks that sound or look
similar, not just the exact phrase. **The two 0-result exact-phrase
searches above do NOT by themselves clear the name against prefix,
part-word, phonetic or visual-similarity conflicts** - that is exactly what
the PENDING rows below exist to cover.

### Pending

| Search | System | Scope | Status |
|---|---|---|---|
| Variant scan: "spinner", "future spin", "we roll" | Australian Trade Mark Search | Classes 9 (software/games) and 41 (entertainment services) | Gathered 2026-07-18, see below |
| Exact-phrase checks: "We Roll Spinners", "Future Spinner" | USPTO (TESS or successor system) | Exact | Attempted 2026-07-18, blocked by USPTO, see below |

When the owner supplies these outcomes, append them as new dated entries
below (do not edit the entries above) and update the
`WRS_MASTER_DOCUMENT.md` trademark row accordingly.

## 2026-07-18: variant scan (AU) and exact-phrase checks (USPTO)

This entry only records what each register returned. It makes no clearance
or similarity judgment on any hit, and does not characterise any result as
safe or unsafe - that ruling is Fable's at the next check-in, per the brief
that commissioned this run.

### AU: Australian Trade Mark Search, advanced search, variant scan

- **System:** `search.ipaustralia.gov.au`, advanced search form (not quick
  search, to allow class and status filtering).
- **Terms:** "spinner", "spinners", "future spin", "we roll" (the 2026-07-15
  entry's 3-term list plus "spinners", added per this brief's own framing as
  a refinement of the earlier run).
- **Filters applied to every term:** Classes 9,41, class-match mode
  **Single** (the form's default "Associated - current" mode silently
  broadens matching to related classes - e.g. it showed "Associated classes:
  9, 11, 14, 16, 28, 35, 37, 38, 41, 42, 43, 45" for a 9,41 search - so
  Single was selected instead to hold the filter to the literal classes 9
  and 41 the brief specifies), status group **Pending and Registered**.
- **Date run:** 2026-07-18.
- **Capture:** full-page screenshot per results page under
  `docs/records/trademark/2026-07-18/au/`; per-hit mark text, number,
  classes, status, owner and goods/services line in
  `docs/records/trademark/2026-07-18/au/au_variant_scan_data.json`.

| Search term | Result count | Screenshot |
|---|---|---|
| "spinner" | 14 | `au/spinner-results.png` |
| "spinners" | 4 | `au/spinners-results.png` |
| "future spin" | 0 | `au/future-spin-results.png` |
| "we roll" | 1 | `au/we-roll-results.png` |

**Note on "we roll":** a single-hit search on this register redirects
straight to that hit's own record page rather than showing a one-row
results list; the screenshot and captured fields reflect that record page.

**Full per-hit table** (mark text, number, classes, status, owner,
goods/services - all fields captured for every hit, no gaps on this leg):

| Term | Number | Mark | Classes | Status | Owner | Goods/services |
|---|---|---|---|---|---|---|
| spinner | 728367 | SPHINNER | 9 | Registered: Renewal due | Gerard Andrew McCuish | Class 9: Scientific and laboratory equipment including stirrers and mixers |
| spinner | 1215165 | SPINNER | 9 | Protected: Registered/protected | Spinner GmbH | Class 9: Electrotechnical apparatus, instruments and components for use in the field of communication and radio frequency (RF) technology; electric po... |
| spinner | 1245659 | SPINNER | 9 | Protected: Registered/protected | Spinner GmbH | Class 9: Electrotechnical apparatus, instruments and components for use in the field of communication and RF-technology (included in this class); elec... |
| spinner | 1384540 | DINNERSPINNER | 9 | Registered: Registered/protected | AllRecipes.com, Inc. | Class 9: Computer application software; computer application software for mobile devices, digital electronic devices and other consumer electronics |
| spinner | 1531249 | SPINNER | 9 | Protected: Registered/protected | Spinner GmbH | Class 9: Apparatus, instruments and components for communications technology, high-frequency technology, ultra-high-frequency technology, satellite te... |
| spinner | 1876622 | SPINNER SLOTS | 9 | Registered: Registered/protected | MURKA GAMES LIMITED | Class 9: Computer video game software; computer software platforms for social networking; downloadable electronic games via the Internet and other ele... |
| spinner | 1887776 | SPINNA CRICKET | 9, 41 | Registered: Registered/protected | NML Investments Pty Ltd as trustee for NML Investment Trust | Class 9: Computer software applications (downloadable); Downloadable software applications (apps) Class 41: Sports coaching and training; arrangement,... |
| spinner | 2034959 | SunCoast Spinners | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | Class 41: Organising charitable fundraising events being the provision of entertainment, sporting and cultural services; Arranging of sporting events;... |
| spinner | 2034960 | SUNCOAST SPINNERS WHEELCHAIR BASKETBALL INC. | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | Class 41: Organising charitable fundraising events being the provision of entertainment, sporting and cultural services; Arranging of sporting events;... |
| spinner | 2034961 | SUNCOAST SPINNERS REVERSE INCLUSION | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | Class 41: Organising charitable fundraising events being the provision of entertainment, sporting and cultural services; Sporting information; Event m... |
| spinner | 2160804 | SPINNEROOS BOUNCE INTO TABLE TENNIS | 25, 28, 41 | Registered: Registered/protected | Table Tennis Australia Limited | Class 25: Clothing, headwear Class 28: Games, toys and playthings; sporting articles; table tennis balls; table tennis bats Class 41: Organisation of ... |
| spinner | 2184504 | YARN SPINNER | 9, 42 | Registered: Registered/protected | Secret Lab Pty Ltd | Class 9: Computer software; Computer software applications (downloadable); Computer software products; Interactive computer software; Recorded compute... |
| spinner | 2297224 | SPHINNER | 9 | Registered: Registered/protected | MR Gerard McCuish; Gerard Anthony McCuish | Class 9: Scientific and laboratory equipment including stirrers and mixers |
| spinner | 2410242 | Spinners | 41 | Registered: Registered/protected | Spinners Bar & Bowl PL | Class 41: Bowling alley services; Bowling centre services Endorsements The trade mark will be used only in relation to services provided from the Suns... |
| spinners | 2034959 | SunCoast Spinners | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | (as above) |
| spinners | 2034960 | SUNCOAST SPINNERS WHEELCHAIR BASKETBALL INC. | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | (as above) |
| spinners | 2034961 | SUNCOAST SPINNERS REVERSE INCLUSION | 41 | Registered: Registered/protected | Suncoast Spinners Wheelchair Basketball Inc | (as above) |
| spinners | 2410242 | Spinners | 41 | Registered: Registered/protected | Spinners Bar & Bowl PL | (as above) |
| future spin | - | (no results) | - | - | - | - |
| we roll | 1854151 | That's how we roll | 25, 41 | Registered: Registered/protected | New South Wales Womens Bowling Association Incorporated | Class 25: Clothing for sports; Sports caps; ... Class 41: Advisory services relating to the organisation of sporting events; ... |

Goods/services lines above are truncated for table width where long; the
full untruncated text for every hit is in `au_variant_scan_data.json`.

### USPTO: tmsearch.uspto.gov - BLOCKED, gap explicitly recorded

- **System:** `tmsearch.uspto.gov` (USPTO's current trademark search system).
- **Terms intended:** "We Roll Spinners", "Future Spinner", "future spin",
  live marks only, international classes 9 and 41.
- **Date attempted:** 2026-07-18.
- **What happened:** the search-information landing page loaded once and a
  single free-text query ("future spinner", not yet the exact-phrase/class/
  live-status-filtered form the brief calls for) returned a live results
  page, confirming the site's search mechanics: a "Wordmark" search box, a
  left-hand **Status filter** (Live > Registered/Pending, Dead >
  Cancelled/Abandoned) and a **Class filter** with a "Coordinated" toggle
  (USPTO's equivalent of the AU register's "Associated" broadening - would
  need to be switched off for a literal classes-9/41-only filter, mirroring
  the AU fix above). Before the three actual brief searches could be run
  with those filters applied, every subsequent request - including a plain
  reload of the landing page, and a retry after a pause - returned a
  CloudFront 403: "Request blocked. We can't connect to the server for this
  app or website at this time." This is a site-side automation block, not a
  selector or navigation fault on this end.
- **Gap, stated explicitly, not interpolated:** none of the three USPTO
  searches ("We Roll Spinners", "Future Spinner", "future spin" - live
  marks, classes 9/41) were completed. No hit counts, mark data, or
  screenshots exist for them beyond the general reconnaissance above. This
  gap is not filled with an estimate or a prior result; it is recorded as
  outstanding.
- **Capture:** landing-page-reachable and filter-sidebar-reconnaissance
  screenshots, plus the 403 block screenshot, under
  `docs/records/trademark/2026-07-18/uspto/` as evidence of what was and
  was not possible.
- **Next attempt:** a later session should retry after a longer cooldown,
  or the owner may prefer to run the three USPTO searches manually given
  the block.
