R099: UNBLOCK OPENAI PROVIDER GATE (TICKET 456254)
Sole live brief. Unattended. Review lane. High care.
THE FENCE

* No game rasters may be staged or committed.
* No changes to placeholder art in the working tree.
* No kit packaging.
* output/ remains read-only.
* Working-tree placeholders must survive byte-for-byte unchanged.

PRECONDITIONS

* On main, up to date.
* Confirm docs/legal/openai-ticket-456254-ruling.md exists and contains Ticket 456254.
* Confirm current provider_gate.json (or equivalent) still carries OpenAI as BARRED.

CONTEXT
Ticket 456254 (24 Aug 2026) confirms that Synergistic Interaction Pty Ltd / We Roll Spinners may use ChatGPT image generation (gpt-image-1) to create visual art assets for real-money slot games on licensed platforms, as development-stage artwork, subject to Usage Policies and Terms of Use.
R098 recorded the ruling. This brief makes the ruling operational.
TASK 1 — ARCHIVE THE PRIMARY SOURCE
If the original support email / ticket correspondence is available in the workspace or can be safely referenced, place a durable capture under the existing OpenAI licence / legal directory (alongside any prior 2026-08-22 captures).
If the primary email file is not present in the repo, state that clearly and proceed using the already-committed transcription in docs/legal/openai-ticket-456254-ruling.md as the controlling project record.
TASK 2 — UPDATE THE PROVIDER GATE
Update the machine-enforced provider gate so OpenAI / ChatGPT image generation is no longer BARRED for this project’s stated use.
Required outcome:

* OpenAI mark becomes CLEARED (or the project’s equivalent positive mark) for development-stage artwork generation.
* The change must reference Ticket 456254 and the ruling file path.
* Add a short inline comment or adjacent record explaining:
   * What changed
   * Why (Ticket 456254)
   * The remaining conditions (development-stage artwork only; not for operating gambling, accepting wagers, processing payments, or player interaction)

Do not broaden the clearance beyond what the ticket states.
TASK 3 — VERIFY THE UNBLOCK
Prove the gate is now functional:

* Show the before → after mark for OpenAI.
* Run the project’s normal provider/gate check (or the equivalent dry path) and confirm OpenAI is no longer refused.
* Confirm no other providers were accidentally altered.

TASK 4 — RECORDS

* Add a communications entry stating that the OpenAI provider gate is now CLEARED per Ticket 456254.
* Link the ruling file and the gate change.
* Note any remaining conditions or follow-ups.

CLOSE

* Minimal diff: gate change + records + any primary-source archive.
* Zero game rasters staged or committed.
* Leave the 27 placeholders untouched.
* PR on review lane.
* Report the exact files changed and the final OpenAI mark.

When finished, stop and confirm that OpenAI generation is operationally unblocked.
