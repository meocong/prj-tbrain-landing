/**
 * Careers — content model for /careers and /careers/[slug].
 *
 * Each posting is verbatim from its job description Google Doc; the first is
 * "Tbrain — Head of R&D / Senior Researcher — Physical AI"
 * (1Snn0Ijks-x3myILNqC0x9i1FZewSudxn8I0z2ZeEsyk). Edit the doc first, then
 * mirror it here: the pages add layout, never copy. What the components show
 * that is not a sentence of a doc (headings such as "Open positions", button
 * labels, the meta chips split out of the doc's header line) is presentation
 * and lives with them.
 *
 * Adding a role is adding an entry to POSITIONS: the list, the posting page,
 * its JobPosting structured data, the share card and the sitemap all read it.
 */

/** A run of text: plain, bold (as the doc sets it), or a link. */
export type Seg = string | { b: string } | { href: string; label: string };
export type Para = Seg[];

/** A list item the doc opens with a bold lead ("Set the research agenda."). */
export interface LeadItem {
  lead: string;
  body: string;
}

export interface Position {
  slug: string;
  title: string;
  /** Groups the list once roles span two or more teams; never shown before then. */
  team?: string;
  /** The doc's header line, "Tbrain.ai | Full-time | United States or Vietnam | Reports to the CEO", split. */
  company: string;
  employment: string;
  location: string;
  reportsTo: string;
  /** schema.org JobPosting fields the doc implies but does not print. */
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "INTERN";
  countries: string[];
  /** The day the posting went live on the site (YYYY-MM-DD). */
  datePosted: string;
  about: { title: string; body: Para[] };
  role: { title: string; body: string[] };
  responsibilities: { title: string; items: LeadItem[] };
  requirements: { title: string; items: string[]; note: string };
  why: { title: string; items: LeadItem[] };
  application: {
    title: string;
    location: Para;
    /** The sentence before the address: "Send your CV, … at Tbrain to". */
    ask: string;
    email: string;
    learnMore: Para;
  };
}

/** The doc's "About Tbrain", shared by every posting and the careers page. */
export const ABOUT_TBRAIN = {
  title: "About Tbrain",
  intro:
    "Tbrain builds the data and evaluation infrastructure for physical AI. We capture human demonstrations inside operating factories, kitchens, workshops and other real working environments, then turn them into datasets for AI labs and robotics companies.",
  /* The second paragraph, kept in its three parts so the question can be set
     on its own line without rewording the sentence around it. */
  questionLead: "Our research explores a central question:",
  question: "what makes real-world human demonstration data valuable for embodied AI?",
  approach:
    "We combine access to diverse working environments, an in-house collection team and university collaborations to investigate how data shapes what models can learn.",
} as const;

const RESEARCH_PROGRAM_LINK = { href: "/researchprogram", label: "University Research Program" };

export const HEAD_OF_RD: Position = {
  slug: "head-of-rd-physical-ai",
  title: "Head of R&D / Senior Researcher — Physical AI",
  team: "R&D",
  company: "Tbrain.ai",
  employment: "Full-time",
  location: "United States or Vietnam",
  reportsTo: "Reports to the CEO",
  employmentType: "FULL_TIME",
  countries: ["US", "VN"],
  datePosted: "2026-10-29",
  about: {
    title: ABOUT_TBRAIN.title,
    body: [
      [ABOUT_TBRAIN.intro],
      [`${ABOUT_TBRAIN.questionLead} `, { b: ABOUT_TBRAIN.question }, ` ${ABOUT_TBRAIN.approach}`],
    ],
  },
  role: {
    title: "The role",
    body: [
      "We are looking for an experienced researcher to build and lead Tbrain’s research function. Depending on experience, we will hire for this role as Head of R&D or as Senior Researcher.",
      "You will set our research direction, build a small team and turn promising ideas into capabilities that improve our data, products and customers’ results. Working directly with the CEO, you will connect scientific research with the practical needs of AI labs and robotics companies.",
      "This is a hands-on leadership role responsible for establishing and building Tbrain’s R&D team, with substantial autonomy to shape its direction. We are looking for someone who can move between research, engineering and collaboration, make thoughtful trade-offs and take responsibility for outcomes.",
    ],
  },
  responsibilities: {
    title: "What you will do",
    items: [
      { lead: "Set the research agenda.", body: "Identify important problems in physical AI data, define priorities and lead research that advances Tbrain’s capabilities." },
      { lead: "Connect data to model performance.", body: "Investigate how the quality, diversity and structure of human demonstrations affect robot learning and world models." },
      { lead: "Turn research into products.", body: "Work with engineering and operations to translate findings into better collection methods, data processing, evaluation tools and customer offerings." },
      { lead: "Build and lead the team.", body: "Recruit and mentor researchers and engineers, establishing a culture of rigorous experimentation and strong execution." },
      { lead: "Develop research partnerships.", body: "Lead collaborations with university labs, scientific advisors and industry researchers, including joint studies and publications." },
      { lead: "Work with customers.", body: "Understand the technical needs of AI labs and robotics companies and use those insights to guide research priorities." },
      { lead: "Represent Tbrain’s research.", body: "Communicate findings through papers, technical reports, benchmarks and conversations with the wider research community." },
    ],
  },
  requirements: {
    title: "What you bring",
    items: [
      "A strong research or applied engineering background in robotics, computer vision, machine learning or embodied AI.",
      "A PhD in a relevant field, or equivalent research and engineering accomplishments.",
      "Evidence of meaningful contributions through publications, open-source work or systems used in practice.",
      "Strong hands-on technical skills and experience turning research ideas into working implementations.",
      "Experience leading technical projects and mentoring researchers or engineers.",
      "The judgment to balance scientific ambition with customer needs, time and resources.",
      "Strong English communication skills for research, partnerships and customer discussions.",
    ],
    note: "Experience with robot learning, egocentric video, multimodal data, evaluation or simulation is particularly relevant. You should bring depth in one or more areas and curiosity about the others.",
  },
  why: {
    title: "Why Tbrain",
    items: [
      { lead: "Research at the source:", body: "access real-world demonstrations across 100+ working environments, with an operations team that can collect new data around your research questions." },
      { lead: "A function you can shape:", body: "influence the research agenda, team and technical direction from an early stage." },
      { lead: "A direct path to impact:", body: "see your work influence datasets and tools used by AI labs and robotics companies." },
      { lead: "Scientific collaboration:", body: "develop research and publications with university partners under an agreed publication policy." },
      { lead: "Meaningful ownership:", body: "work directly with the CEO, with competitive compensation and equity." },
    ],
  },
  application: {
    title: "Location and application",
    location: [
      "The role is open to candidates based in the ",
      { b: "United States or Vietnam" },
      ", with regular collaboration with our Hanoi team and periodic travel to collection sites and research partners.",
    ],
    ask: "Send your CV, links to relevant work and a short note about what you would like to explore at Tbrain to",
    email: "research_program@tbrain.ai",
    /* Exactly as the doc: the link, then its address as a second link. */
    learnMore: [
      "Learn more at ",
      { href: "/", label: "tbrain.ai" },
      " and our ",
      RESEARCH_PROGRAM_LINK,
      " ",
      { href: RESEARCH_PROGRAM_LINK.href, label: "tbrain.ai/researchprogram" },
      ".",
    ],
  },
};

export const POSITIONS: Position[] = [HEAD_OF_RD];

export const positionBySlug = (slug: string) => POSITIONS.find((p) => p.slug === slug);

/** The careers page itself. "Why Tbrain" stays inside each posting, as the
    doc has it (Tam Le, 2026-10-29: "Why tbrain để trong role"). */
export const CAREERS = {
  title: "Careers at Tbrain",
  /* The H1 as the main pages set theirs ("Get in touch"): the last word in
     the site's gradient. */
  titleLead: "Careers at",
  titleHighlight: "Tbrain",
  openTitle: "Open positions",
  empty: "No open positions at the moment.",
  learnMore: RESEARCH_PROGRAM_LINK,
} as const;
