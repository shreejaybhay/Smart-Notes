"use client";

import React from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { useState, useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import Focus from "@tiptap/extension-focus";
import "../styles/tiptap-editor.css";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  CheckSquare,
  Minus,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Table as TableIcon,
  Palette,
  Type,
  SeparatorHorizontal as SeparatorIcon,
  MoreHorizontal,
  FileImage,
  Link2,
  Unlink
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
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

// Advanced Tiptap Toolbar Component
const TiptapMenuBar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) {
    return null;
  }

  // Get current heading level for display
  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return "H1";
    if (editor.isActive("heading", { level: 2 })) return "H2";
    if (editor.isActive("heading", { level: 3 })) return "H3";
    if (editor.isActive("heading", { level: 4 })) return "H4";
    return "H1";
  };

  // Advanced link functionality
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: "_blank" })
      .run();
  };

  // Image upload functionality
  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Table functionality
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  // Color functionality
  const setTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  // Highlight functionality
  const setHighlight = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  return (
    <div className="flex items-center gap-0.5 px-3 py-2 bg-background border border-border/50 rounded-lg shadow-sm overflow-x-auto min-h-[44px]">
      <TooltipProvider>
        {/* Undo/Redo */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  !editor.can().undo() && "opacity-40 cursor-not-allowed"
                )}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  !editor.can().redo() && "opacity-40 cursor-not-allowed"
                )}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Text Styles */}
        <div className="flex items-center">
          {/* Headings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2.5 text-sm font-medium min-w-[50px] justify-between hover:bg-muted/60 rounded-md transition-colors",
                  (editor.isActive("heading", { level: 1 }) ||
                    editor.isActive("heading", { level: 2 }) ||
                    editor.isActive("heading", { level: 3 }) ||
                    editor.isActive("heading", { level: 4 })) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                {getCurrentHeading()}{" "}
                <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={!editor.isActive("heading") ? "bg-muted/50" : ""}
              >
                <Type className="h-4 w-4 mr-2 opacity-70" />
                Normal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 1 }).run()
                }
                className={
                  editor.isActive("heading", { level: 1 }) ? "bg-muted/50" : ""
                }
              >
                <Heading1 className="h-4 w-4 mr-2 opacity-70" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "bg-muted/50" : ""
                }
              >
                <Heading2 className="h-4 w-4 mr-2 opacity-70" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "bg-muted/50" : ""
                }
              >
                <Heading3 className="h-4 w-4 mr-2 opacity-70" />
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().setHeading({ level: 4 }).run()
                }
                className={
                  editor.isActive("heading", { level: 4 }) ? "bg-muted/50" : ""
                }
              >
                <Heading className="h-4 w-4 mr-2 opacity-70" />
                Heading 4
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Lists Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  (editor.isActive("bulletList") ||
                    editor.isActive("orderedList") ||
                    editor.isActive("taskList")) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "bg-muted/50" : ""}
              >
                <List className="h-4 w-4 mr-2 opacity-70" />
                Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "bg-muted/50" : ""}
              >
                <ListOrdered className="h-4 w-4 mr-2 opacity-70" />
                Numbered
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={editor.isActive("taskList") ? "bg-muted/50" : ""}
              >
                <CheckSquare className="h-4 w-4 mr-2 opacity-70" />
                Task List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Text Formatting */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("bold") && "bg-muted/80 text-foreground"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("italic") && "bg-muted/80 text-foreground"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("underline") && "bg-muted/80 text-foreground"
                )}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("strike") && "bg-muted/80 text-foreground"
                )}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("code") && "bg-muted/80 text-foreground"
                )}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("highlight") && "bg-muted/80 text-foreground"
                )}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Highlight</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Links and Media */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("link") && "bg-muted/80 text-foreground"
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Link</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
                className="h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Image</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Script and Special */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleSubscript().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("subscript") && "bg-muted/80 text-foreground"
                )}
              >
                <SubscriptIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Subscript</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive("superscript") &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <SuperscriptIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Superscript</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Divider</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Text Alignment */}
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive({ textAlign: "left" }) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Left</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive({ textAlign: "center" }) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Center</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive({ textAlign: "right" }) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Right</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                className={cn(
                  "h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors",
                  editor.isActive({ textAlign: "justify" }) &&
                  "bg-muted/80 text-foreground"
                )}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Justify</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-6 bg-border/60 mx-2" />

        {/* Advanced Features */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted/60 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>More</p>
              </TooltipContent>
            </Tooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={insertTable}>
              <TableIcon className="h-4 w-4 mr-2 opacity-70" />
              Table
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addImage}>
              <FileImage className="h-4 w-4 mr-2 opacity-70" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <SeparatorIcon className="h-4 w-4 mr-2 opacity-70" />
              Divider
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </div>
  );
};

// Main Tiptap Editor Component
export function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  title,
  onTitleChange,
  isSaving = false,
  lastSaved = null,
  onSave,
  onToggleReadMode,
  readOnly = false,
  isTeamNote = false,
  teamName = null,
  userRole = null,
  hasUnsavedChanges = false,
  isReadMode = false
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  // Set mounted state on client side
  React.useEffect(() => {
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
      Typography,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer",
          target: "_blank"
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4"
        }
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-4 border-border"
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
        placeholder: placeholder || "Start writing..."
      }),
      CharacterCount,
      Dropcursor,
      Gapcursor,
      Focus.configure({
        className: "has-focus",
        mode: "all"
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        onChange(editor.getHTML());
      }
    }
  });

  if (!isMounted) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="px-6 py-3">
            <div className="h-10 bg-muted/50 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="h-4 bg-muted/50 rounded animate-pulse mb-4"></div>
            <div className="h-4 bg-muted/50 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="h-4 bg-muted/50 rounded animate-pulse mb-4 w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor-container">
      {/* Title Input - Mobile Responsive Layout */}
      <div className="tiptap-title-container">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-1">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {title !== undefined && onTitleChange && (
              <input
                type="text"
                value={title || ""}
                onChange={(e) => !readOnly && onTitleChange(e.target.value)}
                placeholder=""
                readOnly={readOnly}
                className={`flex-1 text-2xl sm:text-4xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 resize-none ${readOnly ? "cursor-default" : ""
                  }`}
                style={{ lineHeight: "1.2" }}
              />
            )}

            {/* Enhanced Save Status Indicator - Mobile Responsive */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-sm shrink-0">
              {readOnly && isTeamNote ? (
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted rounded-lg border">
                  <span className="text-xs font-medium text-muted-foreground">Read Only</span>
                  {userRole && (
                    <span className="text-xs opacity-70 hidden sm:inline">({userRole})</span>
                  )}
                </div>
              ) : (
                <>
                  {/* Save Status - Prominent on mobile */}
                  {isSaving ? (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
                      <span className="text-xs font-medium">Saving...</span>
                    </div>
                  ) : hasUnsavedChanges ? (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium">Unsaved</span>
                    </div>
                  ) : lastSaved && isMounted ? (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium">
                        <span className="sm:hidden">Saved</span>
                        <span className="hidden sm:inline">
                          Saved {new Date(lastSaved).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-muted/50 text-muted-foreground rounded-lg border border-border">
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                      <span className="text-xs font-medium">Ready</span>
                    </div>
                  )}

                  {/* Read Mode Toggle Button */}
                  {onToggleReadMode && (
                    <button
                      onClick={onToggleReadMode}
                      className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg border border-border/50 transition-all duration-200 text-xs font-medium"
                      title="Switch to Read Mode"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">Read Mode</span>
                    </button>
                  )}

                  {/* Mobile: Save Button, Desktop: Ctrl+S Hint */}
                  <div className="sm:hidden">
                    <Button
                      onClick={onSave}
                      disabled={isSaving || !hasUnsavedChanges}
                      size="sm"
                      className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${hasUnsavedChanges
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                        }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1" />
                          Saving
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>

                  {/* Desktop: Ctrl+S Hint */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 text-muted-foreground rounded-lg border border-border/50 transition-all duration-200 hover:bg-muted/50">
                    <span className="text-xs">Press</span>
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono font-medium shadow-sm">
                      Ctrl+S
                    </kbd>
                    <span className="text-xs">to save{isTeamNote ? " & log activity" : ""}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Toolbar - Stays in place */}
      {
        !readOnly && (
          <div className="tiptap-toolbar-fixed">
            <div className="max-w-4xl mx-auto px-6 py-2">
              <TiptapMenuBar editor={editor} />
            </div>
          </div>
        )
      }

      {/* Scrollable Content Area Only */}
      <div className="tiptap-content-scrollable">
        <div className="max-w-4xl mx-auto px-6 py-6 relative">
          {/* Bubble Menu for text selection */}
          {editor && (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              className="flex items-center gap-1 p-2 bg-background border border-border rounded-lg shadow-lg"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("bold") && "bg-muted"
                )}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("italic") && "bg-muted"
                )}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("underline") && "bg-muted"
                )}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("code") && "bg-muted"
                )}
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const previousUrl = editor.getAttributes("link").href;
                  const url = window.prompt(
                    "Enter URL:",
                    previousUrl || "https://"
                  );
                  if (url === null) return;
                  if (url === "") {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .unsetLink()
                      .run();
                    return;
                  }
                  editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url, target: "_blank" })
                    .run();
                }}
                className={cn(
                  "h-8 w-8 p-0",
                  editor.isActive("link") && "bg-muted"
                )}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </BubbleMenu>
          )}

          <EditorContent
            editor={editor}
            className="tiptap-editor prose prose-lg max-w-none focus:outline-none"
          />
        </div>
      </div>
    </div >
  );
}
