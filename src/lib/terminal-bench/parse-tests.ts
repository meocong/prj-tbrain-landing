import { spawnSync } from "child_process";
import type { TestEntry } from "./types";

const PY = `
import ast, json, sys
src = sys.stdin.read()
tree = ast.parse(src)
out = []
for node in tree.body:
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name.startswith("test_"):
        out.append({"name": node.name, "docstring": ast.get_docstring(node)})
    elif isinstance(node, ast.ClassDef):
        for sub in node.body:
            if isinstance(sub, (ast.FunctionDef, ast.AsyncFunctionDef)) and sub.name.startswith("test_"):
                out.append({"name": f"{node.name}.{sub.name}", "docstring": ast.get_docstring(sub)})
print(json.dumps(out))
`;

/**
 * Parses a Python test module and returns `[{name, docstring}, ...]`.
 * Falls back to an empty array on parse errors.
 */
export function parseTestsPython(source: string): TestEntry[] {
  const res = spawnSync("python3", ["-c", PY], { input: source, encoding: "utf8" });
  if (res.status !== 0 || !res.stdout) {
    console.warn("[terminal-bench] parseTestsPython failed:", res.stderr?.slice(0, 400));
    return [];
  }
  try {
    return JSON.parse(res.stdout) as TestEntry[];
  } catch {
    return [];
  }
}
