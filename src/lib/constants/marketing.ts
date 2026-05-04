// ── Trust Metrics ──
export const TRUST_METRICS = [
  { value: "Lab-grade", label: "Capture precision" },
  { value: "Per-program", label: "Custom pipelines" },
  { value: "Multi-modal", label: "Motion · IMU · depth · force" },
  { value: "Sim-ready", label: "URDF / USD exports" },
];

// ── Product Pillars (Labelbox-style numbered features) ──
export const PRODUCT_PILLARS = [
  {
    title: "Robotics",
    subtitle: "Data for embodied intelligence.",
    description:
      "Robots that learn from real-world complexity need data programs built around real tasks. We scope human motion, hand pose, and scene capture around the robot you are training.",
    href: "/data/physical-ai",
    features: [
      { num: "01", title: "Lab-grade capture", detail: "Optical mocap, IMU, depth — hardware scoped per program to the precision your pipeline needs" },
      { num: "02", title: "Household + factory focus", detail: "Cooking, cleaning, laundry, assembly, picking — real humanoid target tasks" },
      { num: "03", title: "Scene-aware", detail: "Egocentric video with 3D hand pose, environment context, and task annotations" },
    ],
    color: "#0151FF",
  },
  {
    title: "AI Agent Evaluation",
    subtitle: "Measure what matters.",
    description:
      "Generic coding benchmarks aren't enough. Terminal Bench provides domain-specific multi-step challenges that frontier models actually fail.",
    href: "/data/terminal-bench",
    features: [
      { num: "01", title: "Multi-step reasoning", detail: "Chains of actions across Linux, DevOps, Security, and Database domains" },
      { num: "02", title: "Layered validation", detail: "Spec → oracle → LLM baseline → expert review — frontier models still fail" },
      { num: "03", title: "Anti-cheat by design", detail: "No test leakage, no hardcoding — deterministic and reproducible" },
    ],
    color: "#6C3CF4",
  },
  {
    title: "Custom Data Programs",
    subtitle: "The fuel for post-training at scale.",
    description:
      "RLHF preference data, domain-specific SFT datasets — we build exactly what your model needs, with AI-native QC that catches what humans miss.",
    href: "/services",
    features: [
      { num: "01", title: "Domain expert pods", detail: "Medical, STEM, Coding, Finance — PhDs and subject-matter experts" },
      { num: "02", title: "AI-native QC", detail: "Automated pre-screening lifts the throughput ceiling; humans focus on edge cases" },
      { num: "03", title: "Multi-modal", detail: "Text, image, video, and audio annotation in one pipeline" },
    ],
    color: "#10B981",
  },
];

// ── Expert Network (Alignerr/Snorkel style) ──
export const EXPERT_NETWORK = {
  headline: "Elite domain expertise, on demand.",
  subheadline: "When your model needs to learn from the best, we bring the best.",
  stats: [
    { value: "48K+", label: "Expert contributors across 17+ countries" },
    { value: "PhDs", label: "From top universities and research institutions" },
    { value: "8+", label: "Domains: Coding, STEM, Medical, Robotics, Finance" },
  ],
  experts: [
    { name: "Nguyen Minh T.", title: "Radiologist, 9+ years", detail: "Top international hospital. Diagnostic imaging.", domain: "Medical", avatar: "/images/avt-1.png" },
    { name: "Trang M.", title: "Ph.D., Co-founder PowerGate", detail: "Head of AI. Software Engineering.", domain: "Coding / AI", avatar: "/images/avt-2.png" },
    { name: "Huy L.", title: "Ph.D., AI Researcher", detail: "Deep learning at Phenikaa University.", domain: "Coding / AI", avatar: "/images/avt-3.png" },
    { name: "Tu Ng.", title: "Head of AI, 10+ years", detail: "Data Science lead. Python, SQL, ML.", domain: "Data Science", avatar: "/images/avt-4.png" },
  ],
};

// ── Platform Features ──
export const PLATFORM_FEATURES = [
  { title: "Agent Knowledge Base", description: "Custom one-to-one training and instant reference guides that keep agents aligned with the work they need to perform.", icon: "Brain" },
  { title: "LLM-as-a-Judge", description: "Automated evaluation before final human judgment, so quality scales without removing expert accountability.", icon: "Scale" },
  { title: "Agentic Workflows", description: "Workflow loops where agents help review, route, and improve agent outputs across the delivery system.", icon: "Workflow" },
  { title: "Agent Identity & Soul", description: "Persistent agent context, goals, and operating style that make agent behavior coherent over time.", icon: "Sparkles" },
];

// ── Case Studies ──
export const FEATURED_CASE_STUDIES = [
  {
    title: "Terminal Bench: Agent Evaluation Platform",
    shortDescription: "500+ multi-step reasoning tasks with 4-layer validation",
    description: "Built a comprehensive benchmark for AI terminal agents. Each task requires multi-step reasoning across Linux, DevOps, Security, and Database. 4-layer validation ensures tasks are genuinely hard — GPT-5 passes ≤20% of them.",
    image: "/images/code-screen.jpg",
    metrics: [{ value: "500+", label: "Tasks" }, { value: "≤20%", label: "GPT-5 Pass" }, { value: "4", label: "Validation Layers" }, { value: "8+", label: "Domains" }],
  },
  {
    title: "Physical AI: Custom Robotics Data Programs",
    shortDescription: "Custom capture programs for humanoid and manipulation training",
    description: "We scope egocentric video, MOCAP, hand pose, and scene-aware capture programs for household and commercial robotics use cases. Final datasets are built per customer task, robot body, and export format.",
    image: "/images/robotics-hero.jpg",
    metrics: [{ value: "Custom", label: "Scope" }, { value: "Multi-modal", label: "Capture" }, { value: "Reference", label: "Aligned" }, { value: "On request", label: "Delivery" }],
  },
  {
    title: "Multimodal Annotation at Scale",
    shortDescription: "48K annotations in 4 months across 3 modalities",
    description: "Scaled from zero to 48,000 high-quality annotations in 4 months. Production-ready labeled data across text, image, and audio for enterprise AI training programs.",
    image: "/images/team-collab.jpg",
    metrics: [{ value: "48K", label: "Annotations" }, { value: "4", label: "Months" }, { value: "3", label: "Modalities" }, { value: "90%+", label: "Accuracy" }],
  },
  {
    title: "Enterprise AI Agents",
    shortDescription: "6 domain-specific Q&A agents in 1 month",
    description: "Stood up 6 production-grade Q&A agents with a practical evaluation framework for a global enterprise. Grounded in curated, approved knowledge — delivered from kickoff to handoff in 30 days.",
    image: "/images/ai-brain.jpg",
    metrics: [{ value: "6", label: "Agents" }, { value: "1", label: "Month" }, { value: "720", label: "Test Queries" }, { value: "270", label: "Knowledge Files" }],
  },
  {
    title: "Video Game Data Pipeline",
    shortDescription: "Automated QC and delivery for game recording annotation",
    description: "Built an end-to-end annotation pipeline for video game data collection with 4 agentic workflows: automated QC validation, delivery preparation, cloud sync (GCS/R2), and real-time notifications.",
    image: "/images/data-dashboard.jpg",
    metrics: [{ value: "4", label: "AI Agents" }, { value: "Auto", label: "QC Pipeline" }, { value: "OAuth", label: "Cloud Sync" }, { value: "Real-time", label: "Tracking" }],
  },
];

// ── Leadership ──
export const LEADERSHIP = [
  {
    name: "Tam Le",
    bio: "Seasoned data science and analytics leader with 15+ years across Google, Adobe, and Asana. Tam brings deep AI training data expertise from close work with the AI trainer industry at Turing.",
    avatar: "/images/avt-tamle.png",
    logos: ["google_logo.svg", "turingcom_logo.svg", "asana_logo.svg", "healthline_media_logo.svg"],
  },
  {
    name: "David Do",
    bio: "Senior software engineering leader with 20 years of experience managing outsourced engineering teams, including a 500+ person engineering organization and multi-million-dollar delivery contracts.",
    avatar: "/images/avt-daviddo.png",
    logos: ["alphaplus_metaverse_logo.svg", "alphaway_logo.svg", "ibm_logo.svg", "ericsson_logo.svg", "techcombank_logo.svg"],
  },
];

// ── Expertise ──
export const EXPERTISE_AREAS = [
  { label: "Coding & DevOps:", detail: "Python, C++, Java, Linux sysadmin, full stack" },
  { label: "Mathematics:", detail: "Real analysis, linear algebra, topology" },
  { label: "Science:", detail: "Physics, chemistry, biology" },
  { label: "Robotics:", detail: "Egocentric video, hand pose, motion capture, teleoperation" },
  { label: "Data Science:", detail: "Python, SQL, machine learning, LLM fine-tuning" },
  { label: "Finance:", detail: "Macroeconomics, financial reporting" },
  { label: "Medical:", detail: "Clinical, imaging, diagnostics" },
];

// ── Services ──
export const SERVICES = [
  { title: "Custom Expert Data Collection", description: "RLHF, SFT, and expert data for pre-training, post-training, fine-tuning, and evaluation workflows.", icon: "Brain" },
  { title: "Benchmark Creation", description: "Custom task design, rubrics, test cases, validation harnesses, and datasets that expose real model failures.", icon: "BarChart3" },
  { title: "Agent Evaluation and Analysis", description: "Model and agent grading, failure analysis, LLM-assisted review, and final human judgment from domain experts.", icon: "ShieldCheck" },
];

export const DOMAIN_PODS = [
  { title: "Coding", description: "Software engineering, terminal workflows, DevOps, security, databases, and code review.", icon: "Code" },
  { title: "Medical", description: "Clinical, imaging, diagnostics, healthcare QA, and expert review for high-stakes medical tasks.", icon: "Stethoscope" },
  { title: "Manufacturing", description: "Factory operations, process documentation, quality inspection, and industrial task understanding.", icon: "Factory" },
  { title: "Languages", description: "Asian languages, Spanish, Portuguese, Baltic languages, and multilingual evaluation.", icon: "Languages" },
  { title: "Physical AI / Robotics", description: "Robot training data, egocentric video, motion capture, manipulation, and embodied task data.", icon: "Bot" },
  { title: "RL Environments", description: "Environments, tasks, rewards, and validation loops for reinforcement-learning programs.", icon: "Cpu" },
];

// ── Physical AI page ──
export const PHYSICAL_AI_PROBLEMS = [
  { title: "Ego-Diverse", description: "Household walking tasks — cooking, cleaning, assembly.", accuracy: "Scoped", tier: "T1", status: "On request" },
  { title: "UMI-Diverse", description: "Gripper manipulation, Stanford UMI standard.", accuracy: "6DoF", tier: "UMI", status: "On request" },
  { title: "Ego-Dexterous", description: "Fine manipulation — threading, origami, tool use.", accuracy: "Scoped", tier: "T3", status: "On request" },
  { title: "Residential OTS", description: "Tidying, dishes, laundry, home mapping.", accuracy: "Scoped", tier: "T1", status: "On request" },
  { title: "Commercial OTS", description: "Warehouse, retail, food service, manufacturing.", accuracy: "Scoped", tier: "T1", status: "On request" },
  { title: "Dexterous Hand", description: "High-DoF hands with tactile sensors.", accuracy: "Scoped", tier: "Robot", status: "On request" },
];

export const PHYSICAL_AI_TIERS = [
  { tier: "T1", name: "Standard", hardware: "Leap Motion 2 + Jetson Orin Nano", accuracy: "5.2-5.3mm", cost: "$2,008", source: "MDPI Sensors 2025", bestFor: "Household, commercial", recommended: true },
  { tier: "T2", name: "Budget", hardware: "Stereo GoPro + HaMeR fusion", accuracy: "15-20mm", cost: "$1,532", source: "HaMeR + Pose2Sim", bestFor: "Budget fallback", recommended: false },
  { tier: "T3", name: "Premium", hardware: "Apple Vision Pro (ARKit) + GoPro", accuracy: "0.8 ± 0.3mm", cost: "$4,539", source: "EgoDex 829h", bestFor: "Fine manipulation", recommended: true },
];

export const PHYSICAL_AI_DATASETS = [
  { name: "EgoDex", volume: "829 hours", quality: "21-joint hand (0.8mm)", useCase: "Dexterous reference" },
  { name: "OpenEgo", volume: "1,107 hours", quality: "21-joint unified", useCase: "Diverse format" },
  { name: "EPIC-KITCHENS", volume: "100 hours", quality: "Action labels", useCase: "Residential" },
  { name: "UMI Community", volume: "1,400 hours", quality: "SLAM 6DoF", useCase: "Gripper pipeline" },
];

export const SAMPLE_PROJECTS = [
  { title: "Chatbot data generation", description: "Q&A pairs for medical chatbot training.", icon: "/icons/icon_chatbot.svg" },
  { title: "Training data generation", description: "LLM response validation across domains.", icon: "/icons/icon_training.svg" },
  { title: "Audio Data Collection", description: "High-quality audio data for smart devices.", icon: "/icons/icon_audio.svg" },
];

export const EXPERTS = EXPERT_NETWORK.experts;
