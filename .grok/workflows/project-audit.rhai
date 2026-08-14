let meta = #{
    name: "project-audit",
    description: "Stand-back audit: eight read-only lenses, then cluster, then refute",
    phases: [
        #{ title: "Discover", detail: "one read-only lens each" },
        #{ title: "Cluster", detail: "marshal findings into clusters" },
        #{ title: "Verify", detail: "one skeptic per cluster, told to refute" },
    ],
    when_to_use: "Stand-back project audit of Future Spinner at the repository root",
};

let findings_schema = #{
    "type": "object",
    "required": ["findings", "lost", "tree_clean_after", "git_status"],
    "properties": #{
        "findings": #{
            "type": "array",
            "maxItems": 6,
            "items": #{
                "type": "object",
                "required": ["id", "lens", "claim_type", "severity", "file", "line", "issue", "evidence", "already_known"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "lens": #{ "type": "string" },
                    "claim_type": #{ "type": "string" },
                    "severity": #{ "type": "string" },
                    "file": #{ "type": "string" },
                    "line": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "already_known": #{ "type": "string" },
                },
            },
        },
        "lost": #{ "type": "boolean" },
        "tree_clean_after": #{ "type": "boolean" },
        "git_status": #{ "type": "string" },
        "notes": #{ "type": "string" },
    },
};

let cluster_schema = #{
    "type": "object",
    "required": ["clusters", "dropped_count", "notes"],
    "properties": #{
        "clusters": #{
            "type": "array",
            "maxItems": 16,
            "items": #{
                "type": "object",
                "required": ["id", "title", "claim_type", "member_ids", "file", "issue", "evidence"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "claim_type": #{ "type": "string" },
                    "member_ids": #{ "type": "string" },
                    "file": #{ "type": "string" },
                    "issue": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                },
            },
        },
        "dropped_count": #{ "type": "number" },
        "notes": #{ "type": "string" },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["real", "reason", "evidence", "nearby_unrecorded", "tree_clean_after"],
    "properties": #{
        "real": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
        "nearby_unrecorded": #{ "type": "string" },
        "tree_clean_after": #{ "type": "boolean" },
    },
};

fn rules() {
    let s = "";
    s += "Repository root is /Users/jt/math-sdk. Work only there.\n";
    s += "READ ONLY. Use read_file, grep, list_dir, and bash that only reads (git status, git log, git ls-files, head, wc).\n";
    s += "Do not edit, write, commit, or push anything.\n";
    s += "Do not run any project script that writes. That includes anything named _gate, _proof, _conformance, npm run build, npm run owner:preview, and any script under frontend/scripts/. Reading those scripts as TEXT is encouraged.\n";
    s += "If you must execute a check, copy it to /tmp outside the repository and say so. Prefer not to.\n";
    s += "At the END run: git status --porcelain. Put the exact output in git_status. tree_clean_after is true only if that output is empty.\n";
    s += "Locked paths, read but never propose edits: frontend/src/lib/services/rgsService.ts, frontend/src/lib/stores/gameStore.ts, games/future_spinner/, .claude/settings.json.\n";
    s += "Maths package is out of scope. Do not treat books, lookup tables, or game_config.py as defects to fix.\n";
    s += "claim_type must be observation (a checkable fact: this file says X, HEAD says Y) or hypothesis (a proposed cause). Never blend them. Diagnoses are hypotheses until reproduced.\n";
    s += "Cite file:line or a command for every claim. If you cannot cite it, do not report it.\n";
    s += "An empty findings list is valid ONLY after you have opened the named starting files and searched. Saying you found nothing without tool use is a failed job.\n";
    s += "If a finding already has a tracker or charter row, set already_known to that id (TR-NNN or Q-NN). Otherwise already_known is none.\n";
    s += "Cap at 6 findings. Prefer new, current, load-bearing defects over restating known parked rows. If you only rediscover known rows, report the two most stale status claims instead.\n";
    s += "Do not use em dashes or en dashes in any output.\n";
    s += "lost is true only if you could not complete the sweep. Otherwise false.\n";
    s
}

fn discover_prompt(lens, hunt) {
    let s = "";
    s += rules();
    s += "\nYOUR LENS: ";
    s += lens;
    s += "\n";
    s += hunt;
    s += "\nReturn at most 6 findings. Each id like ";
    s += lens;
    s += "-01. severity is high, medium, or low. line is a number or a range as a string.\n";
    s += "Write the durable list of findings first, before any extra reading, once you have at least one cited item or a justified empty list.\n";
    s
}

let lens_names = [
    "scaffold",
    "duplicated",
    "shipped",
    "inventory",
    "drift",
    "disposition",
    "harness",
    "uncovered",
];

let lens_hunts = [
    "Hunt scaffold residue that survived: Vite or starter defaults, package-name titles, template CSS, example assets, TODO TBD FIXME Lorem, unused starter files, stock indigo or #242424 leftovers in frontend/src/app.css, comments that ship in dist/index.html. Start at frontend/index.html, frontend/src/app.css, frontend/src/main.ts, frontend/package.json, frontend/src/App.svelte. Confirm against frontend/dist if the file exists; do not rebuild.",
    "Hunt one idea implemented twice that has drifted. Highest-yield lens. Money formatting, bet ladder, buy affordability, win count-up, locale lookup, mode cost, fit/abbreviate of money, evidence path helpers, apostrophe form. Compare sibling modules under frontend/src/lib/stores, frontend/src/lib/utils/currency.ts, frontend/src/lib/i18n, and components that render the same figure. Report only pairs whose values or rules disagree, with both file:line citations.",
    "Hunt committed versus shipped. Authority is the artefact. Compare frontend/public and frontend/src against frontend/dist (build-info.json already exists at HEAD 90f21280, v10, 77 files, 12336028 bytes). Look for files in dist with no source, source assets that do not ship, untracked-style leftovers copied by Vite from public/, and scripts or docs that claim a bundle size or file count that disagrees with build-info.json. Do not run a build.",
    "Hunt inventory drift. Walk the top level of the repo and frontend/src, frontend/public, frontend/scripts, docs/, reports/, design-system/, games/. For each surprising directory answer: what is it, does it ship, who owns it, what re-proves it. Report only orphans, two owners, or a ship/no-ship contradiction. git ls-files games/ should show only games/README.md and games/future_spinner/. Confirm that claim.",
    "Hunt document drift. Load-bearing docs versus HEAD. Must open: reports/SESSION_REPORT.md (does it describe the latest work, latest archive is reports/archive/2026-08-15_r070-docs-mirror.md), docs/QUALITY_CHARTER.md section 5.3, GAME_FACTS.md, OWNER_CHECKLIST.md, COMPLIANCE_WATCH.md newest entries, reports/audit/AUDIT_CLOSURE_2026-08-10.md open items, CLAUDE.md true-game-facts versus frontend/src/lib/config/fsModes.ts. Report present-tense claims the tree contradicts. Do not paraphrase compliance limits.",
    "Hunt disposition lies. Open docs/records/reviews/REVIEW_TRACKER.md and reports/qa/stream_test/KNOWN_OPEN.md. For each row whose status cell contains OPEN, check whether HEAD already fixed it. Also check CLOSED rows whose own evidence paragraph still describes the defect as present. Report stale status, not the original defect, unless the defect is still live. Cite the tracker line and the current file:line that confirms or refutes it. Cap at the worst six stale rows.",
    "Hunt harness reconnaissance. How does a later session drive this app and this gate estate. Open frontend/package.json scripts, .github/workflows/checks.yml, frontend/scripts/lib/evidencePaths.mjs, frontend/scripts/README.md. Report: how to boot locally, which CI jobs exist, which proof or conformance scripts still write into committed reports/ or reports/screens/ without importing evidencePaths (TR-090 and TR-097 class), and any harness that cannot be run without dirtying the tree. Do not execute those scripts.",
    "Hunt the four never-swept surfaces as INVENTORY, not as a quality verdict. Audio: list shipped rows under frontend/public and what audio_verify.mjs claims. Social mode: how it is forced, which files swap vocabulary, whether a committed proof set exists. Accessibility: what a11y_social_terms_check.mjs covers and what it does not (focus, keyboard, screen reader). Animation: what reel_v3_proof.mjs gates (frame rate) versus quality or timing. Report gaps as observations (no proof path exists), not as diagnoses of bad audio or bad motion.",
];

phase("Discover");
log("Launching eight read-only discovery lenses");

let jobs = [];
let i = 0;
while i < 8 {
    jobs.push(#{
        prompt: discover_prompt(lens_names[i], lens_hunts[i]),
        label: "discover:" + lens_names[i],
        capability_mode: "read-only",
        agent_type: "explore",
        output_schema: findings_schema,
    });
    i += 1;
}

let results = parallel(jobs);

let findings = [];
let lost_lenses = [];
let dirty_lenses = [];
let i2 = 0;
while i2 < 8 {
    let r = results[i2];
    if r == () || !r.success {
        lost_lenses.push(lens_names[i2]);
    } else {
        if r.output.lost == true {
            lost_lenses.push(lens_names[i2]);
        }
        if r.output.tree_clean_after == false {
            dirty_lenses.push(lens_names[i2]);
        }
        if r.output.findings != () {
            for f in r.output.findings {
                findings.push(f);
            }
        }
    }
    i2 += 1;
}

log("Discovery returned " + findings.len().to_string() + " findings; lost lenses: " + lost_lenses.len().to_string() + "; dirty: " + dirty_lenses.len().to_string());

if findings.len() == 0 {
    let empty = write_scratch_file("audit-report.md", "No findings returned. Lost lenses: " + lost_lenses.len().to_string());
    complete(#{
        summary: "No findings. Lost " + lost_lenses.len().to_string() + " lenses.",
        findings_count: 0,
        lost_lenses: lost_lenses,
        dirty_lenses: dirty_lenses,
        confirmed: [],
        path: empty,
    });
}

phase("Cluster");
log("Marshalling " + findings.len().to_string() + " findings into at most 16 clusters");

let marshal_prompt = "";
marshal_prompt += "You are a READ-ONLY marshal. Cluster these audit findings. Do not invent new findings.\n";
marshal_prompt += "Repository is /Users/jt/math-sdk. You may open cited files to decide whether two findings are the same defect.\n";
marshal_prompt += "Do not run project scripts. Do not edit anything.\n";
marshal_prompt += "Return at most 16 clusters. Merge duplicates. Prefer clusters that are NEW and current over known parked rows.\n";
marshal_prompt += "If more than 16 remain after merge, drop the lowest severity and set dropped_count to how many findings were not placed.\n";
marshal_prompt += "claim_type on a cluster is observation if every member is an observation, otherwise hypothesis.\n";
marshal_prompt += "member_ids is a comma-separated list of finding ids.\n";
marshal_prompt += "file and issue and evidence come from the strongest member.\n";
marshal_prompt += "FINDINGS JSON:\n";
marshal_prompt += json_encode(findings);

let marshalled = agent(marshal_prompt, #{
    label: "marshal:clusters",
    capability_mode: "read-only",
    agent_type: "explore",
    output_schema: cluster_schema,
});

let clusters = [];
let dropped_count = 0;
if marshalled != () && marshalled.success && marshalled.output.clusters != () {
    for c in marshalled.output.clusters {
        clusters.push(c);
    }
    if marshalled.output.dropped_count != () {
        dropped_count = marshalled.output.dropped_count;
    }
} else {
    log("Marshal failed or returned nothing; falling back to first 12 raw findings");
    let n = findings.len();
    if n > 12 {
        n = 12;
        dropped_count = findings.len() - 12;
    }
    let j = 0;
    while j < n {
        let f = findings[j];
        clusters.push(#{
            id: "fallback-" + (j + 1).to_string(),
            title: f.issue,
            claim_type: f.claim_type,
            member_ids: f.id,
            file: f.file,
            issue: f.issue,
            evidence: f.evidence,
        });
        j += 1;
    }
}

if clusters.len() == 0 {
    complete(#{
        summary: "Marshal produced zero clusters.",
        findings_count: findings.len(),
        lost_lenses: lost_lenses,
        confirmed: [],
    });
}

phase("Verify");
log("Verifying " + clusters.len().to_string() + " clusters; dropped " + dropped_count.to_string());

let vjobs = [];
for c in clusters {
    let vp = "";
    vp += "You are an ADVERSARIAL verifier. Your job is to REFUTE this audit cluster. Default real=false when uncertain.\n";
    vp += "Repository root is /Users/jt/math-sdk. READ ONLY. Do not edit. Do not run any project script that writes. Reading scripts as text is fine.\n";
    vp += "Independently open the cited file and the surrounding tree. Do not trust the finding text.\n";
    vp += "Set real=true only if you reproduced the observation from source yourself and it is still true at HEAD.\n";
    vp += "If the cited cause is unsound but a real defect exists nearby, set real=true, say the cause is unsound, and put the nearby defect in nearby_unrecorded. That is the point of this job.\n";
    vp += "If this is already a known parked or closed row whose status is correctly recorded, set real=false and say it is already dispositioned.\n";
    vp += "A stale CLOSED or OPEN label is itself a real finding if you prove the label disagrees with HEAD.\n";
    vp += "At the end run git status --porcelain and set tree_clean_after from it.\n";
    vp += "Do not use em dashes or en dashes.\n";
    vp += "CLUSTER JSON:\n";
    vp += json_encode(c);
    vjobs.push(#{
        prompt: vp,
        label: "verify:" + c.id,
        capability_mode: "read-only",
        agent_type: "explore",
        output_schema: verdict_schema,
    });
}

let verdicts = parallel(vjobs);

let confirmed = [];
let refuted = [];
let unverified = [];
let k = 0;
for v in verdicts {
    let c = clusters[k];
    if v == () || !v.success || v.output.evidence == () || v.output.evidence == "" {
        unverified.push(c);
    } else if v.output.real == true {
        confirmed.push(#{
            id: c.id,
            title: c.title,
            file: c.file,
            issue: c.issue,
            reason: v.output.reason,
            evidence: v.output.evidence,
            nearby_unrecorded: v.output.nearby_unrecorded,
            claim_type: c.claim_type,
        });
    } else {
        refuted.push(#{
            id: c.id,
            title: c.title,
            file: c.file,
            reason: v.output.reason,
            nearby_unrecorded: v.output.nearby_unrecorded,
        });
    }
    k += 1;
}

let report = "";
report += "# Stand-back audit workflow result\n\n";
report += "Findings in: ";
report += findings.len().to_string();
report += "\nClusters verified: ";
report += clusters.len().to_string();
report += "\nConfirmed: ";
report += confirmed.len().to_string();
report += "\nRefuted: ";
report += refuted.len().to_string();
report += "\nUnverified: ";
report += unverified.len().to_string();
report += "\nLost lenses: ";
report += lost_lenses.len().to_string();
report += "\nDirty lenses: ";
report += dirty_lenses.len().to_string();
report += "\nDropped from verify: ";
report += dropped_count.to_string();
report += "\n";
let report_path = write_scratch_file("audit-report.md", report);

log(confirmed.len().to_string() + "/" + clusters.len().to_string() + " clusters survived verification");

complete(#{
    summary: confirmed.len().to_string() + " confirmed of " + clusters.len().to_string() + " clusters",
    findings_count: findings.len(),
    cluster_count: clusters.len(),
    confirmed: confirmed,
    refuted: refuted,
    unverified: unverified,
    lost_lenses: lost_lenses,
    dirty_lenses: dirty_lenses,
    dropped_count: dropped_count,
    path: report_path,
});
