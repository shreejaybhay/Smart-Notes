"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const items = [
    {
      icon: Undo,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
    },
    {
      icon: Redo,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
    },
    {
      type: "divider",
    },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      type: "divider",
    },
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      type: "divider",
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    {
      type: "divider",
    },
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: Code,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    {
      icon: Link2,
      title: "Link",
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: () => editor.isActive("link"),
    },
    {
      type: "divider",
    },
    {
      icon: AlignLeft,
      title: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" }),
    },
    {
      icon: AlignCenter,
      title: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" }),
    },
    {
      icon: AlignRight,
      title: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" }),
    },
    {
      icon: AlignJustify,
      title: "Justify",
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      isActive: () => editor.isActive({ textAlign: "justify" }),
    },
    {
      type: "divider",
    },
    {
      icon: Plus,
      title: "Add",
      action: () => {},
      isActive: () => false,
    },
  ];

  return (
    <TooltipProvider>
      <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-3 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {items.map((item, index) => (
          <div key={index}>
            {item.type === "divider" ? (
              <Separator
                orientation="vertical"
                className="h-4 mx-2 bg-border/40"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    className={cn(
                      "h-8 w-8 p-0 hover:bg-muted/70 transition-all duration-200 rounded-md",
                      item.isActive() && "bg-muted text-foreground shadow-sm"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-500 underline underline-offset-2 hover:text-blue-600",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-6 py-4",
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!isMounted) {
    return (
      <div className="w-full bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-1 px-4 py-3 border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-8 w-8 bg-muted/50 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 bg-muted/50 rounded-md animate-pulse"></div>
          <div className="h-8 w-8 bg-muted/50 rounded-md animate-pulse"></div>
        </div>
        <div className="min-h-[500px] bg-background p-8">
          <div className="h-4 bg-muted/50 rounded animate-pulse mb-4"></div>
          <div className="h-4 bg-muted/50 rounded animate-pulse mb-4 w-3/4"></div>
          <div className="h-4 bg-muted/50 rounded animate-pulse mb-4 w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <MenuBar editor={editor} />
      <div className="min-h-[500px] bg-background">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
