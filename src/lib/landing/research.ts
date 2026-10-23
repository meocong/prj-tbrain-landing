/**
 * University Research Program — content model for /researchprogram.
 *
 * Copy is verbatim from the program brief ("Tbrain University Research
 * Program — Open call for academic partners · October 2026", Google Doc
 * 1-G7dqMera4hZryGeBw0YiX2aEXV-3o2ooYo0AJEktBg). Edit the brief first, then
 * mirror it here: the page adds layout, never copy. Anything the components
 * show that is not a sentence of the brief (section numbers, the mono labels,
 * which footage plays behind which tile) is presentation and lives with them.
 */

export const RESEARCH_HERO = {
  program: "Tbrain University Research Program",
  status: "Open call for academic partners · October 2026",
  title: "An open invitation to robotics researchers",
  lead: "Tbrain is looking for university labs to explore a simple but unanswered question with us:",
  question: "what makes real-world human demonstration data valuable for robot learning?",
  weBring: "We bring real-world data and the ability to collect more of it.",
  youBring: "You bring the research.",
  shape: "The shape of each collaboration is up to you and your lab.",
} as const;

export interface Citation {
  /** Superscript marker in the running text. */
  n: number;
  label: string;
  href: string;
  host: string;
  /** The finding the brief attributes to this source, in the brief's words. */
  claim: string;
}

export const WHY_NOW = {
  title: "Why this question matters now",
  /* Kept as segments so the two citations can be drawn as inline references
     without rewording the paragraph around them. */
  p1: [
    { text: "The field is now collecting human demonstration video at very large scale. Recent work suggests that hours alone are a weak predictor of value. For example, scaling egocentric video to 30,000 hours taught a world model to predict hands well, but not how objects respond to them (" },
    { cite: 1 },
    { text: "). Other work found that well-chosen subsets of data can beat much larger pools (" },
    { cite: 2 },
    { text: ")." },
  ],
  p2: "If composition, quality and structure matter more than volume, the field needs to know how to measure them. Answering that takes careful, independent experiments on real-world data, which is the kind of work universities do best.",
  citations: [
    {
      n: 1,
      label: "Dong et al., 2026",
      href: "https://arxiv.org/abs/2610.12464",
      host: "arxiv.org/abs/2610.12464",
      claim: "Scaling egocentric video to 30,000 hours taught a world model to predict hands well, but not how objects respond to them.",
    },
    {
      n: 2,
      label: "Axis Robotics",
      href: "https://axisrobotics.ai/blogs/blog/the-value-of-simulation-data-for-real-world-robot-learning-an-empirical-study",
      host: "axisrobotics.ai",
      claim: "Well-chosen subsets of data can beat much larger pools.",
    },
  ] as Citation[],
} as const;

export interface ResearchQuestion {
  key: "diversity" | "quality" | "structure" | "transfer" | "evaluation" | "simulation";
  topic: string;
  question: string;
}

export const QUESTIONS = {
  title: "Questions we're curious about",
  note: "These are starting points, not a fixed agenda. We're just as interested in the questions your lab already cares about.",
  items: [
    { key: "diversity", topic: "Diversity and scale", question: "when do more tasks, places or people help more than more hours?" },
    { key: "quality", topic: "Quality", question: "what makes one demonstration more useful than another, and are mistakes and recoveries useful signal?" },
    { key: "structure", topic: "Structure", question: "how much do labels for tasks, actions, objects and timing help learning?" },
    { key: "transfer", topic: "Transfer", question: "how do human demonstrations best carry over to robot bodies?" },
    { key: "evaluation", topic: "Evaluation", question: "how should demonstration data be judged fairly and independently?" },
    { key: "simulation", topic: "Simulation", question: "can real working environments become useful simulation or training environments?" },
  ] as ResearchQuestion[],
} as const;

export const OFFER = {
  title: "What we offer researchers",
  data: {
    topic: "Real-world data",
    body: "at least 2,000+ hours of egocentric human demonstrations across about 6,000 tasks and 100+ real working environments, including factories, workshops, kitchens and repair shops.",
    /* The three figures in `body`, pulled out for Table 1. Same numbers, same
       qualifiers as the sentence ("at least 2,000+", "about 6,000", "100+"). */
    figures: {
      hours: { qualifier: "at least", display: "2,000+", unit: "hours" },
      tasks: { qualifier: "about", display: "6,000", unit: "tasks" },
      environments: { qualifier: "", display: "100+", unit: "environments" },
    },
    places: ["factories", "workshops", "kitchens", "repair shops"],
  },
  collection: {
    topic: "Free collection for academic research",
    body: "new data collected around your lab's own tasks and questions.",
  },
  partner: {
    topic: "A data design partner",
    body: "help with the practical choices that decide whether a data experiment works, such as which tasks, devices, operators and protocols to use.",
    choices: ["tasks", "devices", "operators", "protocols"],
  },
  formats: {
    topic: "Ready-to-use formats",
    body: "delivery in common robotics formats, including LeRobot and RLDS.",
    names: ["LeRobot", "RLDS"],
  },
} as const;

export const COLLABORATION = {
  light: "as light as using a slice of our data",
  deep: "as deep as a co-designed study and a joint paper",
  sentence: "Collaborations can be as light as using a slice of our data, or as deep as a co-designed study and a joint paper.",
  thesis: "Student thesis projects are welcome too.",
  open: "We expect results to be published openly.",
} as const;

export const CONTACT = {
  title: "Get in touch",
  audienceLead: "We'd love to hear from faculty, postdocs and students working on robot learning, manipulation, vision-language-action models, world models, embodied perception, simulation or robot evaluation.",
  roles: ["faculty", "postdocs", "students"],
  fields: [
    "robot learning",
    "manipulation",
    "vision-language-action models",
    "world models",
    "embodied perception",
    "simulation",
    "robot evaluation",
  ],
  ask: "Send a short note about your lab and what you're curious about to Tam Le, Founder & CEO, at tam@tbrain.ai.",
  next: "We'll share sample data and set up a conversation.",
  person: { name: "Tam Le", role: "Founder & CEO", email: "tam@tbrain.ai", avatar: "/images/avt-tamle.png" },
  samples: { label: "Sample data", href: "/samples", display: "tbrain.ai/samples" },
} as const;

export const ABOUT = {
  title: "About Tbrain",
  body: "Tbrain builds real-world data infrastructure for physical AI, from capture in working environments through quality control and delivery. Our research interest is how data design, not just data volume, shapes what embodied AI can do.",
  site: { display: "tbrain.ai", href: "/" },
} as const;

/** Prefilled subject for every mail link on the page. */
export const MAIL_SUBJECT = "University Research Program";
