// ── Trust Metrics ──
export const TRUST_METRICS = [
  { value: "48K+", label: "Expert Contributors" },
  { value: "250+", label: "Projects Delivered" },
  { value: "17+", label: "Countries" },
  { value: "0.8mm", label: "Hand Pose Accuracy" },
];

// ── Product Pillars (Labelbox-style numbered features) ──
export const PRODUCT_PILLARS = [
  {
    title: "Robotics",
    subtitle: "Data for embodied intelligence.",
    description:
      "Robots that learn from real-world complexity start with real-world data. Ground-truth human motion and hand pose — captured with lab-grade precision, not estimated from video.",
    href: "/data/physical-ai",
    features: [
      { num: "01", title: "3-tier hardware", detail: "5mm standard to 0.8mm premium, validated against peer-reviewed benchmarks" },
      { num: "02", title: "6 problem categories", detail: "Household, commercial, dexterous manipulation, gripper, teleoperation" },
      { num: "03", title: "Scene-aware capture", detail: "Egocentric video with 3D hand pose, environment context, and task annotations" },
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
      { num: "02", title: "4-layer validation", detail: "Spec → Oracle → LLM baseline (≤20% GPT-5) → Expert review" },
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
      { num: "01", title: "Domain expert pods", detail: "Medical, STEM, Coding, Finance — PhDs and Olympiad medalists" },
      { num: "02", title: "AI-native QC", detail: "Automated pre-screening handles 60-70%. Humans focus on edge cases" },
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
  { title: "AI-Native QC Pipeline", description: "Automated quality checks pre-screen 60-70% of submissions. Humans review edge cases only.", icon: "ShieldCheck" },
  { title: "Real-Time Dashboards", description: "Live project metrics, submission tracking, and team velocity — visible to your team.", icon: "BarChart3" },
  { title: "Multi-Tenant Isolation", description: "Workspace-level data isolation with full audit trails.", icon: "Lock" },
  { title: "Agentic Workflows", description: "4 specialized agents automate QC, delivery, cloud sync, and notifications.", icon: "Workflow" },
];

// ── Case Studies ──
export const FEATURED_CASE_STUDIES = [
  {
    title: "Terminal Bench: Agent Evaluation Platform",
    shortDescription: "500+ multi-step reasoning tasks with 4-layer validation",
    description: "Built a comprehensive benchmark for AI terminal agents. Each task requires multi-step reasoning across Linux, DevOps, Security, and Database. 4-layer validation ensures tasks are genuinely hard — GPT-5 passes ≤20% of them.",
    image: "/images/labeling.svg",
    metrics: [{ value: "500+", label: "Tasks" }, { value: "≤20%", label: "GPT-5 Pass" }, { value: "4", label: "Validation Layers" }, { value: "8+", label: "Domains" }],
  },
  {
    title: "Robotics: Ground-Truth Motion Capture",
    shortDescription: "Multi-modal datasets for humanoid and manipulation training",
    description: "Producing egocentric video, MOCAP, and 3D hand pose data across household and commercial robotics use cases. Lab-grade capture validated against peer-reviewed benchmarks.",
    image: "https://qdrant.tech/img/ai-agent.svg",
    metrics: [{ value: "Sub-mm", label: "Precision" }, { value: "12+", label: "Data Modalities" }, { value: "829h", label: "Reference Data" }, { value: "6+", label: "Use Cases" }],
  },
  {
    title: "Multimodal Annotation at Scale",
    shortDescription: "48K annotations in 4 months across 3 modalities",
    description: "Scaled from zero to 48,000 high-quality annotations in 4 months. Production-ready labeled data across text, image, and audio for enterprise AI training programs.",
    image: "/images/labeling.svg",
    metrics: [{ value: "48K", label: "Annotations" }, { value: "4", label: "Months" }, { value: "3", label: "Modalities" }, { value: "90%+", label: "Accuracy" }],
  },
  {
    title: "Enterprise AI Agents",
    shortDescription: "6 domain-specific Q&A agents in 1 month",
    description: "Stood up 6 production-grade Q&A agents with a practical evaluation framework for a global enterprise. Grounded in curated, approved knowledge — delivered from kickoff to handoff in 30 days.",
    image: "/images/labeling.svg",
    metrics: [{ value: "6", label: "Agents" }, { value: "1", label: "Month" }, { value: "720", label: "Test Queries" }, { value: "270", label: "Knowledge Files" }],
  },
  {
    title: "Video Game Data Pipeline",
    shortDescription: "Automated QC and delivery for game recording annotation",
    description: "Built an end-to-end annotation pipeline for video game data collection with 4 agentic workflows: automated QC validation, delivery preparation, cloud sync (GCS/R2), and real-time notifications.",
    image: "/images/labeling.svg",
    metrics: [{ value: "4", label: "AI Agents" }, { value: "Auto", label: "QC Pipeline" }, { value: "OAuth", label: "Cloud Sync" }, { value: "Real-time", label: "Tracking" }],
  },
];

// ── Leadership ──
export const LEADERSHIP = [
  { name: "Tam Le", bio: "15+ years across Google, Adobe, Asana, and Turing. Deep expertise in AI training data at scale.", avatar: "/images/avt-tamle.png", logos: ["google_logo.svg", "turingcom_logo.svg", "asana_logo.svg", "healthline_media_logo.svg"] },
  { name: "David Do", bio: "20 years managing 500+ engineers. Multi-million-dollar outsourced engineering contracts.", avatar: "/images/avt-daviddo.png", logos: ["alphaplus_metaverse_logo.svg", "alphaway_logo.svg", "ibm_logo.svg", "ericsson_logo.svg", "techcombank_logo.svg"] },
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
  { title: "RLHF & SFT", description: "Expert-driven reinforcement learning from human feedback and supervised fine-tuning.", icon: "Brain" },
  { title: "Data Annotation", description: "Multi-modal annotation across text, image, video, and audio.", icon: "Tags" },
  { title: "AI Agent Evaluation", description: "Multi-step benchmark tasks for frontier AI agents.", icon: "BarChart3" },
  { title: "Robotics Data", description: "Ground-truth motion and hand pose data with lab-grade precision.", icon: "Bot" },
  { title: "Quality Assurance", description: "AI-native QC with automated pre-screening and expert review.", icon: "ShieldCheck" },
  { title: "Expert Teams", description: "On-demand domain expert pods across 17+ countries.", icon: "Users" },
];

// ── Physical AI page ──
export const PHYSICAL_AI_PROBLEMS = [
  { title: "Ego-Diverse", description: "Household walking tasks — cooking, cleaning, assembly.", accuracy: "5.2mm", tier: "T1", status: "Active" },
  { title: "UMI-Diverse", description: "Gripper manipulation, Stanford UMI standard.", accuracy: "6DoF", tier: "UMI", status: "Active" },
  { title: "Ego-Dexterous", description: "Sub-mm fine manipulation — threading, origami.", accuracy: "0.8mm", tier: "T3", status: "Active" },
  { title: "Residential OTS", description: "Tidying, dishes, laundry, home mapping.", accuracy: "5.2mm", tier: "T1", status: "Active" },
  { title: "Commercial OTS", description: "Warehouse, retail, food service, manufacturing.", accuracy: "5.2mm", tier: "T1", status: "Active" },
  { title: "Dexterous Hand", description: "≥13 DoF hands with tactile sensors.", accuracy: "Joints", tier: "Robot", status: "Phase 2" },
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
