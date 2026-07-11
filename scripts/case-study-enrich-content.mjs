/**
 * Enriched `extended_content` HTML for 3 existing case studies.
 * DATA ONLY — no DB writes here. A separate seeder is responsible for
 * applying this content (mirrors the pattern in scripts/seed-case-studies.mjs).
 *
 * Style/structure follows the ROBOTICS_MOCAP template in seed-case-studies.mjs:
 * the detail page splits on <h2> into blueprint cards, so each case study is
 * a sequence of <h2> sections using h3/p/ul/ol/blockquote/table/figure+figcaption.
 *
 * All facts, metrics, and numbers below were sourced from the current DB
 * content (/tmp/cs_current.json) and preserved verbatim — this file adds
 * qualitative process depth and imagery, not new hard numbers.
 *
 * Images used (each owned asset appears in at most one case study):
 *  - agent-evaluation: blog-coding.jpg, blog-benchmark.jpg, blog-inline-code.jpg
 *  - manufacturing: automation-cinema-poster.jpg, blog-pipeline2.jpg, data-dashboard.jpg
 *      (plus the existing embedded /api/asset/cms/... figures, kept as-is)
 *  - scalable-multimodal: scientist-lab.jpg, blog-inline-lab.jpg, blog-annotation.jpg
 */

const AGENT_EVALUATION = `
<h2>About the client</h2>
<p>A <strong>global enterprise</strong> operating across healthcare, finance, telecom, and education engaged Tbrain to stand up domain-specific Q&amp;A agents and a practical evaluation framework its own teams could operate after handoff. The brief prioritized three things equally: <strong>realism, safety, and speed to value</strong> — agents that behave like they were trained on the client's real operating knowledge, not a sanitized demo corpus.</p>

<h2>The challenge</h2>
<p>The target was <strong>6 production-grade agents</strong>, each grounded in authentic, approved knowledge, plus a turnkey evaluation package the client could run in-house — inside a single <strong>1-month</strong> window from kickoff to handoff. Every agent had to refuse clearly when evidence was absent, with every expected answer traceable to a specific source passage.</p>
<h3>Timeline and scale</h3>
<ul>
<li><strong>4 weeks</strong> to deliver, end to end.</li>
<li>At least <strong>45 files</strong> curated per agent — <strong>270 files</strong> across the program.</li>
<li><strong>120 prompts</strong> authored per agent — <strong>720 test queries</strong> in total.</li>
</ul>
<h3>Evaluation requirements per agent</h3>
<ul>
<li><strong>100 answerable prompts</strong>, each strictly resolvable from the agent's own corpus.</li>
<li><strong>20 unanswerable prompts</strong>, purpose-built to validate safe refusal behavior.</li>
</ul>
<p>Each corpus mixed document formats — <strong>PDF, DOCX, PPTX, XLSX/CSV, HTML</strong>, and SharePoint pages — with layout variety real knowledge bases contain: nested headings, footnotes, long tables, embedded charts, scanned images. Files ranged small to large, so no agent could over-fit to one document shape.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-coding.jpg" alt="Engineer reviewing structured source documents on screen">
<figcaption>Corpus curation ran document-by-document — normalizing formats, stripping duplicates, and preserving the layout cues an agent needs to cite correctly.</figcaption>
</figure>
<p>The query set had to feel human: fact-seeking, procedural, comparison, multi-part, and hypothetical questions, seeded with realistic noise — misspellings and domain-term paraphrases. A meaningful share required combining evidence across <strong>2, 5, and 10+ documents</strong> at once, where most agents quietly fail.</p>

<h2>Tbrain's approach</h2>
<p>Tbrain ran a <strong>pod-based operating model</strong>: multiple teams working in parallel across the six domains, each producing to the same rubric so quality stayed uniform as throughput scaled.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-benchmark.jpg" alt="Dashboard showing benchmark scores across evaluation categories">
<figcaption>Every pod tracked against the same benchmark dashboard, so drift in one domain was visible before it reached delivery.</figcaption>
</figure>
<ol>
<li><strong>Corpus curation</strong> — authentic documents sourced, normalized, and deduplicated.</li>
<li><strong>Query generation</strong> — roughly 120 realistic prompts authored per agent.</li>
<li><strong>Ground-truth mapping</strong> — span-level evidence attached to every answerable query.</li>
<li><strong>Quality review</strong> — rubric alignment, inter-rater checks, and policy verification.</li>
<li><strong>Final packaging</strong> — test-ready bundles approved by team leads for immediate handoff.</li>
</ol>

<h2>Evaluation rubric and QC</h2>
<p>Every agent response is compared against the approved corpus and scored into exactly one of three outcomes — there is no partial credit that hides a grounding failure.</p>
<table>
<thead><tr><th>Outcome</th><th>Definition</th><th>Reviewer action</th></tr></thead>
<tbody>
<tr><td>Correct</td><td>Answer matches approved source, fully cited</td><td>Pass — logged as ground truth</td></tr>
<tr><td>Needs correction</td><td>Answer is directionally right but mis-cited or incomplete</td><td>Flagged, returned with span-level notes</td></tr>
<tr><td>Refusal required</td><td>No evidence exists in the corpus for the query</td><td>Agent must decline — silence is graded as failure</td></tr>
</tbody>
</table>
<blockquote>An agent that answers confidently with no evidence is a bigger liability than one that says "I don't know." The refusal set exists to make that failure visible before a customer does.</blockquote>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-inline-code.jpg" alt="Close-up of code and configuration used to trace an answer back to its source">
<figcaption>Every graded answer links back to the exact passage that supports it, so audits take minutes instead of days.</figcaption>
</figure>

<h2>Outcome and impact</h2>
<p>All 6 agents shipped inside the 1-month window, evaluated across 720 test queries against 270 curated source files, with grounded answers traceable to source and refusals validated as a first-class outcome.</p>
<h3>Client benefits</h3>
<ul>
<li><strong>Turnkey evaluation framework</strong> ready to run internally for ongoing benchmarking and fine-tuning.</li>
<li><strong>Every answer mapped</strong> to precise supporting passages for streamlined review and audits.</li>
<li><strong>Reproducible and scalable</strong> — templates and checklists let the client extend the program at the same pace, on their own.</li>
<li><strong>Reduced time-to-value</strong> while raising confidence in both grounded accuracy and refusal behavior.</li>
</ul>
`.trim();

const MANUFACTURING = `
<h2>About the client</h2>
<p>Tbrain partnered with a <strong>leading AI-powered manufacturing company</strong> valued at nearly <strong>$3 billion on NASDAQ</strong>. The company connects businesses with a vast network of manufacturing partners worldwide, offering services from <strong>CNC machining and 3D printing to injection molding and sheet metal fabrication</strong> — serving aerospace, automotive, healthcare, robotics, and consumer products.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/automation-cinema-poster.jpg" alt="Automated production line in a modern manufacturing facility">
<figcaption>The client's platform sits at the intersection of manufacturing supply and AI-driven quoting — every CAD drawing feeding a model that has to read engineering intent correctly.</figcaption>
</figure>

<h2>Project objective</h2>
<img class="rounded-xl my-6 max-w-full" src="/api/asset/cms/2026/05/37dbeb65eeb3_image.png.png" alt="Project objective overview">
<p>Process and review <strong>500 complex CAD drawings</strong> across <strong>15 annotation fields</strong> within a strict <strong>30-day</strong> delivery window, producing labels reliable enough to train downstream AI models directly on manufacturing intent — tolerances, materials, processes, and part geometry alike.</p>

<h2>The challenge</h2>
<ul>
<li><strong>Intense time pressure and scale</strong> — 500 CAD drawings had to be processed in 30 days, with no slack for a slow ramp.</li>
<li><strong>No established workflow</strong> — the client had no formal annotation platform or operating process to inherit.</li>
<li><strong>Specialized talent shortage</strong> — accurate drawing interpretation required genuine mechanical engineering expertise, not generalist labeling skill.</li>
<li><strong>High quality standard</strong> — outputs had to be reliable enough for downstream AI training, where a single mislabeled tolerance can propagate into a bad quote.</li>
</ul>

<h2>Tbrain's strategic solution</h2>
<p>We built the engagement on three pillars, run in parallel from day one rather than sequentially: <strong>Multi-Layer Quality Assurance, Strategic Platform Integration, and Elite Subject Matter Experts.</strong></p>
<img class="rounded-xl my-6 max-w-full" src="/api/asset/cms/2026/05/c159f2fb9b1e_image.png.png" alt="Multi-layer quality assurance pillar overview">
<img class="rounded-xl my-6 max-w-full" src="/api/asset/cms/2026/05/6276f150a4a1_image.png.png" alt="Platform integration and subject matter expert staffing overview">
<h3>Multi-layer quality assurance</h3>
<p>Every drawing passed through independent annotation and review stages before it counted as done, with parallel sample testing run against a held-out set so drift was caught inside the week it happened, not at final delivery.</p>
<h3>Strategic platform integration</h3>
<p>Rather than build annotation tooling from scratch, we stood up the workflow inside Labelbox — configured to the client's 15-field schema — so onboarding was measured in days, not sprints.</p>
<h3>Elite subject matter experts</h3>
<p>Makers were sourced specifically for mechanical engineering and CAD literacy, so drawing conventions — GD&amp;T callouts, section views, BOM references — were read correctly the first time instead of escalated.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-pipeline2.jpg" alt="Data pipeline stages moving structured records through validation">
<figcaption>Task distribution, annotation, review, and validation ran as one continuous pipeline rather than a batch handoff between teams.</figcaption>
</figure>

<h2>Implementation process</h2>
<ol>
<li><strong>Project kick-off and setup</strong> — deep-dive requirements meetings, Statement of Work development, Labelbox configuration, and full team onboarding.</li>
<li><strong>Annotation and review cycle</strong> — a continuous, high-velocity loop: task distribution, maker annotation at 100 drawings/week, expert review, parallel sample testing, and QA validation.</li>
<li><strong>Finalization and delivery</strong> — batched submission in 5 batches of 100 drawings, proprietary tool validation, secure data export, and complete project handover with detailed reporting.</li>
</ol>
<table>
<thead><tr><th>Batch</th><th>Drawings</th><th>Gate before release</th></tr></thead>
<tbody>
<tr><td>1 – 5</td><td>100 each</td><td>Expert review + sample QA pass</td></tr>
<tr><td>Program total</td><td>500</td><td>Proprietary validation + secure export</td></tr>
</tbody>
</table>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/data-dashboard.jpg" alt="Dashboard tracking annotation throughput and accuracy by batch">
<figcaption>Weekly throughput and per-field accuracy were tracked batch by batch, so the 30-day deadline never depended on a last-week surprise.</figcaption>
</figure>
<blockquote>A CAD annotation program lives or dies on the review gate. 100 drawings a week only matters if every one of them clears the same 15-field bar as the first.</blockquote>

<h2>Outstanding outcome</h2>
<img class="rounded-xl my-6 max-w-full" src="/api/asset/cms/2026/05/63ff16aedaae_image.png.png" alt="Final program results overview">
<p>All 500 CAD drawings were delivered inside the 30-day window, annotated across all 15 fields at <strong>95%+ accuracy</strong> — output the client's AI training pipeline could consume directly, with a repeatable Labelbox-based workflow left in place for the next batch.</p>
`.trim();

const SCALABLE_MULTIMODAL = `
<h2>Project overview</h2>
<p>The client set out to build <strong>robust, contextually aware generative AI models</strong> capable of sophisticated reasoning and accurate visual comprehension across multiple scientific disciplines — models that could look at a diagram, a lab setup, or a data chart and reason about it the way an advanced undergraduate would.</p>
<p>Tbrain built <strong>48,000 complex visual prompts</strong> in <strong>4 months</strong>, spanning chemistry, biology, medical sciences, mathematics, physics, engineering, and economics — <strong>7 scientific disciplines</strong> in total, each with its own notation and domain conventions.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/scientist-lab.jpg" alt="Researcher working with lab equipment and data instrumentation">
<figcaption>Source material spanned lab setups, diagrams, and data visualizations across seven disciplines — each needing subject-matter fluency, not generic labeling.</figcaption>
</figure>

<h2>The challenge</h2>
<h3>Recruiting a specialized workforce</h3>
<p>The initial team of <strong>50 Makers and 5 QCs</strong> was sized for a pilot, not a 48,000-prompt program. Meeting the timeline meant rapidly scaling to <strong>600 Makers and 20 QCs</strong> — all carrying postgraduate-level subject expertise, sourced and vetted discipline by discipline rather than as one generic pool.</p>
<h3>Complex task requirements</h3>
<p>Each visual prompt had to satisfy <strong>8 strict criteria</strong> simultaneously, demanding multi-step conceptual reasoning: a maker had to interpret visual content correctly, then compose a prompt that pushed a model to apply abstract, discipline-specific concepts rather than just describe what was on screen.</p>
<h3>Maintaining quality at scale</h3>
<p>Quality couldn't be a single checkpoint — it had to survive a 12x workforce expansion without a matching drop in standards. That meant a <strong>multi-stage review process</strong>: domain-expert review (Rv1), language verification (Rv2), and a final QC pass, engineered specifically to prevent bottlenecks and quality cascades as volume climbed.</p>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-inline-lab.jpg" alt="Close-up of laboratory instrumentation and measurement data">
<figcaption>Discipline-specific source material — instrumentation readouts, reaction diagrams, clinical imagery — set the bar for what counted as a defensible visual prompt.</figcaption>
</figure>

<h2>Tbrain's strategic approach</h2>
<p>Scaling 12x in workforce without diluting postgraduate-level quality required treating recruiting as its own pipeline, not a side task. Discipline leads owned sourcing and vetting for their subject area, so a chemistry prompt was written and reviewed by people with chemistry backgrounds, and the same held for medicine, physics, and economics.</p>
<ol>
<li><strong>Discipline-led recruiting</strong> — Makers and QCs sourced and vetted per subject, not pooled generically.</li>
<li><strong>Criteria-driven authoring</strong> — every prompt built against the same 8-point rubric before it entered review.</li>
<li><strong>Staged review</strong> — Rv1 domain check, Rv2 language check, final QC sign-off.</li>
<li><strong>Throughput monitoring</strong> — per-discipline pass rates tracked continuously so a bottleneck in one subject didn't stall the other six.</li>
</ol>

<h2>Quality pipeline</h2>
<p>Every prompt moved through three independent gates before it counted as delivered, each catching a different class of failure.</p>
<table>
<thead><tr><th>Stage</th><th>Reviewer</th><th>Focus</th></tr></thead>
<tbody>
<tr><td>Rv1</td><td>Domain expert</td><td>Conceptual accuracy, discipline conventions</td></tr>
<tr><td>Rv2</td><td>Language reviewer</td><td>Clarity, phrasing, ambiguity removal</td></tr>
<tr><td>Final QC</td><td>QC lead</td><td>Full 8-criteria compliance before release</td></tr>
</tbody>
</table>
<blockquote>A visual prompt that's technically correct but ambiguously worded fails a model just as fast as one that's wrong. Rv2 exists because language precision is not optional at this scale.</blockquote>
<figure>
<img class="rounded-xl my-6 max-w-full" src="/images/blog-annotation.jpg" alt="Reviewer annotating and validating a data sample against source criteria">
<figcaption>Final QC checked every prompt against the full 8-criteria rubric — the gate that kept a 12x larger workforce from diluting the bar set in week one.</figcaption>
</figure>

<h2>Outstanding results</h2>
<p>Tbrain delivered <strong>48,000 visual prompts</strong> across <strong>7 scientific disciplines</strong> in <strong>4 months</strong>, scaling the workforce to <strong>600 Makers and 20 QCs</strong> while holding a <strong>90% pass rate</strong> through the staged review pipeline.</p>
<ul>
<li><strong>Discipline-accurate content</strong> at a volume no generalist labeling pool could have produced.</li>
<li><strong>A reusable recruiting and QC playbook</strong> for scaling specialized workforces into new domains.</li>
<li><strong>A staged review model</strong> — Rv1, Rv2, final QC — that held quality steady through a 12x scale-up.</li>
</ul>
`.trim();

export const ENRICH = {
  "agent-evaluation": AGENT_EVALUATION,
  manufacturing: MANUFACTURING,
  "scalable-multimodal": SCALABLE_MULTIMODAL,
};
