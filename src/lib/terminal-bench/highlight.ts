// Server-only shiki singleton. Never import from a "use client" file.
import "server-only";
import { getHighlighter, type Highlighter } from "shiki";

const LANGS = [
  "bash", "shell", "python", "typescript", "javascript", "tsx", "jsx",
  "json", "yaml", "toml", "dockerfile", "md", "markdown", "diff", "ini",
  "sql", "html", "css", "go", "rust", "java", "c", "cpp",
] as const;

let _hl: Promise<Highlighter> | null = null;

export function getServerHighlighter(): Promise<Highlighter> {
  if (!_hl) {
    _hl = getHighlighter({
      themes: ["github-light"],
      langs: [...LANGS],
    });
  }
  return _hl;
}

const EXT_LANG: Record<string, string> = {
  ".py": "python",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".js": "javascript",
  ".jsx": "jsx",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".md": "markdown",
  ".sql": "sql",
  ".html": "html",
  ".css": "css",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".c": "c",
  ".cc": "cpp",
  ".cpp": "cpp",
  ".ini": "ini",
  ".diff": "diff",
  ".patch": "diff",
};

export function langForPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith("dockerfile") || lower.includes("/dockerfile")) return "dockerfile";
  const dot = lower.lastIndexOf(".");
  if (dot === -1) return "bash";
  return EXT_LANG[lower.slice(dot)] ?? "bash";
}

export async function highlightToHtml(code: string, lang: string): Promise<string> {
  const hl = await getServerHighlighter();
  const safeLang = hl.getLoadedLanguages().includes(lang as never) ? lang : "bash";
  return hl.codeToHtml(code, { lang: safeLang, theme: "github-light" });
}
