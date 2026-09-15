"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type InlineRichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
};

function normalizeEditorHtml(html: string) {
  const next = html.trim();
  return next === "<p></p>" ? "" : next;
}

async function uploadInlineImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/uploads/image", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) {
    throw new Error(json.error ?? "upload_failed");
  }
  return json.url as string;
}

export function InlineRichTextEditor({
  content,
  onChange,
  placeholder = "Write rich text...",
  className,
  minHeightClassName = "min-h-[88px]",
}: InlineRichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        horizontalRule: false,
        link: false,
        underline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#6C3CF4] underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "my-4 rounded-xl max-w-full" },
        allowBase64: false,
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({
        HTMLAttributes: { class: "rounded bg-yellow-100 px-1" },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          `${minHeightClassName} max-w-none px-3 py-2 outline-none ` +
          "prose prose-sm prose-slate " +
          "prose-headings:font-bold prose-headings:text-[#222222] prose-headings:tracking-normal " +
          "prose-h2:mb-2 prose-h2:mt-3 prose-h2:text-xl " +
          "prose-h3:mb-2 prose-h3:mt-3 prose-h3:text-base " +
          "prose-p:my-2 prose-p:leading-relaxed " +
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-1 " +
          "prose-strong:font-semibold prose-strong:text-gray-900",
      },
    },
    onUpdate: ({ editor }) => onChange(normalizeEditorHtml(editor.getHTML())),
  });

  useEffect(() => {
    if (!editor) return;
    const current = normalizeEditorHtml(editor.getHTML());
    const next = normalizeEditorHtml(content);
    if (current !== next) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("URL", previous);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  const insertImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      const toastId = toast.loading("Uploading image...");
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

  const addImage = useCallback(() => {
    if (!editor) return;
    fileInputRef.current?.click();
  }, [editor]);

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) void insertImageFile(file);
    },
    [insertImageFile]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
      if (!file) return;
      event.preventDefault();
      void insertImageFile(file);
    },
    [insertImageFile]
  );

  const onPaste = useCallback(
    (event: React.ClipboardEvent) => {
      const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith("image/"));
      if (!item) return;
      const file = item.getAsFile();
      if (!file) return;
      event.preventDefault();
      void insertImageFile(file);
    },
    [insertImageFile]
  );

  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#6C3CF4]/25 bg-white/85 shadow-sm transition focus-within:border-[#6C3CF4]/60 focus-within:shadow-[0_0_0_3px_rgba(108,60,244,0.12)] ${className ?? ""}`}
      onClick={(event) => event.stopPropagation()}
      onDrop={onDrop}
      onPaste={onPaste}
      onDragOver={(event) => event.preventDefault()}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5">
        <ToolButton onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} title="Undo">
          <Undo size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} title="Redo">
          <Redo size={14} />
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold">
          <Bold size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic">
          <Italic size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Underline">
          <UnderlineIcon size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolButton>
        <Divider />
        <ToolButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list">
          <List size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Numbered list">
          <ListOrdered size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Quote">
          <Quote size={14} />
        </ToolButton>
        <Divider />
        <ToolButton onClick={setLink} active={editor?.isActive("link")} title="Link">
          <LinkIcon size={14} />
        </ToolButton>
        <ToolButton onClick={addImage} disabled={uploading} title="Image">
          <ImageIcon size={14} />
        </ToolButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onFileChange}
          className="hidden"
        />
        <ToolButton onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter size={14} />
        </ToolButton>
        <ToolButton onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight size={14} />
        </ToolButton>
      </div>
      {uploading && (
        <div className="border-b border-[#6C3CF4]/10 bg-[#6C3CF4]/5 px-3 py-1 text-xs text-[#6C3CF4]">
          Uploading image...
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition ${
        active ? "bg-[#6C3CF4]/12 text-[#6C3CF4]" : "text-slate-500 hover:bg-white hover:text-slate-800"
      } ${disabled ? "cursor-not-allowed opacity-30" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-slate-200" />;
}
