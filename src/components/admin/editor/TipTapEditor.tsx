"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Toolbar } from "./Toolbar";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onWordCount?: (count: number) => void;
  placeholder?: string;
}

async function uploadInlineImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/uploads/image", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || !json.url) {
    throw new Error(json.error ?? "upload_failed");
  }
  return json.url as string;
}

export function TipTapEditor({
  content,
  onChange,
  onWordCount,
  placeholder = "Start writing your article...",
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {
          HTMLAttributes: { class: "bg-gray-900 text-gray-100 rounded-lg p-4 my-4 text-sm font-mono overflow-x-auto" },
        },
        blockquote: {
          HTMLAttributes: { class: "border-l-4 border-[#6C3CF4] pl-4 italic text-gray-600 my-4" },
        },
        // StarterKit v3 ships Link + Underline; we configure them explicitly below.
        link: false,
        underline: false,
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl my-6 max-w-full" },
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#6C3CF4] underline" },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({
        HTMLAttributes: { class: "bg-yellow-100 px-1 rounded" },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[500px] px-8 py-6 focus:outline-none " +
          "prose-headings:font-bold prose-headings:tracking-tight " +
          "prose-h1:text-[32px] prose-h1:mt-10 prose-h1:mb-4 " +
          "prose-h2:text-[26px] prose-h2:mt-8 prose-h2:mb-3 " +
          "prose-h3:text-[20px] prose-h3:mt-6 prose-h3:mb-2 " +
          "prose-p:text-[17px] prose-p:leading-[1.8] prose-p:text-gray-700 prose-p:my-3 " +
          "prose-li:text-[17px] prose-li:leading-[1.7] " +
          "prose-a:text-[#6C3CF4] prose-a:underline " +
          "prose-img:rounded-xl prose-img:my-6 " +
          "prose-blockquote:border-l-[#6C3CF4] prose-blockquote:text-gray-600 prose-blockquote:italic " +
          "prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm " +
          "prose-strong:font-semibold prose-strong:text-gray-900",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (onWordCount) {
        const text = editor.getText();
        onWordCount(text.split(/\s+/).filter(Boolean).length);
      }
    },
  });

  // Update content when prop changes (e.g., loading existing post)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const insertImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      const toastId = toast.loading("Uploading image…");
      try {
        const url = await uploadInlineImage(file);
        editor.chain().focus().setImage({ src: url }).run();
        toast.success("Image inserted", { id: toastId });
      } catch (err) {
        toast.error(`Upload failed: ${(err as Error).message}`, { id: toastId });
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // reset so re-uploading the same file fires onChange
      if (file) void insertImageFile(file);
    },
    [insertImageFile]
  );

  // Drag-and-drop + paste support so admins can just throw a screenshot in.
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      void insertImageFile(file);
    },
    [insertImageFile]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const item = Array.from(e.clipboardData.items).find((it) => it.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      e.preventDefault();
      void insertImageFile(file);
    },
    [insertImageFile]
  );

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white overflow-hidden"
      onDrop={onDrop}
      onPaste={onPaste}
      onDragOver={(e) => e.preventDefault()}
    >
      <Toolbar editor={editor} onImageUpload={handleImageUpload} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={onFileChange}
        className="hidden"
      />
      {uploading && (
        <div className="px-4 py-1.5 text-xs text-[#6C3CF4] bg-[#6C3CF4]/5 border-b border-[#6C3CF4]/10">
          Uploading image…
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
