export type Difficulty = "easy" | "medium" | "hard" | (string & {});

export interface SampleSpec {
  verifier_timeout_sec?: number;
  agent_timeout_sec?: number;
  build_timeout_sec?: number;
  cpus?: number;
  memory_mb?: number;
  storage_mb?: number;
}

export interface TestEntry {
  name: string;
  docstring: string | null;
}

export interface SampleRow {
  id: string;
  batch_id: string;
  slug: string;
  title: string;
  difficulty: Difficulty | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_email: string | null;
  expert_time_min: number | null;
  junior_time_min: number | null;
  spec_json: SampleSpec | null;
  instruction_md: string | null;
  tests_json: TestEntry[] | null;
  gcs_sample_zip_object: string | null;
  created_at: string;
}

export interface BatchRow {
  id: string;
  project: string;
  slug: string;
  name: string;
  description: string | null;
  gcs_batch_zip_object: string | null;
  created_at: string;
}

export interface FileRow {
  id: string;
  sample_id: string;
  path: string;
  mime: string | null;
  size_bytes: number | null;
  gcs_object: string | null;
}

export interface SessionClaims {
  batchIds: string[];
  clientId?: string;
  grantId?: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export type EventType =
  | "enter_success"
  | "enter_fail"
  | "view_sample"
  | "view_file"
  | "view_tests"
  | "view_solution"
  | "download_sample_zip"
  | "download_batch_zip";
