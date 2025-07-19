"use client";

import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu
} from "@tiptap/react";
import "../styles/tiptap-editor.css";
import { useState, useEffect, useRef } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import Focus from "@tiptap/extension-focus";
import CharacterCount from "@tiptap/extension-character-count";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  CheckSquare,
  Minus,
  Type,
  Palette,
  MoreHorizontal,
  ChevronDown,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Tiptap Toolbar Component - Exact Design Match
const TiptapMenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const toolbarItems = [
    {
      icon: Undo,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
      isDisabled: () => !editor.can().undo()
    },
    {
      icon: Redo,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
      isDisabled: () => !editor.can().redo()
    },
    { type: "divider" },
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold")
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic")
    },
    {
      icon: UnderlineIcon,
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline")
    },
    {
      icon: Strikethrough,
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike")
    },
    {
      icon: Code,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code")
    },
    { type: "divider" },
    {
      icon: LinkIcon,
      title: "Link",
      action: () => {
        const url = window.prompt("Enter URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      isActive: () => editor.isActive("link")
    },
    { type: "divider" },
    {
      icon: SubscriptIcon,
      title: "Subscript",
      action: () => editor.chain().focus().toggleSubscript().run(),
      isActive: () => editor.isActive("subscript")
    },
    {
      icon: SuperscriptIcon,
      title: "Superscript",
      action: () => editor.chain().focus().toggleSuperscript().run(),
      isActive: () => editor.isActive("superscript")
    },
    { type: "divider" },
    {
      icon: AlignLeft,
      title: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" })
    },
    {
      icon: AlignCenter,
      title: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" })
    },
    {
      icon: AlignRight,
      title: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" })
    },
    {
      icon: AlignJustify,
      title: "Justify",
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      isActive: () => editor.isActive({ textAlign: "justify" })
    },
    { type: "divider" },
    {
      icon: Plus,
      title: "Add",
      action: () => {},
      isActive: () => false
    },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-background border border-border rounded-lg shadow-sm overflow-x-auto">
      <TooltipProvider>
        {/* Headings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm font-medium min-w-[60px] justify-between"
                >
                  H1 <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Headings</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={editor.isActive("paragraph") ? "bg-muted" : ""}
            >
              Normal Text
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
              }
            >
              <Heading1 className="h-4 w-4 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
              }
            >
              <Heading2 className="h-4 w-4 mr-2" />
              Heading 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Main Toolbar Items */}
        {toolbarItems.map((item, index) => (
          <div key={index}>
            {item.type === "divider" ? (
              <Separator orientation="vertical" className="h-4 mx-1" />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={item.action}
                    disabled={item.isDisabled?.()}
                    className={cn(
                      "h-8 w-8 p-0",
                      item.isActive() && "bg-muted text-foreground"
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

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Lists */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("bulletList") && "bg-muted text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("orderedList") && "bg-muted text-foreground"
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Numbered List</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Blockquote */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                "h-8 w-8 p-0",
                editor.isActive("blockquote") && "bg-muted text-foreground"
              )}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Blockquote</p>
          </TooltipContent>
        </Tooltip>

        {/* Horizontal Rule */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Horizontal Rule</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        {/* Add Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-sm font-medium"
            >
              ⊞ Add
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add content</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const toolbarItems = [
    // History
    {
      icon: Undo,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
      isDisabled: () => !editor.can().undo()
    },
    {
      icon: Redo,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
      isDisabled: () => !editor.can().redo()
    },
    { type: "divider" },

    // Text Formatting
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold")
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic")
    },
    {
      icon: UnderlineIcon,
      title: "Underline",
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline")
    },
    {
      icon: Strikethrough,
      title: "Strikethrough",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike")
    },
    {
      icon: Code,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code")
    },
    {
      icon: Highlighter,
      title: "Highlight",
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: () => editor.isActive("highlight")
    },
    { type: "divider" },

    // Subscript/Superscript
    {
      icon: SubscriptIcon,
      title: "Subscript",
      action: () => editor.chain().focus().toggleSubscript().run(),
      isActive: () => editor.isActive("subscript")
    },
    {
      icon: SuperscriptIcon,
      title: "Superscript",
      action: () => editor.chain().focus().toggleSuperscript().run(),
      isActive: () => editor.isActive("superscript")
    },
    { type: "divider" },

    // Lists
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList")
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList")
    },
    {
      icon: CheckSquare,
      title: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive("taskList")
    },
    { type: "divider" },

    // Alignment
    {
      icon: AlignLeft,
      title: "Align Left",
      action: () => editor.chain().focus().setTextAlign("left").run(),
      isActive: () => editor.isActive({ textAlign: "left" })
    },
    {
      icon: AlignCenter,
      title: "Align Center",
      action: () => editor.chain().focus().setTextAlign("center").run(),
      isActive: () => editor.isActive({ textAlign: "center" })
    },
    {
      icon: AlignRight,
      title: "Align Right",
      action: () => editor.chain().focus().setTextAlign("right").run(),
      isActive: () => editor.isActive({ textAlign: "right" })
    },
    {
      icon: AlignJustify,
      title: "Justify",
      action: () => editor.chain().focus().setTextAlign("justify").run(),
      isActive: () => editor.isActive({ textAlign: "justify" })
    },
    { type: "divider" },

    // Quote and HR
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote")
    },
    {
      icon: Minus,
      title: "Horizontal Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: () => false
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-8 py-3">
      <div className="flex items-center gap-0.5 p-1 bg-background border border-border rounded-lg shadow-sm overflow-x-auto">
        <TooltipProvider>
          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Headings</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={editor.isActive("paragraph") ? "bg-muted" : ""}
              >
                Normal Text
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
                }
              >
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
                }
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
                }
              >
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-4 mx-1 bg-border/40" />

          {/* Main Toolbar Items */}
          {toolbarItems.map((item, index) => (
            <div key={index}>
              {item.type === "divider" ? (
                <Separator
                  orientation="vertical"
                  className="h-4 mx-1 bg-border/40"
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      disabled={item.isDisabled?.()}
                      className={cn(
                        "h-8 w-8 p-0 hover:bg-muted/50 transition-colors rounded flex-shrink-0",
                        item.isActive() && "bg-muted text-foreground",
                        item.isDisabled?.() && "opacity-50 cursor-not-allowed"
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

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More Options</p>
                </TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => setShowLinkInput(!showLinkInput)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addImage}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addTable}>
                <TableIcon className="h-4 w-4 mr-2" />
                Insert Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Link Input */}
          {showLinkInput && (
            <div className="flex items-center gap-2 ml-2">
              <Input
                type="url"
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-8 w-48"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLink();
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                }}
              />
              <Button size="sm" onClick={addLink} className="h-8">
                Add
              </Button>
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
};

// Main Advanced Rich Text Editor Component
export function AdvancedRichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your note..."
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
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer"
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg"
        }
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Placeholder.configure({
        placeholder
      }),
      Typography,
      TextStyle,
      Color,
      FontFamily,
      HorizontalRule,
      Dropcursor,
      Gapcursor,
      Focus.configure({
        className: "has-focus",
        mode: "all"
      }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[600px] px-8 py-8 text-base leading-relaxed",
        spellcheck: "false"
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
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
    <div className="h-full flex flex-col bg-background">
      {/* Sticky Toolbar - Exact Tiptap Design */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-6 py-3">
          <TiptapMenuBar editor={editor} />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <EditorContent
            editor={editor}
            className="tiptap-editor prose prose-lg max-w-none"
          />
        </div>
      </div>
    </div>
  );
}
