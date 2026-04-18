"use client";

import { useMemo, useState } from "react";

interface FileManifestEntry {
  path: string;
  size_bytes: number | null;
}

interface DirNode {
  type: "dir";
  name: string;
  children: Map<string, TreeNode>;
}
interface FileNode {
  type: "file";
  name: string;
  path: string;
  size: number | null;
}
type TreeNode = DirNode | FileNode;

function buildTree(entries: FileManifestEntry[]): DirNode {
  const root: DirNode = { type: "dir", name: "", children: new Map() };
  for (const e of entries) {
    const parts = e.path.split("/").filter(Boolean);
    let node: DirNode = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const existing = node.children.get(part);
      if (existing && existing.type === "dir") {
        node = existing;
      } else {
        const created: DirNode = { type: "dir", name: part, children: new Map() };
        node.children.set(part, created);
        node = created;
      }
    }
    const leaf = parts[parts.length - 1];
    node.children.set(leaf, {
      type: "file",
      name: leaf,
      path: e.path,
      size: e.size_bytes,
    });
  }
  return root;
}

export function FileExplorer({
  entries,
  activePath,
  onSelect,
}: {
  entries: FileManifestEntry[];
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  const tree = useMemo(() => buildTree(entries), [entries]);
  return (
    <div className="font-mono text-sm">
      <DirNodeView node={tree} depth={0} onSelect={onSelect} activePath={activePath} expandedByDefault />
    </div>
  );
}

function DirNodeView({
  node,
  depth,
  onSelect,
  activePath,
  expandedByDefault,
}: {
  node: DirNode;
  depth: number;
  onSelect: (path: string) => void;
  activePath: string | null;
  expandedByDefault: boolean;
}) {
  const [expanded, setExpanded] = useState(expandedByDefault || depth < 2);
  const children = useMemo(() => {
    const list = Array.from(node.children.values());
    list.sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [node.children]);

  return (
    <div>
      {depth > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-1 py-1 text-left text-[#0e1b2e] hover:text-[#6C3CF4]"
          style={{ paddingLeft: depth * 14 }}
        >
          <span className="text-[#78818f]">{expanded ? "▾" : "▸"}</span>
          <span>{node.name}</span>
        </button>
      ) : null}
      {expanded ? (
        <div>
          {children.map((child) =>
            child.type === "dir" ? (
              <DirNodeView
                key={child.name}
                node={child}
                depth={depth + 1}
                onSelect={onSelect}
                activePath={activePath}
                expandedByDefault={false}
              />
            ) : (
              <button
                type="button"
                key={child.path}
                onClick={() => onSelect(child.path)}
                className={`block w-full truncate py-1 text-left ${
                  activePath === child.path
                    ? "text-[#6C3CF4]"
                    : "text-[#0e1b2e] hover:text-[#6C3CF4]"
                }`}
                style={{ paddingLeft: (depth + 1) * 14 }}
              >
                {child.name}
              </button>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
