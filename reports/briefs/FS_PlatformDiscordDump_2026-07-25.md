# Platform announcements relayed from Discord, 2026-07-25

Saved verbatim per conventions (b) and (f). Relayed by the owner from the Stake Engine
Discord. Timestamps as given.

---

**[25/7/2026 1:52 am] JJJTTT:** [ Photo ]

🇪🇺 Upcoming Platform: Stake EU & New Currency Support

We're getting ready to launch Stake EU, which introduces support for a new currency: XEC.

What you need to do

To be eligible for release on Stake EU, your games must support the XEC currency. Games that don't support it won't be released on the platform.

If you have existing games that don't currently support XEC, you can update them. Once updated, we'll be able to add them to the Stake EU platform.

How XEC is displayed

Internally, the currency code used is XEC. However, players will not see XEC in-game.

Just like Stake US, the currency will be displayed using the SC format (e.g. SC 1,000). Your game should use the provided display information rather than showing the raw currency code to players.

Social Mode

Similar to Stake US, games released on Stake EU will have social set to true.

Future-proofing

We're also likely to introduce additional sweepstakes-style currencies in the future. These wi

**[25/7/2026 1:53 am] JJJTTT:** We have a new cap on outcomes per mode, modes must not exceed 10 million outcomes. If you have existing games on the platform they will need to be updated. Not a lot of people will be affected.

I apologies for the suddeness of this but it was causing us a lot of issues.

Please reach out of you need any support 🙂

**[25/7/2026 1:53 am] JJJTTT:** Added a new page which explains the different payment methods, if you see somebody asking a question in regards to payments feel free to show them this 🙂

https://stake-engine.com/docs/payments

**[25/7/2026 1:53 am] JJJTTT:** Hello everyone,

I have returned to provide a quick message regarding approval guidelines for RTP limits.
In order to comply with an ongoing disagreement with a provider on Stake, we are required to enforce a new RTP range: for new game submissions going forward, the required math range for all modes must fall within the range 90.0% —> 96.70%

Note that this will not be applied retroactively, and does not need to be altered for games currently live or in review. It will just apply to new submissions and will be one of the automatic verifications to be made before publishers request a review for their games.

This will come into effect shortly with the next deploy, but wanted to give a bit of forewarning, and we'll provide any updates should this position change in the future.

**[25/7/2026 1:54 am] JJJTTT:** Roadmap updates.

We haven't really shared much about our roadmap in the past. Historically we've always moved very quickly and didn't really operate with a fixed plan. That's now changed a bit, we've come together and aligned on where we want to focus going forward.

Onboarding additional operators

Our games have always been exclusive to Stake. However, given the volume of games we've shipped and the growing demand from other operators wanting access to our top titles, we'll be expanding beyond Stake.

There's still a lot here that's not fully locked in and will evolve over time. If you've got questions, feel free to ask.

Game regulation

Stake has made a strong push into regulated markets, and we want to follow that direction by getting as many of our games regulated as possible so they can be released on those platforms.

Which games get regulated is still undecided. We're currently working through the process, including how it works, what it costs, and who covers what.

Minor rebrand

As we start forming partnerships with other operators, we'll be moving away from Stake-specific branding.

More details on this will come as things progress.

Stateful games

This has been a long-standing focus for us, but it's going to take longer than originally expected due to a shift in priorities.

We believe the items above will deliver more value to the community in the shorter term, so we're focusing our attention there first.

**[25/7/2026 1:56 am] JJJTTT:** # Introducing Stake Dev Tool 2.0

After days of work, Stake Dev Tool 2.0 is finally here. It's the biggest update since launch: the desktop app becomes a full cloud platform, and everything stays 100% open source.

What's new:

Web workbench
The multi-resolution test view now runs in the browser. No install needed for math devs, QA or PMs.

New share links
Every link is now a real hosted game on its own <slug>.play. subdomain, backed by a real server-side RGS. Your math files never leave the server.

Playable demos on your own domain
Attach a custom domain to your workspace and your games run on it, like play.yourstudio.com. That means you can put live demos directly on your own website, the way Hacksaw or Pragmatic do, without managing any infra yourself.

Math revisions
Immutable snapshots of your math. Only changed files get uploaded, and every push generates a changelog: RTP per mode, max win, modes added or removed.

`sdt` CLI
Push math straight from your CI with sdt push ./math/my-game.

Workspaces and team sync
Roles, email invites, live sync of profiles, saved rounds and bookmarks. A math push no longer breaks your bookmarks.

Self-hosting
Everything runs with a single docker compose up, all features included, free forever.

Pricing
The cloud is 3€/month for the first seat and 2€/month per additional seat, with 2 months free if you go yearly. The subscription pays for hosting on our infra, nothing else. This price will never go up, and it will probably even go down in the coming months.

The desktop app keeps working exactly as before. The old GitHub-based team sync is gone, replaced by cloud workspaces.

And this is only the beginning: a lot more features are landing in the coming days.

Try it: ht tps://app.stakedevtool. com
Source and docs: https://github.com/Stake-Dev-Tool/stake-dev-tool
Website: htt ps://stakedevtool. com

Feedback and bug reports are very welcome.

**[25/7/2026 1:57 am] JJJTTT:** i believe you are looking for this sir
https://github.com/StakeEngine/web-sdk

**[25/7/2026 1:59 am] JJJTTT:** https://github.com/egorfedorov/claude-context-optimizer

**[25/7/2026 2:00 am] JJJTTT:** https://stake-engine.com/docs/approval-guidelines - Read this
 https://github.com/StakeEngine/docs
https://github.com/StakeEngine/ts-client/
https://github.com/StakeEngine/web-sdk/

**[25/7/2026 2:44 am] JJJTTT:** ## v1.3.1 release

Hi, thank you for the feedback, that shaped new update now!

### New Helpful Tool - Event Finder

Now you can export all needed for review process event ids in one tick (bottom in overview section), for every mode! You also can change searchable payout multiplier for look on different wins

### Other updates
- Added drag & drop feature in launcher for publish_files folder  (thanks <@799656000981303328> )
- Optimizer bounded to 98% RTP (thanks <@387683293254123545> )

https://github.com/mnemoo/tools/releases/tag/v1.3.1
