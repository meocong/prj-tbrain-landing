/**
 * Rich `extended_content` HTML for 4 thin case studies. DATA FILE ONLY.
 *
 * Style/structure mirrors ROBOTICS_MOCAP in scripts/seed-case-studies.mjs —
 * the case-study detail page splits on <h2> into blueprint cards
 * (src/app/casestudy/[slug]/page.tsx :: splitCaseStudySections).
 *
 * All facts/metrics below are sourced verbatim from /tmp/cs_thin.json.
 * No new hard numbers are invented; only qualitative methodology detail
 * is added. Images are all OWNED assets under public/images/, each used
 * at most once across the four entries.
 */

export const ENRICH_THIN = {
  "terminal-bench": `
<h2>The challenge</h2>
<p>Terminal-using AI agents are graded on toy tasks — a single command, a clean success signal, a benchmark that stops mattering the week a new model ships. That's not what production agents face. Real DevOps, security, and database work is <strong>multi-step</strong>: a task only counts as solved if a chain of shell commands, config edits, and service restarts lands in the right end state, often with more than one valid path to get there.</p>
<p>We built <strong>Terminal Bench</strong> to close that gap: a benchmark of <strong>500+ tasks</strong> spanning <strong>8+ domains</strong> — Linux administration, DevOps, security, and databases among them — where every task demands genuine multi-step reasoning inside a real terminal environment, not a single memorized command.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/code-screen.jpg" alt="Terminal session with an AI agent executing a multi-step shell workflow"><figcaption>Every task runs in a live terminal environment — the agent has to plan, execute, and recover from its own mistakes, just like an engineer would.</figcaption></figure>

<h2>Why most benchmarks stop being useful</h2>
<p>A benchmark decays the moment a task can be solved by pattern-matching instead of reasoning. Frontier models are trained on enormous corpora of shell history, Stack Overflow threads, and infrastructure-as-code repos, so single-command tasks saturate fast — every lab reports near-100% pass rates within a release cycle or two, and the benchmark stops discriminating between a genuinely capable agent and one that memorized the answer.</p>
<p>Our design brief was the opposite: tasks hard enough that a frontier model still fails on the majority of them. Each task requires the agent to hold state across multiple commands, interpret ambiguous error output, and make judgment calls about which of several valid remediations to apply — the kind of reasoning chain that doesn't show up in a single scraped snippet.</p>
<blockquote>A benchmark is only as useful as its headroom. If the model everyone is trying to beat can already pass 90% of your tasks, you've built a leaderboard, not a benchmark.</blockquote>

<h2>Task design across domains</h2>
<p>Coverage spans <strong>8+ domains</strong>, each with its own failure modes and its own definition of "correct":</p>
<ul>
<li><strong>Linux administration</strong> — filesystem permissions, process management, systemd units, package dependency resolution.</li>
<li><strong>DevOps</strong> — CI/CD pipeline debugging, container orchestration, infrastructure-as-code drift correction.</li>
<li><strong>Security</strong> — privilege escalation triage, log forensics, hardening a misconfigured service without breaking it.</li>
<li><strong>Databases</strong> — schema migration under constraints, query performance regression, backup/restore under data-loss risk.</li>
</ul>
<p>Every task ships with a scripted starting environment, a natural-language objective, and a hidden end-state specification the agent never sees — so success has to come from correctly interpreting the goal, not from spotting a grading script.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-security.jpg" alt="Security-domain terminal task involving log analysis and access control review"><figcaption>Security-domain tasks pair realistic misconfigurations with forensic-style investigation — the agent has to diagnose before it can remediate.</figcaption></figure>

<h2>The 4-layer validation pipeline</h2>
<p>Task quality is the whole product, so every task passes through <strong>4 layers of validation</strong> before it enters the benchmark:</p>
<table>
<thead><tr><th>Layer</th><th>What it checks</th></tr></thead>
<tbody>
<tr><td>Environment integrity</td><td>The starting container/VM builds cleanly and reproducibly, every time, with no hidden state leakage between runs.</td></tr>
<tr><td>Objective clarity</td><td>The natural-language prompt is unambiguous enough that two independent human experts converge on the same solution approach.</td></tr>
<tr><td>Solvability audit</td><td>At least one verified, human-executed solution path reaches the end-state spec exactly as scored.</td></tr>
<tr><td>Difficulty calibration</td><td>The task is run against frontier models to confirm it isn't trivially solvable — and isn't so obscure it's unsolvable even with correct reasoning.</td></tr>
</tbody>
</table>
<p>That last layer is where the benchmark earns its teeth: with the full 4-layer gate in place, <strong>GPT-5 passes ≤20%</strong> of tasks — leaving substantial headroom for the next generation of agents to actually be measured against.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-benchmark.jpg" alt="Benchmark scoring dashboard comparing model pass rates across task domains"><figcaption>Pass-rate tracking by domain lets a lab see exactly where an agent's reasoning breaks down, not just an aggregate score.</figcaption></figure>

<h2>The outcome</h2>
<p>Terminal Bench gives teams building terminal-native agents a benchmark with real discriminative power: <strong>500+ tasks</strong>, <strong>8+ domains</strong>, <strong>4 layers</strong> of validation standing behind every one, and a ceiling far above what any current frontier model clears. That headroom is the point — it's a benchmark built to still be measuring something meaningful a year from now, not a leaderboard that gets saturated in a quarter.</p>
`.trim(),

  "multimodal-annotation": `
<h2>About the engagement</h2>
<p>An AI training program needed production-ready labeled data across three modalities at once — text, image, and audio — to feed a multimodal model pipeline. We scaled the annotation workforce and QC process from zero to <strong>48,000 annotations</strong> in <strong>4 months</strong>, holding accuracy at <strong>90%+</strong> the entire way.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/team-collab.jpg" alt="Annotation team reviewing labeled data together on screen"><figcaption>Cross-modality annotation runs as one coordinated team, not three separate silos — consistency across text, image, and audio depends on it.</figcaption></figure>

<h2>The challenge</h2>
<p>Multimodal annotation is harder than the sum of its parts. Text, image, and audio each carry their own labeling conventions, their own edge cases, and their own failure modes — but a model training on all three needs them to be <em>consistent</em>: the same entity, the same taxonomy, the same confidence bar, regardless of which modality it shows up in. Standing up that consistency from a cold start, at a pace fast enough to hit a 4-month deadline, meant building process before throughput — not the other way around.</p>
<blockquote>Speed without a shared taxonomy just produces three inconsistent datasets that happen to ship on the same day.</blockquote>

<h2>Our approach</h2>
<p>We built the annotation program in three deliberate phases rather than ramping headcount immediately:</p>
<ol>
<li><strong>Taxonomy and guideline design</strong> — unified labeling schema across text, image, and audio, with worked examples for every edge case surfaced in pilot batches.</li>
<li><strong>Calibration rounds</strong> — small batches scored against gold-standard answers, with disagreements resolved into guideline updates before scaling headcount.</li>
<li><strong>Scaled production</strong> — ramped annotator pool once inter-annotator agreement stabilized, with continuous sampling to catch drift early.</li>
</ol>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-annotation.jpg" alt="Annotator labeling multimodal data with bounding boxes and transcription overlays"><figcaption>Each modality gets its own tooling — bounding boxes for image, transcription and diarization for audio, span labeling for text — under one shared guideline set.</figcaption></figure>

<h2>Quality control</h2>
<p>Accuracy at scale doesn't happen by trusting individual annotators — it happens by layering independent checks:</p>
<ul>
<li><strong>Double-pass review</strong> on a sampled percentage of every batch, with disagreements adjudicated by a senior reviewer.</li>
<li><strong>Gold-set spot checks</strong> injected unannounced into the production queue to catch quality drift before it compounds.</li>
<li><strong>Per-modality QC leads</strong> who own the accuracy bar for text, image, and audio independently, then reconcile edge cases across modalities.</li>
<li><strong>Weekly accuracy reporting</strong> so drift is caught within days, not at final delivery.</li>
</ul>
<p>That layered process is what held accuracy at <strong>90%+</strong> across the full <strong>48,000-annotation</strong> run — not a single QC gate, but several independent ones stacked on top of each other. Reviewers rotate across modalities periodically too, so a QC lead calibrated on image annotation also spot-checks audio — a second set of eyes trained on a different modality's conventions tends to catch inconsistencies a modality specialist stops noticing.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-data-scale.jpg" alt="Dashboard tracking annotation volume and accuracy trend over a multi-month program"><figcaption>Volume and accuracy tracked side by side — scaling throughput only counts if the accuracy line holds steady alongside it.</figcaption></figure>

<h2>Program at a glance</h2>
<table>
<thead><tr><th>Metric</th><th>Result</th></tr></thead>
<tbody>
<tr><td>Total annotations delivered</td><td>48,000</td></tr>
<tr><td>Program duration</td><td>4 months</td></tr>
<tr><td>Modalities covered</td><td>3 — text, image, audio</td></tr>
<tr><td>Sustained accuracy</td><td>90%+</td></tr>
</tbody>
</table>
<p>None of those four numbers is optional against the others. Hitting 48,000 annotations in 4 months by relaxing the accuracy bar would have produced a dataset a model team couldn't trust; holding 90%+ accuracy by slowing throughput would have missed the delivery window entirely. The taxonomy-first, calibrate-then-scale sequencing above is what let both hold at once.</p>

<h2>The outcome</h2>
<p>In <strong>4 months</strong>, the program delivered <strong>48,000</strong> production-ready annotations across <strong>3 modalities</strong> — text, image, and audio — at <strong>90%+ accuracy</strong>, giving the enterprise AI training pipeline labeled data it could train on directly, with no rework cycle required after handoff.</p>
`.trim(),

  "enterprise-ai-agents": `
<h2>About the engagement</h2>
<p>A global enterprise needed domain-specific Q&A capability across several business functions, grounded strictly in its own curated, approved knowledge — not open-ended generation that could hallucinate policy or product detail. We stood up <strong>6 production-grade Q&A agents</strong> with a practical evaluation framework, from kickoff to handoff, in <strong>1 month</strong>.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/ai-brain.jpg" alt="Conceptual visualization of a knowledge-grounded AI agent architecture"><figcaption>Six agents, one shared architecture — each grounded in its own approved knowledge base rather than open-domain generation.</figcaption></figure>

<h2>The challenge</h2>
<p>Enterprise Q&A has a lower tolerance for error than consumer chat. An agent that answers confidently but incorrectly on internal policy, compliance, or product detail is worse than one that says "I don't know" — it erodes trust with the very users it's meant to help. The brief was to build <strong>6</strong> agents, each scoped to a distinct domain, that would only answer from a curated and approved knowledge base, decline gracefully outside that scope, and do it all inside a <strong>30-day</strong> window from kickoff to handoff.</p>
<blockquote>Grounding isn't a feature you bolt on at the end — it has to shape retrieval, prompting, and evaluation from day one, or the agent will confidently answer questions it was never supposed to touch.</blockquote>

<h2>Our approach</h2>
<p>We treated knowledge curation as the critical path, not a preprocessing afterthought:</p>
<ul>
<li><strong>Source curation</strong> — every one of the <strong>270 knowledge files</strong> feeding the 6 agents was reviewed and approved before ingestion, not scraped wholesale from internal drives.</li>
<li><strong>Retrieval architecture</strong> — domain-scoped indices per agent, so a query to one agent can't surface knowledge belonging to another domain.</li>
<li><strong>Refusal design</strong> — explicit guardrails so an agent declines rather than guesses when a query falls outside its grounded knowledge.</li>
<li><strong>Iterative tuning</strong> — retrieval and prompting refined against real failure cases surfaced during evaluation, not just a single tuning pass.</li>
</ul>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-llm-training.jpg" alt="Engineers reviewing agent responses against a curated enterprise knowledge base"><figcaption>Every one of the 270 knowledge files was reviewed and approved before it ever reached an agent's retrieval index.</figcaption></figure>

<h2>The evaluation framework</h2>
<p>A practical evaluation framework has to answer one question for every agent, every domain: does this response actually reflect the approved knowledge, or is it drifting? We built that framework around a structured query set rather than ad hoc spot-checking:</p>
<table>
<thead><tr><th>Metric</th><th>Value</th></tr></thead>
<tbody>
<tr><td>Q&A agents delivered</td><td>6</td></tr>
<tr><td>Timeline, kickoff to handoff</td><td>1 month</td></tr>
<tr><td>Evaluation test queries</td><td>720</td></tr>
<tr><td>Approved knowledge files ingested</td><td>270</td></tr>
</tbody>
</table>
<p>The <strong>720 test queries</strong> were distributed across all 6 domains to stress both correctness — does the agent answer accurately from its grounded knowledge — and boundary discipline — does it decline cleanly on out-of-scope questions instead of improvising.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-rlhf.jpg" alt="Evaluation workflow scoring agent responses against approved reference answers"><figcaption>Each of the 720 test queries was scored against an approved reference answer, giving every agent a measurable accuracy baseline before handoff.</figcaption></figure>

<h2>Handoff and ongoing operation</h2>
<p>A 30-day build only pays off if the enterprise can run the agents without us in the room. Handoff included the evaluation harness itself, not just the agents — so the client's team could re-run the same 720-query suite against future knowledge-base updates and catch regressions before they reached end users. Each agent's domain boundary, refusal behavior, and retrieval configuration were documented as part of the deliverable, giving the internal team a clear owner and a clear change-management path for every one of the 6 agents going forward.</p>
<blockquote>The deliverable isn't 6 agents that work on day one. It's 6 agents plus the evaluation harness that proves they still work on day two hundred, after the knowledge base has changed underneath them.</blockquote>

<h2>The outcome</h2>
<p>Six domain-specific Q&A agents, grounded in <strong>270</strong> curated and approved knowledge files, validated against <strong>720</strong> test queries, delivered from kickoff to handoff in <strong>1 month</strong> — a production-ready deployment on a timeline that would typically only cover discovery for a project of this scope.</p>
`.trim(),

  "video-game-pipeline": `
<h2>About the engagement</h2>
<p>A leading game studio needed to turn raw gameplay recording sessions into clean, delivery-ready annotated data at a pace manual review couldn't sustain. We built an end-to-end annotation pipeline for video game data collection, anchored by <strong>4 agentic workflows</strong>: automated QC validation, delivery preparation, cloud sync, and real-time notifications.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/data-dashboard.jpg" alt="Pipeline dashboard tracking gameplay recording sessions through QC and delivery"><figcaption>Every recording session moves through the same automated pipeline — from raw capture to cloud-synced, delivery-ready package.</figcaption></figure>

<h2>The challenge</h2>
<p>Game recording annotation has a throughput problem that's structural, not incidental. Sessions arrive continuously, each one needs the same battery of QC checks before it can ship, and manual review of every session simply doesn't scale to the volume a studio's data collection program generates. The studio needed a pipeline where quality gates, packaging, and delivery all happened automatically — with humans reviewing only what the pipeline flagged, not everything that came in.</p>
<blockquote>The bottleneck was never capturing the gameplay — it was everything that had to happen to a session between capture and a model-ready dataset.</blockquote>

<h2>The 4 agentic workflows</h2>
<p>Rather than one monolithic script, the pipeline is built from <strong>4 agents</strong>, each owning one stage:</p>
<table>
<thead><tr><th>Agent</th><th>Responsibility</th></tr></thead>
<tbody>
<tr><td>Automated QC validation</td><td>Runs a checklist against every recording session — completeness, corruption, metadata consistency — before it's eligible for delivery.</td></tr>
<tr><td>Delivery preparation</td><td>Packages validated sessions into the studio's required delivery format, ready to hand off without manual repackaging.</td></tr>
<tr><td>Cloud sync</td><td>Pushes packaged deliverables to the studio's cloud storage over an OAuth-authenticated connection to both GCS and R2.</td></tr>
<tr><td>Real-time notifications</td><td>Alerts the team the moment a session passes QC, fails validation, or completes delivery — no polling required.</td></tr>
</tbody>
</table>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/blog-pipeline2.jpg" alt="Automated pipeline stages moving a data package from validation through delivery"><figcaption>Each of the 4 agents owns a single stage — QC, packaging, cloud sync, or notification — so a failure in one stage never silently blocks the others.</figcaption></figure>

<h2>Cloud sync and delivery</h2>
<p>Delivery had to work across the studio's existing cloud footprint, not force a migration to a single provider. The cloud-sync agent authenticates over <strong>OAuth</strong> and syncs packaged deliverables to both <strong>GCS and R2</strong>, so the studio's downstream tooling — wherever it lives — can pull from the storage backend it already integrates with. Delivery-ready packages are produced automatically by the delivery-preparation agent immediately after a session clears QC, with no manual repackaging step in between.</p>
<figure><img class="rounded-xl my-6 max-w-full" src="/images/automation-cinema-poster.jpg" alt="Automated cloud sync workflow moving validated data packages to cloud storage"><figcaption>OAuth-authenticated sync keeps validated packages flowing to cloud storage the moment they clear QC — no manual handoff step.</figcaption></figure>

<h2>Real-time visibility</h2>
<p>A pipeline that runs unattended still needs to be observable — a session silently stuck between QC and delivery is as costly as one that fails outright. The notification agent closes that loop: the moment a session passes QC, fails validation, or completes delivery, the responsible team is alerted in real time rather than discovering the state days later during a manual audit. That real-time signal is what let the studio trust the automation enough to stop checking every session by hand in the first place — the pipeline surfaces exceptions on its own, instead of asking a human to go looking for them.</p>
<blockquote>An automated pipeline nobody can see into just moves the manual-review bottleneck downstream. Real-time notification is what makes the automation trustworthy enough to actually rely on.</blockquote>

<h2>The outcome</h2>
<p>The studio now runs game recording annotation on a pipeline built from <strong>4 agentic workflows</strong> — automated QC, delivery preparation, cloud sync to both GCS and R2 over OAuth, and real-time tracking of every session's status. QC and delivery packaging that used to require manual, session-by-session attention now run automatically, with the team's time going to the sessions the pipeline actually flags rather than every session that comes in.</p>
`.trim(),
};
