# Robotics Training Data: State of the Art & Trends (mid/late 2026)

Compiled for Tbrain's blog agent to pick timely, credible topics. Covers the seven data types
Tbrain sells: egocentric human video, exocentric/multi-view, game data, GoPro single-camera,
hand pose, mocap, and teleoperated robot data. Every claim below is sourced with a date and
primary-source URL where possible; numbers I could not verify from a primary source are marked
**[unverified]** and should not be repeated as fact without independent confirmation.

How fresh is this: compiled 2026-10-03, via web search only (no account access to paywalled
reports, no direct scrape of arXiv listing pages beyond what search surfaced). Treat arXiv IDs
in the 26xx.xxxxx range as 2026 preprints; I have not independently opened every PDF, so
treat per-paper method descriptions as secondhand summaries, not verbatim quotes.

---

## 1. Egocentric human video for robot learning

**What's happening**

- EgoMimic (Kareer, Patel, Punamiya et al., ICRA 2025; site: https://egomimic.github.io/) established the template still referenced in 2026: co-train manipulation policies on Project Aria egocentric human video + a kinematically-matched bimanual robot, closing the embodiment gap with hardware design rather than only algorithms. Headline result: 2h robot + 1h human hand data beat 3h robot-only data on a bimanual task.
- NVIDIA shipped **Isaac GR00T N1.7** (2026) built on the premise that "human data is the most scalable source of robot intelligence," pretraining on roughly 20,854 hours of human egocentric video (the "EgoScale" human video corpus) spanning 20+ task categories (manufacturing, retail, healthcare, home). Source: https://huggingface.co/blog/nvidia/gr00t-n1-7 and https://developer.nvidia.com/blog/develop-humanoid-robot-policies-end-to-end-with-nvidia-isaac-gr00t/. NVIDIA reports this produced the field's first empirical **scaling law for robot dexterity** — going from 1k to 20k hours of human video more than doubled average task completion on dexterous 22-DoF hand tasks.
- A later NVIDIA description of the same model line describes pretraining on ~32K hours of real + human egocentric data plus ~8K hours of simulated data (BEHAVIOR, RoboCasa, Simulated GR-1), with benchmark gains over N1.6 including DROID-F6 +61%. Treat the exact hour figures as a moving target across NVIDIA's own announcements — cite the specific blog/date you're quoting.
- **Xiaomi-Robotics-1 (XR-1)**, announced 2026-07-16 (arXiv 2607.15330, https://robotics.xiaomi.com/xiaomi-robotics-1.html), pretrained on **100,000 hours / ~2.4M episodes / 1,700+ scenarios** of UMI (handheld-gripper, embodiment-free) human-collected trajectories, then post-trained on ~10K hours of cross-embodiment robot + UMI data. Xiaomi's own scaling-law experiment (run on a ~20K-hour subset due to compute limits) showed monotonic loss decrease with more UMI hours — one of the clearest public "data beats model size" results of 2026.
- A dense wave of 2026 academic follow-ons to EgoMimic: **EgoScale**, **EgoVerse** (arXiv 2604.07607, global egocentric human dataset for robot learning), **EgoBridge** (NeurIPS 2025, domain adaptation), **EgoWAM**, **EgoDex** (ICLR 2026, large-scale egocentric dexterous manipulation), **HumanEgo** (arXiv 2605.24934, zero-shot robot learning from minutes of egocentric video), **HumanNet** (arXiv 2605.06747, scaling human-centric video to "one million hours"), **VITRA** (ICRA 2026, VLA pretraining on real-life human activity video), **Masquerade** and **Phantom** (ICRA 2026, Lepert/Fang/Bohg lab, "training robots without robots"), and **Cosmos Policy** (Jan 2026, fine-tuning video models for visuomotor control).
- Meta's Ego-Exo4D (1,286 hours synchronized ego+exo video, 740 participants, 13 cities, Project Aria + 4–5 GoPros per capture) remains the reference open dataset underpinning much of this work. Source: https://ai.meta.com/blog/ego-exo4d-video-learning-perception/.
- Privacy-conscious "always-on" capture is emerging as its own research thread: **AoE** (arXiv 2602.23893) proposes on-device processing, explicit upload consent, pause/review/withdraw controls, and face/screen blurring before any egocentric data leaves the device.

**Open questions buyers argue about**

- Does human-hand data transfer cleanly to parallel-jaw/dexterous-hand morphologies, or does the "embodiment gap" (hand vs. gripper kinematics, lack of force/tactile signal) cap how far scaling human video alone can go, independent of volume?
- Whose scaling-law numbers are real vs. marketing: NVIDIA's and Xiaomi's scaling curves are self-reported on proprietary mixes — neither is independently replicated yet, so vendors citing "proven scaling laws" should be pressed on methodology.
- How much of the value is the video itself vs. the auto-labeling/annotation pipeline (action segmentation, language captions) layered on top — several 2026 papers (Xiaomi, Cosmos) emphasize the labeling pipeline as the real moat, not raw footage.

**Evergreen + timely blog angles**

- "What NVIDIA's and Xiaomi's 2026 scaling-law results actually say about human video data" (compare methodologies, hour counts, caveats — timely, ties to two named primary sources).
- "Egocentric video isn't robot data until it's labeled: inside the auto-labeling pipelines powering GR00T N1.7 and XR-1" (evergreen explainer, can reuse for any new scaling-law release).
- "Project Aria vs. handheld UMI vs. head-mounted GoPro: which egocentric capture rig fits your use case" (evergreen comparison, useful sales content).
- "The EgoMimic lineage: a field guide to 2026's egocentric-for-robotics papers" (timely roundup, easy to refresh quarterly).
- "Privacy-by-design egocentric capture: what AoE's architecture gets right" (timely, positions Tbrain on consent/compliance credibly).

---

## 2. Exocentric / multi-view capture and its role

**What's happening**

- Ego-Exo4D's defining contribution is *synchronized* ego+exo capture (Aria glasses + 4–5 GoPros per participant), enabling direct study of how third-person demonstration maps to first-person execution — directly relevant to "watch an expert, then do it yourself" robot learning. https://ai.meta.com/blog/ego-exo4d-video-learning-perception/
- A 2026 survey, "Bridging Perspectives: A Survey on Cross-view Collaborative Intelligence with Egocentric-Exocentric Vision" (arXiv 2506.06253), frames exocentric capture's robotics role as: (a) mapping third-person instructional video onto a robot's first-person view for skill acquisition, and (b) multi-robot coordination via cross-view 3D scene reconstruction.
- Multi-view input is increasingly used for *policy* input, not just pretraining: GP3 (arXiv 2509.15733) is a "3D geometry-aware policy with multi-view images for robotic manipulation"; related work on learning 3D representations from unposed multi-view images (arXiv 2604.10573) targets "spatial intelligence" via generalizable Gaussian splatting (e.g., Uni3r).
- World-model evaluation is starting to lean on 3D reconstruction as a plausibility check: RoboPhys-3D (arXiv 2608.28718) proposes evaluating embodied world models by reconstructing 3D scenes from their generated video and checking physical consistency.
- Exocentric capture also underwrites single-video-to-many-demonstrations pipelines: Video2Robo (CVPR 2026) uses 3D Gaussian Splatting from a single human demonstration video to synthesize diverse robot training trajectories under novel object arrangements.

**Open questions buyers argue about**

- Is multi-view capture worth its extra hardware/sync cost over single-camera (GoPro/UMI) capture for most manipulation tasks, or does it only pay off for specific uses (3D reconstruction, world-model training, multi-robot coordination)?
- How much calibration/sync precision is actually required downstream — is "good enough" time-alignment (frame-level) sufficient or does training a geometry-aware policy need sub-frame/hardware-triggered sync?

**Evergreen + timely blog angles**

- "When do you need exocentric multi-view data vs. single egocentric view? A buyer's decision tree" (evergreen).
- "What Ego-Exo4D taught the field about third-person-to-first-person skill transfer" (evergreen explainer, cites a flagship open dataset).
- "3D Gaussian Splatting is quietly becoming a robot-data multiplier — what that means for capture requirements" (timely, ties to Video2Robo/CVPR 2026).
- "Multi-view capture for world-model evaluation: the RoboPhys-3D approach" (timely, niche but credible thought-leadership).

---

## 3. Game data for world models / agents

**What's happening**

- **Genie 3** (Google DeepMind, released 2025-08-05; 11B-parameter autoregressive transformer, real-time 720p/24fps navigable worlds, "Promptable World Events") expanded access in 2026: **Project Genie** opened to Google AI Ultra subscribers 2026-01-29, fusing Genie 3 with Nano Banana Pro and Gemini — explicitly described as a way for DeepMind to gather user feedback and training data. Sources: https://techcrunch.com/2026/01/29/i-built-marshmallow-castles-in-googles-new-ai-world-generator-project-genie, https://www.techbuzz.ai/articles/google-opens-project-genie-ai-world-generator-to-ultra-subs.
- Genie's "world data" is crossing into robotics/autonomy: Waymo built the **Waymo World Model** (a Genie 3 variant) to simulate robotaxi edge cases, extended by 2026-05 to simulate real streets via Street View integration. https://en.wikipedia.org/wiki/Waymo_World_Model
- **Matrix-Game** (Skywork AI) is the most transparent open comparison point on data composition: v1 trained on 2,700+ hours of unlabeled Minecraft gameplay plus 1,000+ hours of action-labeled (keyboard+mouse) clips (arXiv 2506.18701). **Matrix-Game 3.0** (2026-03) streams 720p at 40fps with long-horizon memory, positioned as "the open answer to Genie." https://github.com/SkyworkAI/Matrix-Game
- **DeepMind SIMA 2** (tech report 2025-12-05, https://storage.googleapis.com/deepmind-media/DeepMind.com/Blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/SIMA_Tech_Report_2025.pdf) is the clearest public documentation of **frame-aligned controller-input logging**: 720p RGB frame stream, actions "deterministically parsed into low-level keyboard and mouse commands," trained on a mix of human gameplay trajectories (majority of data by volume) plus Gemini pretraining data to preserve general capabilities. SIMA 2 explicitly receives no privileged engine state — only pixels + inputs, same as a human player.
- Licensing is the field's central constraint: SIMA's original paper credits named studio partners (Coffee Stain, Hello Games, Keen Software House, Saber Interactive/Tuxedo Labs, Strange Loop Games) and titles (Satisfactory, No Man's Sky, Goat Simulator 3, Valheim); DeepMind must sign per-title agreements ensuring AI use doesn't violate ToS or enable cheating, which is why SIMA 2 remains a "limited research preview," not a public API.
- Other named systems in the 2026 open-source landscape: **Oasis** (Decart/Etched, Oct 2024, trained on "millions of hours" of gameplay, 500M-param version open-sourced), **DIAMOND** (diffusion world model, Atari), **GameNGen**, **LingBot-World** (Ant Lingbo, open-sourced Jan 2026, claimed comparable to Genie 3), **PhysEditWorld** (2026, dataset targeting physics-editable world models).

**Open questions buyers argue about**

- Licensing/IP: can a third-party data vendor legally supply "frame + input" gameplay capture at scale without per-title publisher agreements, or does every serious program require bespoke studio deals (as DeepMind does for SIMA)?
- Does Minecraft/open-world-game data (easy to license, well-studied) actually generalize to the embodied-robotics use case, or is it mainly useful for pure world-model/agent research rather than physical-world transfer?
- World models need **8–32x the GPU compute of LLMs** per one 2026 infra analysis **[unverified, single source: spheron.network]** — buyers should independently confirm compute-cost claims before using them in pitches.

**Evergreen + timely blog angles**

- "Frame-aligned input logging, explained: what SIMA 2's data pipeline reveals about game-data quality bars" (timely, technical, positions Tbrain's spec knowledge).
- "The licensing wall: why game data for world models is harder to source than it looks" (evergreen, addresses a real buyer objection head-on).
- "Genie 3, Matrix-Game 3.0, and the open-vs-closed world-model race — a 2026 scorecard" (timely roundup).
- "Does game data transfer to robots? What's proven and what's hype" (evergreen, credibility-building honesty angle).

---

## 4. Hand pose & dexterous manipulation data

**What's happening**

- **MANO** remains the universal parametric hand model (pose θ∈ℝ^51, shape β∈ℝ^10) underlying nearly all 2026 hand-pose pipelines.
- **HaMeR** and **WiLoR** are the two dominant monocular MANO-regression backbones used across 2026 papers — frequently as *pseudo-labeling* tools to extract hand pose from uncontrolled in-the-wild video, which is then retargeted to robot hands.
- **AnyHand** (2026, arXiv 2603.25726) is a large synthetic dataset that, when used to co-train HaMeR/WiLoR, improves generalization on FreiHAND/HO-3D and out-of-domain scenes; fine-tuned checkpoints are public. https://github.com/chen-si-cs/AnyHand
- **HRDexDB** (arXiv 2604.14944) — described as the first large-scale annotated dataset spanning both human hands and multiple dexterous robot hands (1.4K high-fidelity sequences), using multiview + silhouette-based MANO shape optimization.
- **DexCanvas** (arXiv 2510.15786) derives per-subject MANO shape params via HaMeR to bridge human demonstration and robot learning.
- **Dex-X** (Sep 2026) — visual-tactile dexterous manipulation learned from human video, with a quality-filtering step using SAM 3-generated hand masks (discarding frames where >80% of projected keypoints fall outside the mask) — a concrete, citable QC bar for hand-pose data.
- **ESTHER** (egocentric stereo hand estimation, arXiv 2609.34817) situates current monocular methods against the established benchmark lineage: FreiHAND, HO-3D, InterHand2.6M, **DexYCB**, **ARCTIC**, ObMan.
- Gloves remain a parallel capture modality: Rokoko's Smartgloves are cited as powering a Stanford dexterous-manipulation mocap pipeline (https://www.rokoko.com/use-cases/robotics), alongside the broader Rokoko motion dataset (see Section 5).

**Open questions buyers argue about**

- Pseudo-labeled (HaMeR/WiLoR-extracted) hand pose vs. hardware-captured (glove/marker) ground truth: how much pose error is acceptable for retargeting to a dexterous hand, and does it vary by task (power grasp vs. precision pinch)?
- Retargeting fidelity: human hand kinematics (21+ DoF, soft tissue) vs. robot hands (12–22 DoF typical) — where does the embodiment gap bite hardest, and which vendors actually validate retargeted data on real hardware vs. only in simulation?
- Occlusion and in-contact frames (the hardest, most valuable cases for manipulation) are exactly where monocular pose estimators are weakest — buyers should ask how a vendor's QC handles heavy occlusion rather than just reporting an aggregate PCK/MPJPE number.

**Evergreen + timely blog angles**

- "MANO, HaMeR, WiLoR: the hand-pose stack every robotics buyer should understand" (evergreen glossary-style explainer, strong SEO).
- "Pseudo-labeling hands from YouTube vs. capturing them with gloves: a cost/quality tradeoff guide" (evergreen).
- "What '80% of keypoints must fall inside the mask' tells us about real dexterous-data QC (the Dex-X filter)" (timely, technical credibility piece).
- "DexYCB to AnyHand: a short history of hand-pose benchmarks, and what's missing" (evergreen).

---

## 5. Motion capture for humanoids

**What's happening**

- **AMASS** (40+ hours, 300+ subjects, 11,000+ motions, built on the SMPL body model) remains the dominant *public* mocap corpus retargeted into humanoid controllers.
- **OmniH2O** and **HumanPlus** (the H2O lineage) both retarget AMASS motions into whole-body humanoid controllers — OmniH2O fits SMPL-X shape params to a T-posed humanoid (e.g., Unitree H1) and filters out dynamically infeasible motions; HumanPlus copies Euler angles from SMPL-X joints to a 19-DoF humanoid subset. OmniH2O also released **OmniH2O-6**, a 6-task humanoid whole-body-control dataset from teleoperation.
- 2026 follow-ons push toward morphology-agnostic, real-time retargeting: **GMR (General Motion Retargeting)**, ICRA 2026 (https://github.com/YanjieZe/GMR), gives a configurable MuJoCo/Mink differential-IK retargeter supporting Unitree G1/H1, Booster T1/K1, and more from AMASS or other mocap sources, running in real time on CPU. **CLONE** (CoRL 2025) augments AMASS with its own "CLONED" mocap set plus online hand-orientation generation for closed-loop whole-body humanoid control on long-horizon manipulation.
- Commercial mocap-as-a-service is a concrete 2026 data point: **Rokoko** advertises "the world's largest human motion dataset" — 1.6M+ unique motion assets, growing 50,000+/month, 10,000+ hours total, from 50,000+ contributors, 70% with body+finger tracking, 50% with facial capture, licensed (consent-based, GDPR-anonymized, sublicensable under terms) and exportable as BVH/FBX/CSV, with direct integrations into Isaac, MuJoCo, MoveIt, Unity/Unreal. https://www.rokoko.com/mocap/motion-dataset — this is a useful named comparator/competitor data point for Tbrain's own mocap offering.
- IMU-based (markerless, suit-based) mocap for *teleoperation* rather than offline retargeting is an active 2026 thread, e.g., "Real-Time Whole-Body Teleoperation of a Humanoid Robot Using IMU-Based Motion Capture" (arXiv 2605.12347).

**Open questions buyers argue about**

- Optical marker mocap (AMASS-style, gold-standard accuracy, expensive/lab-bound) vs. IMU suits/markerless vision (cheaper, scalable, noisier) — which is "good enough" for which humanoid control tier (locomotion vs. fine manipulation)?
- Retargeting validity: morphology mismatch between human and target humanoid (DoF count, limb proportions) means a "faithful" human motion may be dynamically infeasible for the robot — how much of this should the data vendor solve vs. leave to the buyer's retargeting pipeline?
- Is a licensed commercial mocap library (Rokoko-style) actually interchangeable with task-specific captured mocap, or does humanoid training need motions captured in-context (the actual task environment) rather than a general motion library?

**Evergreen + timely blog angles**

- "AMASS is 40 hours. Rokoko claims 10,000+. What humanoid training actually needs from mocap scale" (timely, competitive-positioning angle, careful with numbers).
- "GMR and the shift to morphology-agnostic retargeting: what it means for buying mocap once and reusing it across robots" (timely, ICRA 2026).
- "FBX, BVH, or raw marker data: what format should you actually request from a mocap vendor" (evergreen, practical buyer guide).
- "Optical vs. IMU vs. markerless mocap for humanoid training: an honest tradeoff breakdown" (evergreen).

---

## 6. Teleoperation data

**What's happening**

- **ALOHA 2** (2024, arXiv 2405.02292) remains the reference low-cost bimanual teleoperation rig (leader-follower ViperX/WidowX arms, sub-$20K hardware), with broad academic adoption, LeRobot/MuJoCo Menagerie/ROS2/Gazebo support, and throughput estimated around 10–30 episodes/hour **[secondary-source estimate]**.
- **DROID** (Distributed Robot Interaction Dataset): ~76,000 episodes across 564 tasks, 86 environments, 13 North American labs, standardized Franka Panda + 3D SpaceMouse teleoperation, CC-BY 4.0. Policies trained on DROID show ~20% higher held-out success vs. single-institution datasets of equal size — the clearest public evidence for the "diversity matters more than raw scale" argument.
- **AgiBot World 2026**: a 13.6 TB open-source heterogeneous dataset (free-form, not scripted, teleoperation) on AgiBot's G2 platform (Zhixing 90D grippers + dexterous OmniHand), capturing RGB(D), tactile, LiDAR, IMU, full-body joint state; LeRobot v2.1-style layout; CC BY-NC-SA 4.0 (non-commercial, ShareAlike) — a relevant licensing contrast for Tbrain's commercially-licensed positioning.
- **UMI (Universal Manipulation Interface)** and its 2026 derivatives (**HandUMI**, **Grabette**, **HiFi-UMI-2K**) continue the "no robot in the loop" trend: handheld/wrist-worn grippers record 6-DoF pose (often via SLAM/AprilTags) + gripper state, exported directly as LeRobot datasets, embodiment-agnostic at capture time (retargetable to AgileX PiPER, OpenArm, I2RT YAM, etc.).
- **Xiaomi-Robotics-1** post-training mixed 7.2K+ hours of in-house mobile-manipulator/dual-arm robot data with 1K+ hours of instruction-labeled UMI data plus open datasets (see Section 1) — a concrete example of blending teleoperated + UMI-handheld data in one pretraining recipe.
- Cost/throughput data points for 2026 (treat as industry-blog secondary sources, not peer-reviewed, but consistent across several): all-in teleop labor **$3–$60/hour** depending on geography/task (a cited ~16x China-vs-US labor arbitrage), **$15–$150+/hour** for humanoid multi-sensor programs, **5–50 episodes/hour** typical throughput, **10–30% QA rejection** standard. A 2,000-demo bimanual program at 3 demos/hour, 75% acceptance, was estimated at **$110K–$215K** all-in. Sources: dexset.ai, dataxpower.com, cervo-tech.com blog posts — flag these as industry estimates, not audited figures, when citing externally.
- Synthetic multiplication of teleop data is a major 2026 cost-reduction lever: **DreamGen** reportedly turns 1 teleoperated demo into 22 new behaviors **[unverified claim, single source]**; **DREAM** (arXiv 2608.29078, real-to-sim demo generation) directly compares cost curves against teleoperation and reports π0.5 reaching 93.3% success from 1,000 generated demos vs. 86.7% from 100 teleoperated ones on BlockIntoBowl; **COBALT** (arXiv 2605.19138) crowdsources cloud teleoperation via smartphones, claiming a ~4x cost reduction per 1,000 demonstrations via vectorized cloud instances.

**Open questions buyers argue about**

- Teleoperation is still called the "gold standard" for action-label accuracy, but is it worth the cost premium over UMI-handheld or synthetic/generated demonstrations for every task, or only for contact-rich/high-precision tasks?
- QC standardization is immature: a widely-cited "Open-X Embodiment quality rubric, extended by SVRC" is referenced in 2026 industry blogs but is not yet an agreed, audited industry standard — buyers should ask any vendor (including Tbrain) exactly which rubric and rejection criteria are applied, not accept "95%+ success rate" claims without definition.
- Licensing terms vary sharply (CC-BY vs. CC BY-NC-SA vs. fully proprietary) — a dataset's license, not just its size, determines whether a commercial VLA team can actually use it.

**Evergreen + timely blog angles**

- "DROID's lesson: diversity beats scale for teleoperated data — what that means for how you commission a collection program" (evergreen, strong credibility angle).
- "What a 'usable episode' actually means: teleoperation QC and rejection rates explained" (evergreen, addresses buyer's #1 real concern).
- "UMI, handheld grippers, and the end of robot-in-the-loop data collection" (timely, ties to HandUMI/Grabette/Xiaomi).
- "AgiBot World 2026 vs. DROID vs. Open X-Embodiment: a license and format comparison for buyers" (timely, practical).
- "Can synthetic data replace teleoperation? What DREAM and DreamGen actually show (and don't)" (timely, honest-broker angle).

---

## 7. Cross-cutting: VLA models, world models, formats, market, buyer concerns

**VLA model landscape (2026 snapshot)**

- **Physical Intelligence**: π0 → **π0.5** (open-world generalization, arXiv 2504.16054, April 2025) → **π0.6** (Gemma 3 4B backbone, larger 860M-param action expert) → **π*0.6** ("a VLA that learns from experience," RECAP offline-RL method combining a value function + VLA, https://www.pi.website/download/pistar06.pdf) → reportedly **π0.7** around April 2026 (novel task inference without per-task demos) **[secondary-source claim, verify before citing precisely]**. Physical Intelligence was reportedly in talks to raise at a **$5B valuation** in 2026, after a $5.6B valuation in late 2025 **[reported, not confirmed by PI directly]**.
- **NVIDIA Isaac GR00T N1.x**: see Section 1 — N1.7 is the current (2026) open, commercially-licensed humanoid VLA, trained on Cosmos-Reason2-2B (Qwen3-VL architecture) backbone.
- **Google DeepMind Gemini Robotics**: built on Gemini Robotics-ER (embodied reasoning). **Gemini Robotics 2** (2026-07-30) is DeepMind's first model controlling a humanoid's legs, torso, arms, and hands under one policy — but published task success ranged from 92% (unscrewing a light bulb) down to 32% (sweeping with a dustpan), and whole-body access is early-access-partner only. **Gemini Robotics-ER 2** (also 2026-07-30) added real-time video understanding and was made publicly available via the Gemini API/AI Studio.
- **Figure AI Helix**: in-house VLA (Figure ended its OpenAI partnership Feb 2025) with a dual-system design — System 2 (7B VLM, 7–9Hz scene/language understanding) + System 1 (80M-param transformer, 200Hz continuous control). **Helix 02** (Jan 2026) unified locomotion/balance/manipulation under one policy with a human-motion-data-trained "System 0" whole-body prior. **Helix 2.5** (Sep 2026) added more human behavior pretraining and reported zero-shot transfer to 30 unseen homes.
- **Xiaomi-Robotics-1**: see Sections 1 and 6 — notable for explicitly arguing "data beats model size."
- World models as a *generalist* category (not just games): Cosmos 3 (NVIDIA, 20 trillion multimodal tokens, ~1B images, 400M videos, dense temporal action captions on egocentric video); DeepMind Genie 3; surveys like "World Models for Embodied Intelligence" (arXiv 2609.16697) and "World-Action Models for Robot Learning and Control" (arXiv 2609.16074) indicate the field is consolidating ego-video, game-video, and robot-video under one "world/action model" framing in 2026.

**Data formats**

- **LeRobot v3.0** (Hugging Face, https://huggingface.co/blog/lerobot-datasets-v3) is the de facto community standard for VLA training: Parquet for low-dim state/action/timestamps, chunked/sharded MP4 for per-camera video, metadata for Hub indexing — file-based and relational, a significant restructure from v2.
- **RLDS** (TensorFlow ecosystem, used by Open X-Embodiment) offers a lossless episode/step hierarchy; **MCAP** is for continuous multi-rate raw sensor logs (SLAM/sensor fusion), a different layer than LeRobot/RLDS entirely.
- **Rerun** now exports directly to LeRobot v3 (aligning RRD time series to a target frame rate), and conversion tools (e.g., the "forge" toolkit) bridge RLDS↔LeRobot↔MCAP, reflecting real 2026 interoperability pressure — buyers increasingly expect delivery in LeRobot v3 with documented conversion paths, not a proprietary format.

**Market / funding signals (named, public facts only)**

- **Encord**: $60M Series C (2026-02-26, led by Wellington Management, new investors Bright Pixel and Isomer Capital; total raised $110M), positioned as "physical AI data infrastructure." Reports data on its platform grew 1PB→5PB+ in 12 months and physical-AI customer revenue grew 10x. Sources: https://siliconangle.com/2026/02/26/physical-ai-data-infrastructure-startup-encord-lands-60m-accelerate-intelligent-robot-drone-development/, https://encord.com/blog/encord-announces-60-million-series-c/.
- **Scale AI**: extends its decade-old AV data operation into robotics; named customers reported as Physical Intelligence, Generalist, and Cobot.
- **XDOF**: came out of stealth mid-2026 with $70M (Thrive Capital, Spark Capital, a16z, Lux, WndrCo), a UC Berkeley spinout behind the GELLO low-cost teleop rig.
- **Mecka AI**: ~$68M total raised (seed→Series A→follow-on through 2025–2026; Framework Ventures, Menlo Ventures, SV Angel, Kindred Ventures).
- **Config** (Seoul/San Jose): $27M seed at ~$200M valuation, backed by Samsung Venture Investment and other Korean manufacturer VC arms.
- **Lightwheel**: simulation/synthetic-data focused (SimReady assets); reportedly raised RMB ~2B (~$280M) across three 2026 rounds including an Ant Group-led round at ~$2B valuation.
- All figures above are as reported by the cited outlets; treat valuation/revenue-growth numbers as press-reported, not audited.

**Buyer concerns: consent/privacy, licensing, QC**

- Consent/privacy practice is converging on: on-device minimization/de-identification before upload, explicit opt-in and withdrawal rights, IRB/ethics-committee sign-off for identifiable-subject datasets (e.g., HABIT), GDPR-aligned notice for workplace capture (e.g., HUI360 posted notices + email to employees), and explicit use-restriction clauses (no surveillance use) — see Section 1.
- Workplace/industrial egocentric capture raises distinct power-dynamics concerns beyond generic consent (IndEgo dataset's ethics statement, arXiv 2511.19684) — a wearable camera on an employee is not ethically equivalent to a volunteer research participant, and vendors should be able to articulate the difference in their consent process.
- QC/acceptance-rate benchmarks circulating in 2026 buyer-facing content: Truelabel 92–97%, Scale AI 90–96%, Encord 88–94%, Appen 84–92% first-pass acceptance **[press/marketing-sourced, not independently audited — use cautiously, do not present as settled fact]**.
- Licensing clarity (CC-BY vs. CC BY-NC-SA vs. proprietary-commercial) is repeatedly flagged as a bigger practical blocker than raw dataset quality — AgiBot World 2026's non-commercial license vs. DROID's CC-BY 4.0 is a clean, citable contrast.

**Evergreen + timely blog angles (cross-cutting)**

- "A 2026 field guide to VLA models: π*, GR00T N1.7, Gemini Robotics 2, Helix — what data each one leans on" (timely, high-value SEO roundup).
- "LeRobot v3, RLDS, MCAP: picking the right delivery format before you commission a dataset" (evergreen, practical).
- "What 'open-source' robot data actually licenses you to do: AgiBot World vs. DROID vs. Open X-Embodiment" (evergreen).
- "Reading between the lines of 2026 robot-data funding rounds: what Encord, XDOF, and Lightwheel's raises say about where the market is headed" (timely, thought-leadership, cites only public facts).
- "Consent isn't a checkbox: what egocentric-video ethics statements from 2026 datasets actually require" (evergreen, differentiator for Tbrain's compliance posture).
- "The QC number nobody audits: why 'acceptance rate' claims need a rubric, not just a percentage" (timely, honest-broker/thought-leadership).

---

## Watchlist (check weekly/regularly)

- **arXiv cs.RO** (new submissions) — https://arxiv.org/list/cs.RO/recent — primary firehose for everything above.
- **Hugging Face LeRobot** org + blog — https://huggingface.co/lerobot and https://huggingface.co/blog (format changes, new dataset releases, community SO-100/101 data).
- **NVIDIA Developer / Research blogs** — developer.nvidia.com/blog, research.nvidia.com (Cosmos, GR00T updates land here first).
- **Physical Intelligence blog** — pi.website/blog (π-series releases).
- **Google DeepMind blog** — deepmind.google/blog (Genie, SIMA, Gemini Robotics).
- **Figure AI news** — figure.ai/news (Helix updates).
- **Project Aria / Meta AI blog** — ai.meta.com/blog (Ego-Exo4D-adjacent releases, Aria hardware updates).
- Conferences: **ICRA 2026** (June 1–5, Vienna), **RSS 2026** (July 13–17, Sydney), **CoRL 2026** (Nov 9–12, Austin) — watch accepted-paper lists and workshop CFPs a few months ahead for topic signal.
- Industry/market trackers (secondary, useful for funding/pricing signal but verify before citing numbers): Encord blog, dexset.ai, dataxpower.com, truelabel.ai, roboticscenter.ai "State of Robotics" series.
- GitHub orgs to watch for open releases: SkyworkAI (Matrix-Game), NVIDIA (Isaac-GR00T), Physical-Intelligence (openpi), LeCAR-Lab, YanjieZe (GMR).

---

### Flags on uncertain/unverifiable claims used above (do not state as settled fact in blog copy without re-checking)

- Exact GR00T N1.7 pretraining hour counts vary between NVIDIA's own sources (20,854h vs. ~32K+8K) — cite one source explicitly and note the figure is from that specific post.
- π0.7 existence/date ("April 2026, novel task inference without per-task demos") came from a secondary summary, not a Physical Intelligence primary post — verify on pi.website before using.
- DreamGen's "22 new behaviors from 1 demo" figure — single secondary source, not traced to a primary paper in this pass.
- Vendor acceptance-rate percentages (Truelabel/Encord/Scale AI/Appen) and most teleoperation $/hour figures are from marketing/industry blogs (dexset.ai, dataxpower.com, cervo-tech.com, truelabel.ai), not peer-reviewed or audited — fine for "industry chatter" framing, not for authoritative claims.
- Physical Intelligence's reported $5B fundraising talks — press-reported, not a company announcement found in this pass.
- "World models need 8–32x the GPU compute of LLMs" — single source (spheron.network blog), unverified.
