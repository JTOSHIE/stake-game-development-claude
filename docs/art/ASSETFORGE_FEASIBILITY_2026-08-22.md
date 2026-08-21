# AssetForge: local SD 3.5 feasibility, and the STOP

**R083 TASK 1. Verdict: LOCAL GENERATION IS IMPRACTICAL ON THIS MACHINE.** The brief's
own instruction on that finding is to stop and report a costed cloud alternative running
the same weights, so no pipeline was stood up, no weights were fetched, and TASK 2 did not
run. What follows is the assessment, then three independent blockers, then the alternative.

## 1. The machine, measured

| Property | Value | How it was read |
|---|---|---|
| Model | MacBook Air, Mac17,3 | `system_profiler SPHardwareDataType` |
| Chip | Apple M5, 10 cores (4 performance, 6 efficiency) | same |
| GPU | Apple M5, 10 cores, Metal 4 | `system_profiler SPDisplaysDataType` |
| Unified memory | 32 GB (34,359,738,368 bytes) | `sysctl hw.memsize` |
| Free plus inactive at assessment | 11.5 GB | `vm_stat`, 16 KB pages |
| Swap already in use | **2.09 GB of a 3.00 GB file** | `sysctl vm.swapusage` |
| Free disk | 239 GB | `df -h /` |
| Cooling | **Passive. The Air has no fan.** | product class |
| torch availability | `torch 2.13.0` resolves for cp314 in `env/` | `pip install --dry-run` |

The toolchain is NOT the blocker: torch installs. Memory, sustained throughput and the
gate on the weights are.

## 2. Why 32 GB does not hold SD 3.5 Large

Published component sizes for the fp16 release, which is the reference precision a
calibration pass has to run at:

| Component | Parameters | fp16 |
|---|---|---|
| MMDiT transformer | 8.1B | 16.2 GB |
| T5-XXL text encoder | 4.7B | 9.4 GB |
| CLIP-G | 0.69B | 1.39 GB |
| CLIP-L | 0.12B | 0.25 GB |
| VAE | small | 0.17 GB |
| **Resident total** | | **about 27.4 GB** |

Against 32 GB of UNIFIED memory that is also holding macOS, the working set and the
framebuffer, on a machine already 2.09 GB into swap before anything was loaded. It does
not fit at fp16. It fits only by quantising the transformer or by sequential CPU offload,
and both are the wrong instrument for this particular job:

**A calibration pass exists to let the owner judge whether the model can hit the quality
bar.** Running it through int8 or nf4 quantisation, or through an offload path that
reloads encoders between images, produces output that is not representative of SD 3.5
Large. The eye-call would then be made on a degraded proxy, and a measurement taken with a
broken instrument is a broken measurement, which is convention (m) exactly. If the answer
came back "not good enough" nobody could tell the model from the quantiser.

## 3. Expected seconds per image, and why this figure is DERIVED and not MEASURED

**It could not be measured, because the weights are gated (blocker B below), so it is
reported as an estimate with its basis rather than as a fact.** Convention (m): a number
carries a checkable source or it is reported as not known.

Basis: the M5 base GPU has 10 cores. Published community timings for SD 3.5 Large at
1024x1024 and about 28 steps on Apple silicon cluster around 40 to 60 seconds on an M4 Max
with a 40-core GPU. Scaling by GPU core count alone, and assuming the model is memory
resident, gives a floor of roughly **3 to 4 minutes per image**. It will be worse than the
floor here, because the model is NOT resident: offload and swap add per-image reload, and
the Air throttles under sustained GPU load with no fan to shed it. A realistic working
figure is **6 to 15 minutes per image at 1024x1024**, with Large Turbo at 4 steps faster in
diffusion but still paying the reload.

**And the brief asks for a twice-delivery-size render, which is the harder half.** SC-01
delivers at 1920x1080, so twice is 3840x2160: 8.3 megapixels against the roughly 1
megapixel SD 3.5 was trained at. That is about eight times the compute of a 1024x1024
image AND far outside the training distribution, where the model produces repeated
structures and geometry drift rather than more detail. The correct method is to generate
near 1 megapixel and upscale, which is a change to the brief's method and is flagged here
rather than made unilaterally.

Seven calibration images at those rates is a multi-hour thermally throttled run for output
that would not represent the model. That is the impracticality.

## 4. Three independent blockers, any one of which stops TASK 1

**A. Memory and throughput.** Section 2 and 3 above.

**B. THE WEIGHTS ARE GATED, AND OPENING THE GATE IS AN OWNER ACTION.** Verified first-hand:

```
GET https://huggingface.co/stabilityai/stable-diffusion-3.5-large/raw/main/LICENSE.md
HTTP 401
"Access to model stabilityai/stable-diffusion-3.5-large is restricted.
 You must have access to it and be authenticated to access it. Please log in."
```

Even the licence file is behind it. Access needs a HuggingFace account (none is configured
on this machine: no `HF_TOKEN`, no token in `~/.cache/huggingface`) AND acceptance of the
Stability Community License on the model page. Accepting a licence agreement and operating
an account are owner actions under rule 1, and a session does not click them on the owner's
behalf. **This blocker applies to the cloud alternative too:** the same gate stands
wherever the weights are pulled.

**C. The licence needs a Fable ruling before generation, and it has two live issues.**
Section 5.

## 5. Licence vetting, done first-hand

Both documents are captured verbatim under `docs/licences/stability/2026-08-22/` per
convention (l), in the same dated-capture shape as the Google Gemini dossier.

**The good result: real-money gambling is NOT restricted.** The Acceptable Use Policy,
which the licence incorporates by reference, contains zero occurrences of "gambl",
"casino", "wager", "betting", "real money" or "lottery". Verified with a working control on
the same file ("Acceptable Use" 14 hits, "sexual" 7 hits), so the zero is a real absence
and not a broken grep. Outputs are ours: *"You own any outputs generated from the Models or
Derivative Works to the extent permitted by applicable law."*

**ISSUE 1, ATTRIBUTION AGAINST CONVENTION (w).** The licence requires the licensee to
*"prominently display 'Powered by Stability AI' on a related website, user interface,
blogpost, about page, or product documentation."* Frame convention (w) says the
platform-mandated General Disclaimer is the SOLE sanctioned occurrence of third-party
branding in shipped text. A "Powered by Stability AI" line in the game UI would be a second
one. The requirement is a disjunction, so werollspinners.com or the product documentation
satisfies it without touching the game, but which surface carries it is a ruling, not a
builder's choice.

**ISSUE 2, THE REVENUE CLIFF.** *"If at any time You or Your Affiliate(s)...generate more
than USD $1,000,000 in annual revenue...any licenses granted to You under this Agreement
shall terminate."* Above it, *"You must request a license from Stability AI, which
Stability AI may grant to You in its sole discretion."* For a studio whose product is a
slot game this is a live commercial risk on a success case, and "sole discretion" means it
is not a formality. Output ownership survives, but the right to keep generating does not.

## 6. The costed cloud alternative, same weights

Same model, same precision, on a rented GPU. **Rates below are indicative list prices and
MUST be confirmed at purchase; they are not quoted from a captured source and are reported
as estimates per convention (m).**

| GPU | VRAM | Fits SD 3.5 Large fp16 | Indicative on-demand |
|---|---|---|---|
| RTX 4090 | 24 GB | Yes, with T5 in fp8 | about USD 0.30 to 0.75 per hour |
| L40S | 48 GB | Yes, comfortably | about USD 1.00 to 1.60 per hour |
| A100 80 GB | 80 GB | Yes, headroom for LoRA | about USD 1.50 to 2.50 per hour |
| H100 | 80 GB | Yes, fastest | about USD 2.50 to 4.00 per hour |

At 24 GB or more the model is resident and a 1024x1024, 28-step image lands in the low tens
of seconds rather than minutes.

**Recommended shape for the calibration pass:** a single 24 GB class instance, hourly, for
one session. Setup, weight pull and the seven renders with a few re-rolls is realistically
**2 to 4 hours**, so on the order of **USD 2 to 6 at the 4090 rate, or USD 4 to 8 on an
L40S.** Storage of the weights between sessions is the only standing cost and is small.

**For the LoRA training that FOR THE NEXT SESSION anticipates**, step up to 48 GB or 80 GB.
A LoRA over a 30-file approved set is hours, not days, so a single-figure to low-double
figure dollar amount per training run at those rates.

**No other provider and no other model was evaluated**, per the brief's instruction that
anything else needs a Fable licence ruling first. The above is the same weights under the
same Stability Community License, so section 5's two issues ride along unchanged.

## 7. What the owner is asked to decide

1. **Cloud or not**, and if yes, which class. The weights gate (blocker B) has to be opened
   by the owner either way, on the owner's HuggingFace account.
2. **Issue 1**, which surface carries "Powered by Stability AI". Recommendation:
   werollspinners.com and the product documentation, never the game UI, which keeps
   convention (w) intact.
3. **Issue 2**, whether the $1,000,000 termination clause is acceptable for shipped art, or
   whether an Enterprise conversation happens before the art is generated rather than after
   the game succeeds.
4. **The twice-delivery-size method**, which should become generate-near-1MP-then-upscale
   for the reasons in section 3.
