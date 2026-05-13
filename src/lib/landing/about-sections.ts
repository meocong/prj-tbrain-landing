import "server-only";
import type { AboutCardGroupKey } from "./about-card-groups";

export type AboutSection = {
  id?: string;
  groupKey: AboutCardGroupKey;
  eyebrow: string;
  titleBefore: string;
  titleHighlight: string | null;
  titleAfter: string | null;
  description: string | null;
  childWidgetType: "icon-card" | "profile-card" | "avatar-card";
  layout: "two" | "three" | "four";
  accent: string;
  displayOrder: number;
  isActive: boolean;
};

export async function getAboutSections(): Promise<AboutSection[]> {
  return FALLBACK_ABOUT_SECTIONS;
}

export const FALLBACK_ABOUT_SECTIONS: AboutSection[] = [
  {
    groupKey: "company",
    eyebrow: "/ company",
    titleBefore: "Built for the messy middle between",
    titleHighlight: "models and ground truth",
    titleAfter: "",
    description:
      "Tbrain is a data and evaluation partner for teams that need more than generic annotation: expert judgment, managed workflows, and measurable quality.",
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#6C3CF4",
    displayOrder: 10,
    isActive: true,
  },
  {
    groupKey: "value",
    eyebrow: "/ how we deliver value",
    titleBefore: "Optimized for",
    titleHighlight: "scaling complexity",
    titleAfter: "",
    description:
      "Legacy marketplaces break on high-stakes AI work. Tbrain provides verifiable software systems and expert-led loops required for agents to self-improve.",
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#6C3CF4",
    displayOrder: 20,
    isActive: true,
  },
  {
    groupKey: "sample_projects",
    eyebrow: "/ sample projects",
    titleBefore: "Programs that turn expertise into",
    titleHighlight: "model signal",
    titleAfter: "",
    description: null,
    childWidgetType: "icon-card",
    layout: "three",
    accent: "#10B981",
    displayOrder: 30,
    isActive: true,
  },
  {
    groupKey: "expertise",
    eyebrow: "/ technical expertise",
    titleBefore: "Deep technical expertise across",
    titleHighlight: "hard domains",
    titleAfter: "",
    description: null,
    childWidgetType: "icon-card",
    layout: "two",
    accent: "#6C3CF4",
    displayOrder: 40,
    isActive: true,
  },
  {
    groupKey: "team",
    eyebrow: "/ team",
    titleBefore: "The operators behind",
    titleHighlight: "Tbrain programs",
    titleAfter: "",
    description:
      "Tbrain combines AI training data operators, engineering delivery leaders, and domain experts to build evaluation, annotation, and human-feedback programs for high-stakes AI work.",
    childWidgetType: "profile-card",
    layout: "two",
    accent: "#6C3CF4",
    displayOrder: 50,
    isActive: true,
  },
  {
    groupKey: "experts",
    eyebrow: "/ expert network",
    titleBefore: "Domain experts when accuracy depends on depth",
    titleHighlight: "",
    titleAfter: "",
    description:
      "Tbrain works with specialized contributors across STEM, medical, coding, data science, robotics, and other technical domains where generic labeling teams are not enough.",
    childWidgetType: "avatar-card",
    layout: "four",
    accent: "#6C3CF4",
    displayOrder: 60,
    isActive: true,
  },
];
