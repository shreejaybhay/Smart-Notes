"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

export default function TestEditorPage() {
  const [content, setContent] = useState(`<h1>Getting started</h1><p>Welcome to the <strong>Simple Editor</strong> template! This template integrates <strong>open source</strong> UI components and Tiptap extensions licensed under <strong>MIT</strong>.</p><p>Integrate it by following the <a href="#">Tiptap UI Components docs</a> or using our CLI tool.</p><pre><code>npx @tiptap/cli init</code></pre><h2>Features</h2><blockquote><p><em>A fully responsive rich text editor with built-in support for common formatting and layout tools. Type markdown ** or use keyboard shortcuts ⌘B for most all common markdown marks. ✓</em></p></blockquote><p>Add images, customize alignment, and apply <strong>advanced formatting</strong> to make your writing more engaging and professional.</p>`);

  return (
    <div className="min-h-screen bg-background">
      {/* Light theme container */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Tiptap Editor - Light Theme</h1>
          <p className="text-muted-foreground">Exact match to the provided design</p>
        </div>
        
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing..."
        />
      </div>

      {/* Dark theme container */}
      <div className="dark">
        <div className="max-w-4xl mx-auto py-8 px-4 bg-background">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Tiptap Editor - Dark Theme</h1>
            <p className="text-muted-foreground">Exact match to the provided design</p>
          </div>
          
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing..."
          />
        </div>
      </div>
    </div>
  );
}
