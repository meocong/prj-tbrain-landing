// ── Trust Metrics ──
export const TRUST_METRICS = [
  { value: "48K+", label: "AI Training Experts" },
  { value: "250+", label: "Projects Delivered" },
  { value: "17+", label: "Countries" },
  { value: "500+", label: "Benchmark Tasks" },
];

// ── Product Pillars (homepage) ──
export const PRODUCT_PILLARS = [
  {
    title: "Terminal Bench",
    subtitle: "AI Agent Evaluation",
    description:
      "Multi-step reasoning tasks for evaluating AI terminal agents. 4-layer validation ensures tasks are hard enough for frontier models, with domain coverage across Linux, DevOps, Security, and Database.",
    href: "/data/terminal-bench",
    metrics: [
      { value: "500+", label: "Benchmark Tasks" },
      { value: "4", label: "Validation Layers" },
      { value: "≤20%", label: "GPT-5 Pass Rate" },
      { value: "8+", label: "Domain Categories" },
    ],
    icon: "Terminal",
    color: "#6C3CF4",
  },
  {
    title: "Physical AI Data",
    subtitle: "Robot Training Data",
    description:
      "High-fidelity egocentric video and hand pose data for robot training. 3-tier hardware framework with peer-reviewed accuracy from 5mm to sub-millimeter, covering household to commercial robotics.",
    href: "/data/physical-ai",
    metrics: [
      { value: "6", label: "Problem Categories" },
      { value: "0.8mm", label: "Best Accuracy" },
      { value: "829h", label: "Reference Dataset" },
      { value: "3", label: "Hardware Tiers" },
    ],
    icon: "Bot",
    color: "#0151FF",
  },
  {
    title: "Custom Data Programs",
    subtitle: "RLHF, SFT & Annotation",
    description:
      "End-to-end data programs with domain expert pods. From RLHF and SFT data generation to multi-modal annotation across text, image, video, and audio — all backed by AI-native QC.",
    href: "/services",
    metrics: [
      { value: "48K", label: "Annotations/4mo" },
      { value: "90%+", label: "Accuracy" },
      { value: "3+", label: "Modalities" },
      { value: "24/7", label: "Operations" },
    ],
    icon: "Database",
    color: "#10B981",
  },
];

// ── Platform Features ──
export const PLATFORM_FEATURES = [
  {
    title: "AI-Native QC Pipeline",
    description: "Automated quality checks pre-screen 60-70% of submissions. Humans review edge cases only.",
    icon: "ShieldCheck",
  },
  {
    title: "Real-Time Dashboards",
    description: "Live project metrics, submission tracking, and team velocity — visible to customers.",
    icon: "BarChart3",
  },
  {
    title: "Multi-Tenant Isolation",
    description: "Workspace-level data isolation with audit trails. Your data never touches other projects.",
    icon: "Lock",
  },
  {
    title: "Agentic Workflows",
    description: "4 specialized agents automate QC, delivery, cloud sync, and notifications end-to-end.",
    icon: "Workflow",
  },
];

// ── Case Studies ──
export const FEATURED_CASE_STUDIES = [
  {
    title: "Terminal Bench: AI Agent Evaluation",
    shortDescription: "500+ multi-step reasoning tasks with 4-layer validation",
    description:
      "Designed and validated 500+ benchmark tasks for evaluating AI terminal agents. Each task requires multi-step reasoning across Linux sysadmin, DevOps, Security, and Database domains. Pass rate capped at ≤20% for GPT-5 through our 4-layer validation pipeline.",
    image: "/images/labeling.svg",
    metrics: [
      { value: "500+", label: "Tasks" },
      { value: "≤20%", label: "GPT-5 Pass" },
      { value: "4", label: "Validation Layers" },
      { value: "8+", label: "Domains" },
    ],
  },
  {
    title: "Physical AI: Robot Training Data",
    shortDescription: "Sub-mm hand pose accuracy for robot learning",
    description:
      "Producing high-fidelity egocentric video and 3D hand pose data across 6 problem categories. 3-tier hardware framework delivers 0.8mm accuracy for fine manipulation tasks, validated against peer-reviewed benchmarks (EgoDex 829h, OpenEgo 1.1K hours).",
    image: "https://qdrant.tech/img/ai-agent.svg",
    metrics: [
      { value: "6", label: "Problem Types" },
      { value: "0.8mm", label: "Best Accuracy" },
      { value: "829h", label: "Reference Data" },
      { value: "3", label: "Hardware Tiers" },
    ],
  },
  {
    title: "Multimodal Data Annotation at Scale",
    shortDescription: "48K annotations in 4 months across 3 modalities",
    description:
      "Scaled from zero to 48,000 high-quality multimodal annotations in just 4 months. Delivered consistent, production-ready labeled data across text, image, and audio modalities for enterprise AI training.",
    image: "/images/labeling.svg",
    metrics: [
      { value: "48K", label: "Annotations" },
      { value: "4", label: "Months" },
      { value: "3", label: "Modalities" },
      { value: "90%", label: "Accuracy" },
    ],
  },
];

// ── Sample Projects (legacy) ──
export const SAMPLE_PROJECTS = [
  { title: "Chatbot data generation", description: "Make Q&A pairs to train a chatbot on medical questions.", icon: "/icons/icon_chatbot.svg" },
  { title: "Training data generation", description: "Assess the accuracy and validity of LLM-generated responses in advanced domains.", icon: "/icons/icon_training.svg" },
  { title: "Audio Data Collection", description: "Gather high-quality audio data to enhance smart device capabilities.", icon: "/icons/icon_audio.svg" },
];

// ── Physical AI Data (for /data/physical-ai page) ──
export const PHYSICAL_AI_PROBLEMS = [
  {
    title: "Ego-Diverse",
    description: "Walking tasks in household environments — cooking, cleaning, assembly. Standard tier with Leap Motion 2 backpack.",
    accuracy: "5.2mm",
    tier: "T1",
    status: "Active",
  },
  {
    title: "UMI-Diverse",
    description: "Gripper-based manipulation tasks following Stanford UMI standard. Cheapest entry point for robot training data.",
    accuracy: "6DoF pose",
    tier: "Stanford UMI",
    status: "Active",
  },
  {
    title: "Ego-Dexterous",
    description: "Sub-mm fine manipulation — threading, screw insertion, origami. Premium tier with Apple Vision Pro.",
    accuracy: "0.8mm",
    tier: "T3",
    status: "Active",
  },
  {
    title: "Residential OTS",
    description: "Household tasks — tidying, dishes, laundry, home mapping. Reuses shared T1 hardware from Ego-Diverse.",
    accuracy: "5.2mm",
    tier: "T1",
    status: "Active",
  },
  {
    title: "Commercial OTS",
    description: "11 commercial sectors — warehouse, retail, food service, cleaning, manufacturing operations.",
    accuracy: "5.2mm",
    tier: "T1",
    status: "Active",
  },
  {
    title: "Dexterous Hand Teleoperation",
    description: "Robot data with ≥13 DoF hands (Shadow/Allegro) and tactile sensors. Requires hardware partnership.",
    accuracy: "Joint angles",
    tier: "Robot-grade",
    status: "Phase 2",
  },
];

export const PHYSICAL_AI_TIERS = [
  {
    tier: "T1",
    name: "Standard",
    hardware: "Ultraleap Leap Motion 2 + Jetson Orin Nano backpack",
    accuracy: "5.2-5.3mm 3D MPJPE",
    cost: "$2,008",
    source: "MDPI Sensors Dec 2025",
    bestFor: "Ego-Diverse, Residential, Commercial",
    recommended: true,
  },
  {
    tier: "T2",
    name: "Budget",
    hardware: "Stereo GoPro + HaMeR post-processing fusion",
    accuracy: "15-20mm 3D MPJPE",
    cost: "$1,532",
    source: "HaMeR paper + Pose2Sim",
    bestFor: "Budget fallback (rarely used)",
    recommended: false,
  },
  {
    tier: "T3",
    name: "Premium",
    hardware: "Apple Vision Pro (ARKit) + GoPro external",
    accuracy: "0.8 ± 0.3mm 3D MPJPE",
    cost: "$4,539",
    source: "MDPI Sensors 2025, EgoDex 829h",
    bestFor: "Ego-Dexterous (fine manipulation)",
    recommended: true,
  },
];

export const PHYSICAL_AI_DATASETS = [
  { name: "EgoDex", volume: "829 hours", quality: "21-joint hand (AVP ARKit 0.8mm)", useCase: "Ego-Dexterous reference" },
  { name: "OpenEgo", volume: "1,107 hours", quality: "21-joint unified", useCase: "Ego-Diverse format reference" },
  { name: "EPIC-KITCHENS", volume: "100 hours", quality: "Action labels", useCase: "Residential validation" },
  { name: "UMI Community", volume: "1,400 hours", quality: "SLAM 6DoF", useCase: "UMI-Diverse pipeline" },
];

// ── Experts ──
export const EXPERTS = [
  {
    name: "Nguyen Minh T.",
    bio: "Radiologist with 9+ years of experience at a top international hospital in Hanoi, specializing in diagnostic imaging and image-guided interventions",
    domain: "Medical",
    avatar: "/images/avt-1.png",
  },
  {
    name: "Trang M.",
    bio: "Co-founder of PowerGate Labs\nHead of AI at PowerGate Group\nPh.D. in Software Engineering",
    domain: "Coding / AI",
    avatar: "/images/avt-2.png",
  },
  {
    name: "Huy L.",
    bio: "AI Expert at PowerGate\nPh.D. in engineering with research interest on deep learning\nResearcher at Phenikaa University",
    domain: "Coding / AI",
    avatar: "/images/avt-3.png",
  },
  {
    name: "Tu Ng.",
    bio: "10+ years in Data Science\nHead of AI at PowerGate Labs\nMS Computer Science\nExpert in Python, SQL, ML",
    domain: "Data",
    avatar: "/images/avt-4.png",
  },
];

export const EXPERTISE_AREAS = [
  { label: "Data Scientists / Engineers:", detail: "Python, SQL, machine learning, LLM" },
  { label: "Mathematics:", detail: "real analysis, linear algebra, topology, number theory" },
  { label: "Science:", detail: "Physics, chemistry, and biology" },
  { label: "Physical AI:", detail: "egocentric video, hand pose, robot teleoperation" },
  { label: "Coding / Software:", detail: "Python, C++, Java, full stack, DevOps, Linux sysadmin" },
  { label: "Finance & Business:", detail: "macroeconomics, financial reporting" },
  { label: "Medical Sciences:", detail: "Clinical, Imaging, Diagnostics & Laboratory Medicine" },
];

export const LEADERSHIP = [
  {
    name: "Tam Le",
    bio: "Seasoned Data Science and Analytics leader with over 15 years of experience across big tech and startups, including Google, Adobe, and Asana. Expertise in AI training at Turing.",
    avatar: "/images/avt-tamle.png",
    logos: ["google_logo.svg", "turingcom_logo.svg", "asana_logo.svg", "healthline_media_logo.svg"],
  },
  {
    name: "David Do",
    bio: "Senior Software Engineering leader with 20 years managing outsourced teams. Formerly led an engineering organization of 500+ professionals and multi-million-dollar contracts.",
    avatar: "/images/avt-daviddo.png",
    logos: ["alphaplus_metaverse_logo.svg", "alphaway_logo.svg", "ibm_logo.svg", "ericsson_logo.svg", "techcombank_logo.svg"],
  },
];

export const SERVICES = [
  { title: "RLHF & SFT", description: "Expert-driven reinforcement learning from human feedback and supervised fine-tuning data generation.", icon: "Brain" },
  { title: "Data Annotation", description: "High-quality multi-modal annotation across text, image, video, and audio.", icon: "Tags" },
  { title: "AI Agent Evaluation", description: "Multi-step benchmark tasks and evaluation frameworks for AI agents.", icon: "BarChart3" },
  { title: "Physical AI Data", description: "Egocentric video and hand pose data for robot training with sub-mm accuracy.", icon: "Bot" },
  { title: "Quality Assurance", description: "AI-native QC pipeline with automated pre-screening and human expert review.", icon: "ShieldCheck" },
  { title: "Expert Teams", description: "On-demand domain-specific expert pods across 17+ countries.", icon: "Users" },
];
