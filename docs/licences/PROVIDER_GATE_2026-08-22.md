# Provider licence gate, R084 TASK 0

**The gate is blocking: no generation call to a provider before its CLEARED mark.** Two
providers assessed against three axes, image outputs, commercial use and gambling, from
captures taken first-hand on 2026-08-22.

| Provider | Mark | Basis |
|---|---|---|
| **OpenAI (gpt-image-1)** | **BARRED** | Usage Policies prohibit "real money gambling", and the Services Agreement makes those policies contractually binding |
| **Stability AI (SD 3.5 Large, Large Turbo)** | **CLEARED** | No gambling restriction in the API Terms of Service or the Acceptable Use Policy, verified with working controls |

## OpenAI: BARRED

**The operative sentence, quoted verbatim** from
`docs/licences/openai/2026-08-22/openai-usage-policies.txt` (effective 29 October 2025),
under the heading "Protect people. Everyone has a right to safety and security. So you
cannot use our services for:":

> real money gambling

**It is contractual, not advisory, and the chain is four links long.** Each is quoted in
`docs/licences/openai/2026-08-22/openai-services-agreement-operative-clauses.txt`:

1. **16.1** "This Agreement hereby incorporates by this reference the OpenAI Policies".
2. **Definitions** "'OpenAI Policies' means the Service-Specific Terms, Sharing and
   Publication Policy, and Usage Policies."
3. **3.3** "Customer will not ... (a) use the Services or Customer Content in a way that
   violates applicable laws or OpenAI Policies".
4. **Usage Policies** prohibit real money gambling.

**And the consequences of breaching that specific clause are unusually sharp**, which is
why this is a BARRED and not a shrug. **14.1** carves "CUSTOMER'S BREACH OF SECTION 3.3
(RESTRICTIONS)" OUT of the mutual indirect-damages cap, so the liability limit does not
apply. **13.2** has the customer indemnify OpenAI for claims arising from "use of the
Services in violation of this Agreement". **8.2** permits suspension or termination.
Outputs already generated would be of contested provenance in a product that goes to a
regulated operator for approval.

**The narrow reading exists and is NOT relied on.** One could argue that generating art
assets is not itself "real money gambling", and that the prohibition targets operating
gambling through the service. That reading may even be right. It is not adopted here for
three reasons: Future Spinner IS a real-money gambling product and the art is made
expressly for it; the policy is category-level and unqualified; and convention (m)
forbids resolving an ambiguity in our own favour on a compliance question. **If the owner
wants the OpenAI route, the way to get it is written confirmation from OpenAI, not our
own construction of their policy.** That is escalation E1.

## Stability AI: CLEARED

Four documents captured under `docs/licences/stability/2026-08-22/`. Gambling appears in
none of them. **Verified with working controls each time, so the zero is a real absence
rather than a search that silently matched nothing:**

| Document | gambl / casino / wager | Control |
|---|---|---|
| `stability-api-terms-of-service.txt` (body, header excluded) | 0 / 0 / 0 | "Stability" 31, "Services" 77, "Terms" 38 |
| `stability-ai-acceptable-use-policy.txt` | 0 / 0 / 0 | "Acceptable Use" 14, "sexual" 7 |

**The API route is materially CLEANER than the weights route, and this is the finding
worth carrying.** The Community License that governs self-hosted weights carries two
clauses that the R083 assessment escalated: the "Powered by Stability AI" attribution
requirement, which collides with frame convention (w), and termination of all licences
above USD $1,000,000 annual revenue. **Neither appears in the API Terms of Service.**
Measured on the document body with the provenance header excluded, because the header
itself names both phrases and would otherwise have counted itself:

- `Powered by Stability`: **0**
- `1,000,000`: **0**
- `annual revenue`: **0**

So moving from self-hosted weights to the hosted API does not merely solve the hardware
problem. **It retires R083's E1 and E2 for the art actually generated on this route.**
The Community License remains the governing instrument for anything self-hosted, so those
two escalations stay live if the project ever pulls weights down.

## Cost, derived from the captured pricing

`stability-api-pricing.txt`: 1 credit = USD $0.01. SD 3.5 Large is 6.5 credits, Large
Turbo 4, and the Structure control, which is the registration mechanism the H1 trio needs,
is 5.

| Item | Credits | USD |
|---|---|---|
| One SD 3.5 Large image | 6.5 | $0.065 |
| One Large Turbo image | 4 | $0.040 |
| The calibration seven on Large | 45.5 | **$0.455** |
| Plus two Structure calls for the H1 trio | 55.5 | **$0.555** |

Against the brief's USD $10 session cap that is under six percent. The account also
starts with 25 free credits, which covers about half the seven.

## What this gate does NOT clear

**CLEARED is a licence mark and nothing else.** It does not authorise spending, which is
the owner's under rule 1, and it does not conjure an API key: none is configured on this
machine. See the session report for what remains blocked.
