/**
 * Data project configuration registry.
 * Each data type (terminal-bench, vision-bench, etc.) is defined here.
 * This powers the generic /data/[dataType] routing and admin management.
 */

export interface DataProjectConfig {
  slug: string;
  name: string;
  description: string;
  passcodePrefix: string;
  viewerTabs: ViewerTab[];
  authRequired: boolean;
  dbProject: string; // Value in batches.project column
}

export type ViewerTab =
  | "overview"
  | "instructions"
  | "files"
  | "tests"
  | "solution";

export const DATA_PROJECTS: Record<string, DataProjectConfig> = {
  "terminal-bench": {
    slug: "terminal-bench",
    name: "Terminal Bench",
    description:
      "Production-grade training data & evaluation environments for terminal-based AI agents.",
    passcodePrefix: "TB",
    viewerTabs: ["overview", "instructions", "files", "tests", "solution"],
    authRequired: true,
    dbProject: "terminal-bench",
  },
  // Future data types:
  // "vision-bench": { ... },
  // "nlp-bench": { ... },
};

export function getDataProject(
  slug: string
): DataProjectConfig | undefined {
  return DATA_PROJECTS[slug];
}

export function getAllDataProjects(): DataProjectConfig[] {
  return Object.values(DATA_PROJECTS);
}
