/**
 * Source of truth for the 4 Physical-AI foundry blog posts (local dev DB).
 *
 * Rich `content_html` — the blog render path injects HTML directly
 * (src/app/blog/[slug]/page.tsx renders `content_html || content_md` via
 * dangerouslySetInnerHTML). Prose styling (figure/figcaption/table) comes from
 * the `prose` classes on the container.
 *
 * IMAGES — every inline image was visually inspected; the caption describes what
 * the frame actually shows. Only presentable, on-message owned assets are used:
 *   - textile-annotated/{iron_01,arrange_01,sew_01} — real factory captures with
 *     an object mask + a cyan 21-kpt hand skeleton + a track label.
 *   - hitl/annotated_sample — cup grasp with object mask + two hand skeletons.
 *   - videos/masks/pick_up_the_cup__tracked_{cup,right_hand} — SAM3 overlay,
 *     track_id, auto-QC PASS badge.
 *   - depth/pick_up_the_cup_rgb_depth — split RGB | MoGe depth heatmap.
 *   - modalities/{umi,teleop,spatial,mocap} — clean rig/studio shots.
 *   - datacenter-cinema-poster — server room (compute).
 * Deliberately AVOIDED (verified bad): real-captures/*-loop.jpg (carry a red
 * "MoGe | depth stage NOT run" debug banner + awkward feet/floor framing),
 * textile-annotated/{quality_01,quality_02,package_01,print_01} (low-coverage /
 * body-blocked frames), hitl/hitl_capture_thumb (raw, no UI), and
 * videos/masks/iron_product__tracked_pants_pants (no visible overlay).
 * Covers stay cinematic (hero art).
 *
 * Public-safe: no named anchor customers, no internal pricing. External claims
 * trace to public 2026 research; Tbrain specifics (15 hard rules, 8-model
 * pipeline, MANO 21-kpt, ≤48h, RLDS/LeRobot) are already public on the landing.
 *
 * Consumed by scripts/seed-blog-drafts.mjs → upsert on slug into
 * tbrain_landing.cms_posts. Prod tbrain.ai is never written from here.
 */

export const BLOG_DRAFTS = [
  /* ──────────────────────────────────────────────────────────────────────
     1 · Egocentric video
     ────────────────────────────────────────────────────────────────────── */
  {
    slug: "egocentric-video-future-robot-learning",
    title: "Why Egocentric Video Is the Future of Robot Learning",
    excerpt:
      "One hour of first-person human video can be worth ten of teleoperation — and in 2026 a pair of glasses is out-scaling the robot fleets. Here's the evidence, the dataset stack behind it, and what separates data that transfers from data that quietly poisons a policy.",
    category: "Physical AI",
    tags: ["physical-ai", "robotics", "egocentric", "training-data"],
    author_name: "Tbrain Research",
    cover_image_url: "/images/worker-hero-poster.jpg",
    og_image_url: "/images/worker-hero-poster.jpg",
    seo_title: "Why Egocentric Video Is the Future of Robot Learning (2026)",
    seo_description:
      "First-person human video scales like the internet and transfers to robots. EgoMimic, Project Aria, the 2026 egocentric dataset stack, and the capture-and-QC pipeline behind data that actually works.",
    content_html: `
<p>Robot foundation models don't lack compute. They lack synchronized, action-paired data captured in the messy real world — and in 2026 the fastest-growing answer to that shortage isn't a bigger teleoperation fleet. It's a pair of glasses.</p>

<figure>
<img src="/images/textile-annotated/iron_01.jpg" alt="Egocentric factory capture with object mask and 21-keypoint hand skeletons">
<figcaption>A real first-person factory capture, auto-labeled: an object mask over the garment plus a MANO-style 21-keypoint skeleton on each hand. This is the exact viewpoint a robot acts from — which is why the data transfers.</figcaption>
</figure>

<p>The shift is happening because the old way of manufacturing robot data has hit a wall of cost and throughput, and a new way — first-person human capture — scales along a curve that looks unnervingly like the one that made large language models work.</p>

<h2>The data wall every lab hits</h2>

<p>Teleoperation is still the gold standard for clean, action-labeled robot demonstrations. It is also slow and expensive. A single teleoperated episode takes <strong>1 to 10 minutes of skilled operator time</strong>, and quality degrades the moment an operator is unfamiliar with the robot's dynamics. Packaged teleop pricing fell from roughly $340/hr in early 2024 to about $118/hr in 2026, but the throughput ceiling barely moved — on the order of 135 demonstrations an hour, per robot, per human.</p>

<p>Web video is the opposite failure mode: effectively infinite, but passive. A YouTube clip carries no joint angles, no gripper state, no contact forces. A model can watch a million hands pour coffee and never learn the torque profile that keeps the cup from slipping. The three classic sources each break somewhere:</p>

<table>
<thead><tr><th>Data source</th><th>Action labels</th><th>Scale</th><th>Real-world physics</th></tr></thead>
<tbody>
<tr><td>Teleoperation</td><td>Exact</td><td>Slow / costly (1–10 min/ep)</td><td>Yes</td></tr>
<tr><td>Web video</td><td>None</td><td>Effectively infinite</td><td>Yes, but unlabeled</td></tr>
<tr><td>Simulation</td><td>Exact</td><td>Cheap / infinite</td><td>Approximated (sim-to-real gap)</td></tr>
<tr><td><strong>Egocentric human</strong></td><td><strong>3D hand pose</strong></td><td><strong>Scales with people</strong></td><td><strong>Yes</strong></td></tr>
</tbody>
</table>

<p>Egocentric human video splits the difference. Put a head-mounted rig on a person doing ordinary work — cooking, tidying, assembling, folding, ironing — and the camera captures roughly what a robot's own camera would see, plus the 3D pose of the hands doing the task. Because that first-person viewpoint sits so close to the robot's, the data transfers directly instead of forcing a model to bridge a third-person "video of someone else" gap.</p>

<h2>The evidence got hard to argue with</h2>

<p>The clearest signal comes from Georgia Tech's <strong>EgoMimic</strong>. Using Meta's Project Aria glasses — a 75-gram head-worn device whose side-facing cameras keep tracking the hands even when the wearer looks ahead of them — the team co-trained a policy on human and robot data as equal citizens, rather than treating human video as a vague "intent" signal.</p>

<blockquote>Ninety minutes of Aria recordings drove a roughly 400% improvement in robot task performance versus prior methods — and the policy generalized to environments it had never seen.</blockquote>

<p>The scaling law underneath is the part strategists should tattoo on the wall: <strong>one hour of additional human hand data is worth more than one hour of additional robot data.</strong> That inverts the economics of an entire industry. As EgoMimic's lead author put it, looking at Ego4D he "saw a dataset that's the same as all the large robot datasets we're trying to collect, except it's with humans. You just wear a pair of glasses, and you go do things."</p>

<h2>It's a stack, not a monoculture</h2>

<figure>
<img src="/images/textile-annotated/arrange_01.jpg" alt="Egocentric fabric-arranging capture with cloth mask and hand skeletons">
<figcaption>Another task, another environment: a fabric-arranging capture with a cloth mask and both hands skeleton-tracked over the workbench. Diversity across operator × task × environment is the point — no single corpus covers it.</figcaption>
</figure>

<p>2026 didn't converge on one giant egocentric dataset — it converged on a <em>stack</em>, and every layer is load-bearing:</p>

<ul>
<li><strong>Ego-Exo4D</strong> — ~3,000 hours of paired first- and third-person daily activity, the reference corpus for viewpoint alignment.</li>
<li><strong>EgoDex</strong> — owns dexterous, fine-grained hand manipulation.</li>
<li><strong>HOT3D</strong> — owns 3D hand-object interaction geometry.</li>
<li><strong>Egocentric-1M</strong> — ~1 million hours, industrial-scale pretraining fuel.</li>
<li><strong>DreamDojo</strong> (March 2026) — a foundation world model trained on 44,000 hours of egocentric human video: 15× more duration and 96× more skills than any prior dataset.</li>
</ul>

<p>The takeaway isn't "pick the biggest." It's that first-person capture has become a real supply chain — and supply chains live or die on quality control at every node.</p>

<h2>Why the viewpoint wins on three axes at once</h2>

<figure>
<img src="/videos/masks/pick_up_the_cup__tracked_right_hand_right_hand.jpg" alt="Per-frame hand segmentation with track ID and QC pass">
<figcaption>Action grounding, visualized: a per-frame hand segmentation (SAM3, <code>right_hand · track_id=1</code>, auto-QC PASS). This linked-per-frame label is the supervision web video simply can't carry.</figcaption>
</figure>

<p>First-person capture is not just cheaper. It's structurally better aligned to how a policy learns:</p>

<ol>
<li><strong>Viewpoint alignment</strong> — the egocentric frame sits close to the robot's own sensor pose, so visual features transfer with far less domain gap than exocentric "third-person" video.</li>
<li><strong>Action grounding</strong> — paired hand tracking (a MANO-style 21-keypoint hand, plus a segmentation mask) turns pixels into supervision: every frame carries a pose the model can imitate, not just a scene to describe.</li>
<li><strong>Diversity at scale</strong> — a person wearing a rig collects across kitchens, workshops, and assembly lines all shift, capturing the lighting, clutter, and deformable-object chaos a policy actually has to survive.</li>
</ol>

<h2>The catch nobody advertises: quality</h2>

<p>Egocentric data is not a free lunch. It still needs a little robot data to fine-tune, and — more importantly — it lives or dies on capture quality. A drifting hand track, a desynced stream, an occluded grasp, or a clip where the operator's body blocks the object all teach the model the wrong thing. Imitation learning copies its data faithfully, flaws included. Scale without QC just industrializes the noise.</p>

<figure>
<img src="/images/depth/pick_up_the_cup_rgb_depth.jpg" alt="Split view of an RGB frame and its MoGe metric depth heatmap">
<figcaption>Quality gate in action: alongside the RGB frame, a metric depth map (MoGe, ~1.26–2.71 m here) with a world-scale sanity check catches broken captures before they ever reach a training loop.</figcaption>
</figure>

<p>That's the unglamorous work separating a dataset a frontier lab will train on from a hard drive of GoPro footage: clean 3D hand tracking, hardware-clock synchronization across every stream, metric-depth sanity checks, and a gate that rejects occluded or drifting clips.</p>

<h2>The economics nobody can ignore</h2>

<p>Follow the money and the case gets sharper. A teleoperated robot cell yields on the order of 135 demonstrations an hour and needs a skilled operator married to a specific robot. A person in a capture rig collects across a whole shift, across many stations, with no robot in the loop at all — and the robots that data trains are getting cheaper by the quarter. Figure's fleet bills around $25 per robot-operating-hour at BMW; a walking Unitree G1 lists near $18,000; Tesla's long-term Optimus target is $20,000–$30,000. As the hardware commoditizes, the differentiator shifts decisively onto the <strong>data</strong> — and egocentric capture is the only source whose supply scales with people instead of with robot fleets.</p>

<h2>The flywheel problem — and who it locks out</h2>

<p>The best-funded programs are building "data flywheels": every hour a deployed robot works, it logs episodes that feed back into the next model. Tesla routes Optimus factory data into its Cortex compute; Figure ran an 11-month BMW trial on exactly this loop. The catch is that those datasets are <em>proprietary and never shared</em> — and if you don't already run robots at factory scale, you can't spin the flywheel at all.</p>

<blockquote>Egocentric capture is the equalizer: you don't need a fleet of robots to build a data flywheel. You need people, rigs, and a QC pipeline that turns raw footage into training-grade episodes.</blockquote>

<h2>What this means if you're building</h2>

<figure>
<img src="/images/modalities/umi.jpg" alt="Handheld UMI-style gripper with a head-mounted camera">
<figcaption>A UMI-style handheld gripper with an onboard camera: first-person, action-paired capture with no robot required — the capture side of Tbrain's foundry.</figcaption>
</figure>

<p>If you're training a manipulation policy in 2026, the strategic move is no longer "collect more teleop." It's to pair a smaller, well-chosen robot dataset with a large, diverse egocentric corpus — and to insist that the egocentric half is captured and QC'd to lab standard, not scraped. That's the foundry model Tbrain runs: real capture packs worn by operators on real production floors, action-paired and annotated with an 8-model pipeline (hand, body, masks, depth, verb-noun), then run through 15 machine-checkable hard rules and delivered RLDS- and LeRobot-ready in ≤48 hours.</p>

<p>The internet taught language models to read. Egocentric video is teaching robots to act. The labs that win won't be the ones with the most footage — they'll be the ones whose footage transfers. <strong>Want to see a sample? Tell us the task and the embodiment, and we'll scope a batch.</strong></p>
`.trim(),
  },

  /* ──────────────────────────────────────────────────────────────────────
     2 · VLA
     ────────────────────────────────────────────────────────────────────── */
  {
    slug: "vla-revolution-one-brain-every-robot",
    title: "The VLA Revolution: One Brain for Every Robot",
    excerpt:
      "π0.7, GR00T N1.7, Gemini Robotics — Vision-Language-Action models now train once across many robots and adapt to a new one with a LoRA fine-tune. The bottleneck moved from the model to the data. Here's the architecture shift, the numbers, and why collecting alone is a losing strategy.",
    category: "Physical AI",
    tags: ["physical-ai", "robotics", "vla", "foundation-models"],
    author_name: "Tbrain Research",
    cover_image_url: "/images/platform-robotic-poster.jpg",
    og_image_url: "/images/platform-robotic-poster.jpg",
    seo_title: "The VLA Revolution: One Brain for Every Robot (2026)",
    seo_description:
      "How VLA models like π0.7 and NVIDIA GR00T N1.7 changed robot learning — flow matching, cross-embodiment transfer, Open X-Embodiment, and why standardized high-quality data is the real bottleneck.",
    content_html: `
<p>For years, every robot task meant a bespoke policy: a fresh model, a fresh dataset, a fresh six months. Vision-Language-Action models tore that up. The new goal is a single brain — train once across many robots and many tasks, then adapt it to a new machine with a little fine-tuning, the same way you'd adapt a language model to a new domain.</p>

<figure>
<img src="/images/textile-annotated/sew_01.jpg" alt="Action-paired sewing capture with cloth mask and hand skeleton">
<figcaption>The training fuel a generalist policy learns from: an action-paired real capture — cloth and ruler masks plus a 21-keypoint hand skeleton, every frame linked to the action.</figcaption>
</figure>

<h2>From bespoke policies to generalist brains</h2>

<p>A VLA takes in what the robot sees plus a natural-language instruction, and emits actions. The bet is the same one that made LLMs work: generality comes from broad, diverse data, not from hand-tuning one task at a time. Physical Intelligence's <strong>π0</strong> proved it — a first generalist policy trained across seven robot platforms and a spread of dexterous tasks. <strong>Open X-Embodiment</strong> pushed the pooling idea to its limit, uniting over a million trajectories from dozens of datasets across 22 robot types.</p>

<p>The trajectory since has been steep. π0 gave way to <strong>π0.5</strong> and its open-world generalization — cleaning a kitchen or bedroom it had never seen (arXiv 2504.16054) — and in April 2026 to <strong>π0.7</strong>, a steerable foundation model framed around a step-change in cross-embodiment generalization. Physical Intelligence has raised more than $400M on a single wager: that one policy could eventually drive any robot on any task, "just like you can ask a chatbot."</p>

<h2>The architecture shift that made it click</h2>

<figure>
<img src="/images/hitl/annotated_sample.jpg" alt="Contact-rich cup grasp with object mask and hand keypoints">
<figcaption>Contact-rich manipulation — a cup grasp with the object masked and both hands keypoint-tracked. Smooth, continuous control on tasks like this is exactly what flow matching handles better than discrete tokens.</figcaption>
</figure>

<p>Early VLAs like RT-2 and OpenVLA predicted actions as discrete tokens — quantized, choppy, awkward for contact-rich work. The π-series swapped that for <strong>flow matching</strong>: a mechanism that generates smooth, continuous action trajectories far better suited to folding laundry or seating a connector.</p>

<p>NVIDIA's <strong>GR00T</strong> line took a complementary path — a dual-system design borrowed from how people think:</p>

<ul>
<li><strong>System 2</strong> — a vision-language backbone that interprets the scene and the instruction.</li>
<li><strong>System 1</strong> — a diffusion transformer that turns that understanding into fluid, real-time motor actions.</li>
</ul>

<table>
<thead><tr><th>Model family</th><th>Action generation</th><th>Best at</th></tr></thead>
<tbody>
<tr><td>RT-2 / OpenVLA</td><td>Discrete action tokens</td><td>Early generalist proof; coarse control</td></tr>
<tr><td>π-series (π0 → π0.7)</td><td>Flow matching (continuous)</td><td>Smooth, contact-rich manipulation</td></tr>
<tr><td>GR00T N1.x</td><td>Dual-system: VLM + diffusion</td><td>Real-time humanoid control, open weights</td></tr>
</tbody>
</table>

<p>The numbers moved fast. GR00T N1.7 ships as a 3-billion-parameter open checkpoint, pretrained on ~32K hours of real and egocentric human data plus ~8K hours of simulation, and reports gains like <strong>DROID-F6 +61%</strong> over the prior version. Its predecessor N1.5, trained on just 30 demonstrations per task in RoboCasa, hit 47.5% success versus 17.4% for N1 — and was assembled in 36 hours on synthetic data that would have taken three months to collect by hand. A 60× turn of the crank.</p>

<blockquote>The moment a policy transfers across bodies, the scarce resource stops being the model and becomes the data that teaches a new body how it moves.</blockquote>

<h2>Cross-robot transfer is the commercial punchline</h2>

<figure>
<img src="/images/modalities/teleop.jpg" alt="VR teleoperation of robot arms">
<figcaption>One schema across bodies: VR teleoperation demonstrations, pooled with egocentric and UMI data, are what let a single policy transfer to a new robot with only a LoRA fine-tune.</figcaption>
</figure>

<p>Because the policy is embodiment-general, standing up a new robot mostly needs a modest set of ground-truth demonstrations and a low-rank fine-tune (LoRA) — not a training run from scratch. That is what turns "one brain for every robot" from a slogan into a procurement plan. The competitive field is crowding to exploit it — Gemini Robotics, MolmoAct2's action-reasoning approach, Hy-Embodied's real-world stack — but they all draw from the same well: large, diverse, standardized, multi-embodiment data.</p>

<h2>What open-world generalization actually required</h2>

<p>π0.5's headline demo — walking into a kitchen or bedroom it had never seen and tidying up — didn't come from a bigger model. It came from a broader data diet: heterogeneous training across multiple robot platforms, web-scale semantic data, and verbal instructions, so the policy learned concepts ("wipe the counter," "put it away") that survive a change of scene. The lesson that keeps repeating across π0.5, GR00T, and Gemini Robotics is the same one: generalization is bought with <em>diversity of data</em>, not depth of per-task tuning.</p>

<p>That is also why a modest, clean, task-specific set can adapt one of these models so cheaply. Once the base policy already understands objects, verbs, and contact, a LoRA fine-tune on a few hundred pristine demonstrations teaches it the one new body or task you care about — and the whole cost of the project collapses onto the quality of those few hundred episodes. A single mislabeled grasp is a rounding error at 300,000 episodes and a real problem at 300.</p>

<h2>Standardization is the unglamorous key</h2>

<figure>
<img src="/images/modalities/umi.jpg" alt="Handheld UMI gripper demonstration">
<figcaption>Standard export is the enabler: only when a UMI handheld demo and a robot-arm demo land in the same format (RLDS or LeRobot) can they train one policy together.</figcaption>
</figure>

<p>Pooling only works if the data speaks one language. The field converged on two formats: <strong>RLDS</strong> (from Open X-Embodiment — the format OpenVLA, Octo, and most open frameworks expect) and the <strong>LeRobot</strong> dataset schema from Hugging Face. Data that isn't exported to one of these can't flow into a modern training pipeline without a painful conversion tax — and that tax is exactly what strands otherwise-valuable datasets.</p>

<h2>Why collecting alone is a losing move</h2>

<p>Here's the strategic consequence. Scaling studies keep finding that <strong>diversity, not raw count, drives generalization.</strong> A lab collecting in isolation — one robot, one lab, one set of lighting conditions — builds a policy that overfits its own hallway. A lab that pools standardized data from many embodiments, environments, and operators builds one that travels. And the union of today's open corpora still isn't sufficient for deployment-grade generalization, which is precisely why task-specific, well-formatted data has become the bottleneck rather than the model.</p>

<h2>What this means if you're building</h2>

<figure>
<img src="/images/textile-annotated/iron_01.jpg" alt="Annotated production capture with object mask and hand keypoints">
<figcaption>What ships: action-paired production capture, labeled by an 8-model pipeline down to a per-object mask and a 21-keypoint hand on each side, exported RLDS-ready.</figcaption>
</figure>

<p>If you're training or fine-tuning a VLA in 2026, the questions that matter aren't "how many episodes" but "how diverse, how clean, and in what format." That's the foundry Tbrain is built for: action-paired demonstrations across a range of embodiments and real production environments, QC'd against 15 hard rules, and delivered RLDS- or LeRobot-ready — no conversion contract, no proprietary lock-in.</p>

<p>One brain for every robot only works if every robot's data can reach the brain. Standardized, diverse, QC'd data is how it gets there. <strong>Tell us the task and the embodiment; we'll scope a sample batch.</strong></p>
`.trim(),
  },

  /* ──────────────────────────────────────────────────────────────────────
     3 · World models
     ────────────────────────────────────────────────────────────────────── */
  {
    slug: "world-models-game-data-teaching-robots-imagine",
    title: "World Models & Game Data: Teaching Robots to Imagine",
    excerpt:
      "Genie 3, Cosmos 3, Dreamer 4 — world models became the defining AI battleground of 2026, with LeCun and Fei-Fei Li both betting their next decade on them. Robots don't play games, but they learn to predict consequences. Here's why labs collect game data, and why real robot video still grounds it all.",
    category: "Physical AI",
    tags: ["physical-ai", "robotics", "world-models", "simulation"],
    author_name: "Tbrain Research",
    cover_image_url: "/images/robotics-cinema-poster.jpg",
    og_image_url: "/images/robotics-cinema-poster.jpg",
    seo_title: "World Models & Game Data: Teaching Robots to Imagine (2026)",
    seo_description:
      "Genie 3, NVIDIA Cosmos 3, and Dreamer 4 explained — how world models learn action-to-consequence from games and video, why the closed loop matters, and why real robot data still grounds them.",
    content_html: `
<p>A world model is an AI that imagines what happens next: give it a scene and an action, and it predicts the frames that follow. With a good one, a robot can simulate "if I push this cup, it tips" before it ever moves — planning safely in its head instead of breaking dishes to find out. In 2026, world models became the most contested frontier in AI.</p>

<figure>
<img src="/images/modalities/spatial.jpg" alt="Multi-camera rig scanning an object in 3D">
<figcaption>Ground truth for the imagination: a multi-camera spatial-capture rig reconstructs a real object in 3D — the physical reality a world model's predictions have to match.</figcaption>
</figure>

<h2>The 2026 landscape moved fast</h2>

<p>Three releases reset expectations, and they split cleanly by philosophy:</p>

<table>
<thead><tr><th>System</th><th>Org</th><th>What's new</th><th>Access</th></tr></thead>
<tbody>
<tr><td>Genie 3</td><td>Google DeepMind</td><td>Real-time interactive 3D worlds at 24 fps; latent-action learned from raw video</td><td>Closed API preview</td></tr>
<tr><td>Cosmos 3</td><td>NVIDIA</td><td>Physics-aware synthetic video; shared latent action space across embodiments</td><td>Self-hostable, Apache-2.0, 2M+ downloads</td></tr>
<tr><td>Dreamer 4</td><td>DeepMind</td><td>"Training Agents Inside Scalable World Models" — policy learned in imagination</td><td>Research</td></tr>
</tbody>
</table>

<p>Genie 3 learns a compressed <em>latent action space</em> from raw video with no labeled actions, then lets you steer the world it dreams. Cosmos 3 took the practitioner path — open weights on Hugging Face, past two million downloads. Alongside them, a wave of robotics-specific work — DreamGen, DreamDojo (44,000 hours of egocentric video), DreamZero — pushed the thesis that you can train a policy largely inside the model's imagination.</p>

<blockquote>The unlock wasn't prettier video. It was closing the loop: generating frames conditioned on a specific action, in real time, so an agent can act, see the consequence, and react.</blockquote>

<p>The capital followed the thesis. Yann LeCun left Meta to launch AMI Labs on a reported €500M raise to build systems that understand physics rather than predict text; Fei-Fei Li's World Labs shipped "Marble" to make world-model generation commercially available. When two of the field's most-cited researchers both bet their next decade on world models, the signal is hard to ignore.</p>

<h2>How Cosmos 3 became the practitioner's default</h2>

<p>Cosmos 3 won adoption for an unglamorous reason: you can actually run it. Where Genie 3 sits behind a closed API, NVIDIA shipped Cosmos with open weights under a permissive license, and it crossed two million downloads. Technically, its trick is an <em>omnimodal</em> design that maps many robot embodiments into a single shared latent action space while preserving each body's structure — domain-aware projection layers keep a humanoid's actions distinct from a gripper arm's even inside one model. For a robotics team that means one world model can generate physics-aware training video across a whole fleet, instead of one model per robot. But a synthetic-video generator is only as physically honest as the real footage it was grounded on. Self-hostable convenience doesn't remove the real-data requirement; it just relocates it to your capture pipeline.</p>

<h2>So why do labs collect game data?</h2>

<figure>
<img src="/videos/masks/pick_up_the_cup__tracked_cup_cup.jpg" alt="Per-frame object mask with a stable track ID and QC pass">
<figcaption>The (frame, action) pair world models crave: every frame carrying a linked action label — here a per-object mask (SAM3, <code>cup · track_id=3</code>, PASS). In a game that label is free; in the real world it has to be earned.</figcaption>
</figure>

<p>To teach "action → consequence," you need <strong>(frame, action) pairs</strong> — and in a game, every keystroke is a free, perfect, frame-synced action label. Games give you infinite, controllable, resettable environments where failing a million times costs nothing. DeepMind's earlier GameNGen reproduced DOOM inside a neural network; the Genie line generates playable worlds outright. It is the cheapest imaginable source of the exact supervision world models crave.</p>

<h2>Why games alone will never be enough</h2>

<figure>
<img src="/images/depth/pick_up_the_cup_rgb_depth.jpg" alt="RGB frame beside its metric depth heatmap">
<figcaption>Real friction, real depth: an RGB frame and its metric depth map (MoGe) anchor a model in physics a game-only world never sees — soft objects, occlusion, true distances.</figcaption>
</figure>

<p>A model that only knows game physics won't survive real friction, soft fabric, variable lighting, and the thousand-and-one ways a real object refuses to behave. Simulation amplifies data; it does not replace ground truth. The recipe every serious lab converges on is the same:</p>

<ol>
<li>Learn dynamics cheaply and at massive scale in games and simulation.</li>
<li><strong>Ground</strong> the world model in real, action-labeled robot and egocentric video so its predictions match physical reality.</li>
<li>Use the grounded model to plan, generate synthetic edge cases, and cut real-world trial-and-error.</li>
</ol>

<p>That middle step is the expensive one — and the defensible one. Real, diverse, synchronized, QC'd demonstrations are the scarce ingredient that keeps an imagined world honest. Feed a world model desynced or metric-inconsistent grounding data and it learns the wrong physics; every downstream plan inherits the error.</p>

<h2>Grounding is a data-quality problem in disguise</h2>

<figure>
<img src="/images/modalities/mocap.jpg" alt="Performer in a marker-based motion-capture suit">
<figcaption>Lab-grade motion capture: marker-based ground-truth trajectories with hardware-clock sync are what keep an imagined world honest instead of confidently wrong.</figcaption>
</figure>

<p>The unglamorous requirements are exactly the ones a capture pipeline has to earn: hardware-clock synchronization across every stream, metric depth with a world-scale sanity check (an object's position ‖t‖ has to land inside real workspace bounds, e.g. 0.1–5 m), and clean per-object tracks. Miss any of them and the "ground truth" quietly lies.</p>

<h2>The compute reality check</h2>

<figure>
<img src="/images/datacenter-cinema-poster.jpg" alt="Rows of servers in a data center">
<figcaption>World models trade a data bill for a compute bill — training on spatial video costs exponentially more than text. Nobody can afford to burn those GPU-hours grounding on broken data.</figcaption>
</figure>

<p>World models aren't a free shortcut around data — they trade a data bill for a compute bill. Training on visual and spatial data demands exponentially more compute than training a text model, which is why the serious entrants are compute-rich labs and GPU vendors. The consequence buyers should internalize: because compute is the expensive part, nobody can afford to burn it grounding a model on <em>bad</em> real data. The garbage-in-garbage-out tax is paid in GPU-hours.</p>

<h2>From imagination to the factory floor</h2>

<p>The payoff, when the grounding is right, is concrete. A grounded world model lets a policy rehearse a manipulation in latent space, generate synthetic variations of a rare edge case, and check "what happens if I push here" before committing a motor command — cutting real-world trial-and-error and the broken hardware that comes with it. But every one of those imagined rollouts is only as trustworthy as the real episodes that anchored the model's physics. Ground it on production-grade capture and it plans like the real world; ground it on desynced footage and it confidently hallucinates.</p>

<h2>What this means if you're building</h2>

<figure>
<img src="/images/textile-annotated/arrange_01.jpg" alt="Synchronized, QC'd production capture with masks and hand tracks">
<figcaption>Production-grade capture — synchronized, depth- and world-scale-checked, QC'd, with object masks and hand skeletons — is the real world a world model has to be grounded on. That's the foundry.</figcaption>
</figure>

<p>World models don't reduce your need for real data — they raise the bar on its quality. That's the foundry Tbrain runs: real, action-paired capture from production environments, hardware-clock synchronized, depth- and world-scale-checked, QC'd against 15 hard rules, and delivered in the RLDS and LeRobot formats these training stacks expect. Teach a robot to imagine all you want — just make sure the world it learned from was real. <strong>Ask us for a grounded sample.</strong></p>
`.trim(),
  },

  /* ──────────────────────────────────────────────────────────────────────
     4 · Data quality moat
     ────────────────────────────────────────────────────────────────────── */
  {
    slug: "data-quality-hidden-moat",
    title: "Data Quality Is the Hidden Moat in Physical AI",
    excerpt:
      "DROID took 13 institutions and 12 months to collect 76,000 clean episodes. Cheap data farms ship whatever they record. AI-native QC — rejecting the broken 20–30% before a human looks — is what separates lab-grade data from noise, and in 2026 automation is quietly rewriting the economics of the moat.",
    category: "Physical AI",
    tags: ["physical-ai", "robotics", "data-quality", "qc"],
    author_name: "Tbrain Research",
    cover_image_url: "/images/hitl/annotated_sample.jpg",
    og_image_url: "/images/hitl/annotated_sample.jpg",
    seo_title: "Data Quality Is the Hidden Moat in Physical AI (2026)",
    seo_description:
      "Why verified quality beats raw volume in robot training data — imitation learning's flaw, DROID vs RT-1, LeRobot's Robometer, and the AI-native QC layer that's hard to copy.",
    content_html: `
<p>Imitation learning has an uncomfortable property: a policy copies its data, flaws and all. Bad sync, occluded hands, tracking drift, a botched demonstration — none of it just adds harmless noise. It teaches the robot the wrong thing. Garbage demos make garbage policies, faithfully.</p>

<figure>
<img src="/videos/masks/pick_up_the_cup__tracked_cup_cup.jpg" alt="Auto-label object mask with track ID and a QC verdict">
<figcaption>What QC actually inspects: an auto-label output — a per-object mask with a track ID and an auto-QC verdict (SAM3, <code>cup · track_id=3</code>, PASS). Clean or drifting, only a check tells you which.</figcaption>
</figure>

<h2>Why "cheapest per episode" is a trap</h2>

<p>The instinct is to optimize for price per demonstration. It's the wrong objective. The real cost of a bad episode shows up downstream: a lab that trains on unfiltered data burns compute and ships a worse model, then pays again to find out why. The defensible value in robot data was never volume. It's <strong>verified quality</strong> — and the gap between the two is where the moat lives.</p>

<p>The 2026 numbers confirm the shape of the problem. Most manipulation tasks need between <strong>300 and 1,200 high-quality demonstrations</strong> to generalize across the bulk of in-distribution variation. Commercial campaigns are sized to match — 500 to 5,000 clean trajectories per task, delivered in two to six weeks in RLDS or LeRobot format. Miss on quality and every one of those trajectories is a liability, not an asset. Usable-data pricing reflects the difficulty: roughly $15–30/hr for simple 2D teleop, and $80–150/hr for multi-sensor humanoid manipulation.</p>

<h2>The gold-standard datasets are expensive for a reason</h2>

<p>Look at what "good" actually costs to produce:</p>

<table>
<thead><tr><th>Dataset</th><th>Episodes</th><th>Collection</th><th>How</th></tr></thead>
<tbody>
<tr><td>DROID (2024)</td><td>76,000 (350 hrs)</td><td>12 months</td><td>13 institutions, 50 operators, standardized Franka + shared protocol</td></tr>
<tr><td>RT-1 (Google, 2022)</td><td>130,000</td><td>17 months</td><td>13 robots, scripted teleoperators</td></tr>
</tbody>
</table>

<p>DROID's protocol was engineered specifically to <em>prevent</em> the dumb, ubiquitous failures — "camera cannot see robot," "teleoperator in camera view." Even then, downstream users filter hard: one well-known pass keeps language annotations for 95% of successful episodes and applies an idle-frame filter, leaving 74,604 valid episodes. The lesson is blunt — clean data at scale is a manufacturing discipline, not a recording session.</p>

<blockquote>Quality isn't one number. It's scale, sensor and rig cleanliness, action-space consistency, licensing, and ecosystem fit — and no dataset wins on all of them at once.</blockquote>

<h2>The union of open datasets still isn't enough</h2>

<figure>
<img src="/videos/masks/pick_up_the_cup__tracked_right_hand_right_hand.jpg" alt="Per-frame hand mask with a stable track ID and QC pass">
<figcaption>The kind of defect open datasets can't rule out for your task: a track that looks clean but could swap or drift mid-episode. Per-frame verification (<code>right_hand · track_id=1</code>, PASS) is the only way to know it held.</figcaption>
</figure>

<p>It's tempting to think the open corpora solved this. They didn't. Open X-Embodiment, DROID, and the growing pile of LeRobot community datasets are each genuinely valuable — but a recent generalist-VLA analysis put it bluntly: <strong>none individually, nor their union, is sufficient</strong> for training a model meant for real-world deployment. Every production team eventually hits the same wall and needs task-specific, high-QC data that open datasets simply can't provide.</p>

<h2>AI-native QC flips the economics</h2>

<figure>
<img src="/images/textile-annotated/sew_01.jpg" alt="Densely auto-labeled capture: masks, keypoints, and track labels">
<figcaption>Model-backed pre-labeling: masks, hand keypoints, and track labels arrive pre-populated on a real capture, so a confidence model can auto-reject the broken 20–30% before a human ever opens it.</figcaption>
</figure>

<p>Here's the 2026 shift that's quietly changing everything. Quality scoring is going semi-automated. Replay-and-annotation pipelines matured to the point where raw operator streams become RLDS-formatted episodes with automated quality scoring — <strong>cutting annotation labor 40–60% versus 2024 workflows.</strong> LeRobot's latest release ships "Robometer," a general-purpose reward model built on Qwen3-VL-4B and trained over more than a million trajectories, that scores task progress and success from raw video plus a language instruction, with no task-specific training required.</p>

<p>The pattern that works layers machine and human judgment instead of choosing between them:</p>

<ul>
<li>A confidence model scores every demonstration and <strong>auto-rejects the 20–30% that are broken</strong> before a human ever opens them.</li>
<li>Machine-checkable hard rules gate the objective failures — desync, missing frames, out-of-range world scale, dropped tracks. (Tbrain runs 15 of them per capture.)</li>
<li>Human reviewers spend their scarce attention on genuine edge cases, not obvious garbage — annotator, reviewer, audit.</li>
<li>Everything exports to RLDS or LeRobot so a frontier lab can train on it directly.</li>
</ul>

<h2>Why the QC layer is hard to copy</h2>

<figure>
<img src="/images/textile-annotated/iron_01.jpg" alt="Annotated production capture where a subtle failure would be caught">
<figcaption>Failure modes a general reviewer misses: an incomplete grasp, a demo that fails at the critical moment, a sync drift that corrupts the action. Only a kinematics-aware pipeline — masks and hand skeletons checked per frame — flags them.</figcaption>
</figure>

<p>Automation lowers the <em>labor</em> cost of QC — but it raises the <em>expertise</em> bar. Robot demonstrations have failure modes invisible to a general reviewer but obvious to someone who understands kinematics: an incomplete grasp, a demo that fails at the critical moment, a sensor-sync drift that corrupts the action representation. Building a gate that reliably catches those takes domain knowledge a low-cost data farm doesn't have and can't quickly buy.</p>

<blockquote>The real moat isn't the price, and increasingly isn't even the labor. It's the judgment encoded in the pipeline.</blockquote>

<h2>The vendor landscape, honestly</h2>

<p>The market has stratified. Scale AI positions its "Physical AI Data Engine" as the infrastructure layer — an end-to-end pipeline from raw teleop sessions to annotated, training-ready sets, leaning on its history in autonomous-driving annotation. Shaip and similar players lean on large global contributor networks (500K+) for multimodal collection and labeling. APAC-native shops like DataX Power ship pre-built datasets in HDF5/RLDS. They're not interchangeable: an annotation-volume vendor is optimized for throughput, not for catching a sensor-sync drift only a robotics engineer would notice. When you evaluate a data partner, the org chart matters as much as the price sheet — who on their team can look at a trajectory and know it's quietly broken?</p>

<h2>A buyer's checklist for 2026</h2>

<p>If you take one thing from this: change the questions you ask a data vendor. Instead of "how much per episode," ask:</p>

<ol>
<li><strong>What's your reject rate,</strong> and what fraction is caught automatically versus by a human?</li>
<li><strong>Which checks are machine-enforced</strong> — sync, world-scale bounds, dropped tracks, idle-frame trimming?</li>
<li><strong>Who reviews the survivors,</strong> and do they understand robot kinematics or just draw boxes?</li>
<li><strong>What ships with each episode</strong> — a QC report, the manifest, the failed checks — or just the video?</li>
<li><strong>What's the native export format,</strong> RLDS or LeRobot, and is there a conversion tax?</li>
</ol>

<h2>What this means if you're building</h2>

<figure>
<img src="/images/textile-annotated/arrange_01.jpg" alt="Fully annotated, QC-verified capture ready for export">
<figcaption>The output of the moat: a fully annotated, QC-verified capture — object masks and per-hand skeletons in place, QC report and manifest shipping with it, RLDS/LeRobot-ready in ≤48 hours.</figcaption>
</figure>

<p>If you're buying robot training data in 2026, stop asking for the lowest price per episode and start asking how the vendor rejects a bad one. Ask what runs automatically, what a human actually reviews, and what the reject rate is. That's the foundry Tbrain is built around: real capture, an AI-native QC pipeline with 15 machine-checkable hard rules plus layered human review, world-scale and depth sanity checks, and delivery in the exact formats your training loop expects — in ≤48 hours. Cheap data is easy. Data a frontier model can train on directly — that's the moat. <strong>Ask us for a sample and see the QC report that ships with it.</strong></p>
`.trim(),
  },
];
