import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type CaseStudyMetric = { value: string; label: string };

export type CaseStudy = {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  metrics: CaseStudyMetric[];
  extendedContent?: string | null;
  clientName?: string | null;
  industry?: string | null;
  engagementLength?: string | null;
  pdfFilename?: string | null;
  pdfGcsObject?: string | null;
};

function fallbackCaseStudies(): CaseStudy[] {
  return [
    {
      slug: "egocentric-foundation-model",
      title: "Egocentric Data for a Robot Foundation Model",
      shortDescription: "Lab-grade first-person manipulation data, RLDS-ready",
      description:
        "A frontier robotics team needed diverse egocentric manipulation data to pretrain a cross-embodiment VLA. Tbrain ran the EgoKit factory pack across home, market, and workshop environments, synchronized capture against a hardware clock, auto-filtered broken demonstrations with AI-native QC, and delivered everything in RLDS / LeRobot format.",
      image: "/images/robotics-hero.jpg",
      industry: "Physical AI / VLA",
      metrics: [
        { value: "Egocentric", label: "Capture type" },
        { value: "RLDS", label: "Delivery format" },
        { value: "≥85%", label: "QC pass-rate" },
        { value: "≤48h", label: "Turnaround" },
      ],
    },
    {
      slug: "world-model-ground-truth",
      title: "Real-World Video to Ground a World Model",
      shortDescription: "Diverse, action-labeled video synthetic data can't fake",
      description:
        "A world-model lab trained on game and simulated environments needed real, action-paired video to anchor its predictions in physics. Tbrain supplied long egocentric sequences from East-Asian kitchens, markets, and workshops — with synchronized action labels and language captions — as ground truth for sim-to-real transfer.",
      image: "/images/mocap-studio.jpg",
      industry: "World models",
      metrics: [
        { value: "Multi-env", label: "Diversity" },
        { value: "Action-paired", label: "Labels" },
        { value: "Long-form", label: "Sequences" },
        { value: "Asian", label: "Environments" },
      ],
    },
    {
      slug: "teleop-cold-start",
      title: "Teleop Cold-Start for a Manipulation Startup",
      shortDescription: "Fast, QC'd demos to bootstrap a new task",
      description:
        "A mid-tier robotics startup needed cold-start data for a new manipulation task without standing up a collection org. Tbrain delivered pre-QC'd teleoperation and UMI demonstrations, plugged directly into the customer's training pipeline in days, exported to LeRobot.",
      image: "/images/data-dashboard.jpg",
      industry: "Robotics startup",
      metrics: [
        { value: "Teleop + UMI", label: "Data type" },
        { value: "Days", label: "To first batch" },
        { value: "LeRobot", label: "Format" },
        { value: "3-layer", label: "Human QA" },
      ],
    },
    {
      slug: "agent-evaluation",
      title: "Evaluation and Benchmarks for Agents",
      shortDescription: "Delivering enterprise-grade AI agents at unprecedented speed",
      description:
        "A global enterprise engaged Tbrain to stand up 6 domain-specific Q&A agents and a practical evaluation framework. We delivered production-grade agents grounded in authentic, approved knowledge in just 1 month from kickoff to handoff.",
      image: "/images/code-screen.jpg",
      metrics: [
        { value: "6", label: "Production Agents" },
        { value: "1", label: "Month Delivery" },
        { value: "720", label: "Test Queries" },
        { value: "270", label: "Curated Files" },
      ],
    },
    {
      slug: "manufacturing",
      title: "High-Accuracy CAD Annotation and Review Project",
      shortDescription: "Delivering mission-critical data for AI-powered manufacturing intelligence",
      description:
        "Tbrain partnered with a leading AI-powered manufacturing company to process and review 500 complex CAD drawings across 15 annotation fields within a strict 30-day delivery window.",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop",
      metrics: [
        { value: "500", label: "CAD Drawings" },
        { value: "15", label: "Annotation Fields" },
        { value: "95%+", label: "Accuracy Rate" },
        { value: "30", label: "Days Delivery" },
      ],
    },
    {
      slug: "scalable-multimodal",
      title: "Scalable Multimodal Data Labeling for Advanced GenAI Training",
      shortDescription: "Creating 48,000 complex visual prompts across 7 scientific disciplines",
      description:
        "Scaled from zero to 48,000 high-quality visual prompts in 4 months across chemistry, biology, medical sciences, mathematics, physics, engineering, and economics.",
      image: "/images/labeling.svg",
      metrics: [
        { value: "48K", label: "Visual Prompts" },
        { value: "7", label: "Scientific Domains" },
        { value: "600", label: "Expert Makers" },
        { value: "90%", label: "Pass Rate" },
      ],
    },
  ];
}

type Row = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  metrics: CaseStudyMetric[] | null;
  display_order: number;
  is_active: boolean;
  extended_content?: string | null;
  client_name?: string | null;
  industry?: string | null;
  engagement_length?: string | null;
  pdf_filename?: string | null;
  pdf_gcs_object?: string | null;
};

const DETAIL_COLS =
  "id, slug, title, short_description, description, image_url, metrics, display_order, is_active, extended_content, client_name, industry, engagement_length, pdf_filename, pdf_gcs_object";

function rowToStudy(r: Row): CaseStudy {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    shortDescription: r.short_description ?? "",
    description: r.description ?? "",
    image: r.image_url || "/images/code-screen.jpg",
    metrics: Array.isArray(r.metrics) ? r.metrics : [],
    extendedContent: r.extended_content ?? null,
    clientName: r.client_name ?? null,
    industry: r.industry ?? null,
    engagementLength: r.engagement_length ?? null,
    pdfFilename: r.pdf_filename ?? null,
    pdfGcsObject: r.pdf_gcs_object ?? null,
  };
}

/**
 * Read active case studies from DB. Falls back to the static constants if the
 * table is empty or the query fails — guarantees /casestudy never goes blank.
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("case_studies")
      .select(DETAIL_COLS)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return fallbackCaseStudies();

    return (data as Row[]).map(rowToStudy);
  } catch (err) {
    console.error("[case-studies] load failed, using fallback:", err);
    return fallbackCaseStudies();
  }
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("case_studies")
      .select(DETAIL_COLS)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return fallbackCaseStudies().find((study) => study.slug === slug) ?? null;

    return rowToStudy(data as Row);
  } catch (err) {
    console.error("[case-study] load failed, using fallback:", err);
    return fallbackCaseStudies().find((study) => study.slug === slug) ?? null;
  }
}
