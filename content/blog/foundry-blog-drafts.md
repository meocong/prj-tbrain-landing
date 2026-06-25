# Foundry blog — publish-ready drafts

The blog is Supabase-CMS-backed (authored via `/admin`), so these four
articles are provided as ready-to-publish drafts. Paste each into a new CMS
post (title, slug, excerpt, body). Suggested category: **Physical AI**.
All claims are public research; no named anchor customers, no internal pricing.

---

## 1. Why egocentric video is the future of robot learning
**slug:** `egocentric-video-future-robot-learning`
**excerpt:** First-person human video is ~10× cheaper than teleoperation and scales like the internet. Here's why it's becoming the default pretraining data for robot foundation models.

Robot foundation models don't lack compute — they lack synchronized, action-paired data. Teleoperation, the gold standard, is expensive (packaged teleop fell from ~$340/hr in early 2024 to ~$118/hr in 2026, but still yields only ~135 demos an hour). Web video is infinite but passive: no joint angles, no gripper state, no force.

Egocentric human video splits the difference. When a person wears a head-mounted rig and does ordinary tasks — cooking, tidying, assembling — the camera captures roughly what a robot's own camera would see, plus 3D hand pose. Because that first-person viewpoint is so close to the robot's, the data transfers directly.

The evidence is striking. Georgia Tech's EgoMimic measured one hour of egocentric video as worth roughly ten hours of teleoperated robot demos. NVIDIA's EgoScale work found a log-linear scaling law: double the egocentric hours and robot success improves steadily and predictably — the same curve that made large language models work.

The catch: egocentric data still needs a little robot data to fine-tune, and it lives or dies on quality — clean 3D hand tracking, tight multi-stream sync, and rejecting occluded or drifting clips. That's exactly where a real capture-and-QC pipeline earns its keep.

---

## 2. The VLA revolution: one brain for every robot
**slug:** `vla-revolution-one-brain-every-robot`
**excerpt:** Vision-Language-Action models train once across many robots and deploy with light fine-tuning. Why labs are pooling standardized data instead of collecting solo.

For years, every robot task meant a bespoke policy. Vision-Language-Action (VLA) models changed the goal: train one model across many embodiments and many tasks, then adapt it to a new robot with a little fine-tuning.

Physical Intelligence's π0 was trained on roughly 10,000 hours of data across seven robot platforms; Open X-Embodiment pooled over a million trajectories from dozens of datasets and 22 robot types. The pattern is clear — generalization comes from diverse, multi-embodiment data, standardized so it can be pooled.

That standardization is the unglamorous key. The field has converged on two formats: **RLDS** (from Open X-Embodiment) and **LeRobot** (Hugging Face). Data that isn't exported to these can't flow into a modern training pipeline without painful conversion.

The strategic consequence: collecting alone is wasteful. A lab that pools standardized data from many sources — and a data partner that delivers RLDS/LeRobot-ready demonstrations across embodiments — beats one collecting in isolation. Diversity, not raw count, is what scaling studies show matters most.

---

## 3. World models & game data: teaching robots to imagine
**slug:** `world-models-game-data-teaching-robots-imagine`
**excerpt:** Robots don't play games — but they learn to predict consequences. Here's why labs collect game data, and why they still need real robot video.

A world model is an AI that imagines what happens next: give it a scene and an action, and it predicts the following frames. With a good one, a robot can simulate "if I push this cup, it tips" before acting — planning safely instead of breaking dishes.

So why do labs collect *game* data? Because to teach "action → consequence" you need (frame, action) pairs, and in a game every keystroke is a free, perfect, frame-synced action label. Games give you infinite, controllable, resettable environments where failing a million times costs nothing. DeepMind's Genie generates playable worlds; Google's GameNGen reproduced DOOM with a neural network; NVIDIA's Cosmos and DeepMind's Dreamer push the same idea toward robotics.

But a model that only knows game physics won't survive real friction, soft objects, and lighting. So the recipe is: learn dynamics cheaply in games and simulation, then **ground** the world model in real, action-labeled robot and egocentric video so its predictions match reality. That real ground-truth data — diverse, synchronized, QC'd — is the scarce ingredient.

---

## 4. Data quality is the hidden moat
**slug:** `data-quality-hidden-moat`
**excerpt:** Cheap data farms ship whatever they record. AI-native QC — rejecting broken demos before a human looks — is what separates lab-grade data from noise.

Imitation learning has an uncomfortable property: a policy copies its data, flaws and all. Bad sync, occluded hands, tracking drift, or a botched demonstration don't just add noise — they teach the robot the wrong thing. Garbage demos make garbage policies.

This is why "cheapest per episode" is a trap. The real cost is downstream: a lab that trains on unfiltered data burns compute and ships a worse model. The defensible value isn't volume — it's verified quality.

AI-native QC flips the economics. A confidence model scores every demonstration and auto-rejects the 20–30% that are broken *before* a human ever reviews them, so expert reviewers spend their time on edge cases instead of obvious failures. Layer three rounds of human review on top — annotator, reviewer, audit — and export to RLDS/LeRobot, and you have data a frontier lab can train on directly.

That QC layer is hard to copy. It requires domain expertise in synchronization, pose tracking, and embodiment heterogeneity — which is exactly why it, not price, is the moat.
