"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileText, Sparkles } from "lucide-react";

export default function StudyPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-medium text-foreground">Study</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A focused space for your learning materials. Create notes, collect references and keep study topics organized.
          </p>
        </div>
      </div>

      {/* Body */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border-border">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">Create a new study note</h3>
                <p className="text-sm text-muted-foreground mb-3">Capture concepts, summaries, and practice questions.</p>
                <Button asChild size="sm" className="gap-2">
                  <Link href="/dashboard">
                    <FileText className="h-4 w-4" />
                    New Note
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">Browse all notes</h3>
                <p className="text-sm text-muted-foreground mb-3">Review and organize your existing notes by topic.</p>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href="/dashboard/notes">
                    <FileText className="h-4 w-4" />
                    View Notes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

