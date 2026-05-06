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
      slug: "manufacturing",
      title: "High-Accuracy CAD Annotation",
      shortDescription: "Manufacturing AI",
      description:
        "Revolutionizing manufacturing processes with AI-powered analytics and predictive modeling. Smart resource allocation and quality control systems that reduce costs and improve efficiency.",
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
      title: "Scalable Multimodal AI System",
      shortDescription: "Enterprise AI",
      description:
        "Scaled from zero to 48,000 high-quality multimodal annotations in just 4 months. Our team delivered consistent, production-ready labeled data across text, image, and audio modalities, enabling rapid model training and deployment.",
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
