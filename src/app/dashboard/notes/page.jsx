"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Star,
  MoreHorizontal,
  FileText,
  Trash2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function AllNotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Ref to prevent double loading
  const hasLoadedRef = useRef(false);

  // Show loading immediately if we're still waiting for session
  const shouldShowLoading =
    status === "loading" || (isLoading && isInitialLoad);

  // Strip HTML tags from content for display with better formatting
  const stripHtml = (html) => {
    if (!html) return "";

    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get text content and clean up extra whitespace
    let textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Better text cleaning - preserve word boundaries
    textContent = textContent
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
      .replace(/([a-zA-Z])(\d)/g, "$1 $2") // Add space between letters and numbers
      .replace(/(\d)([a-zA-Z])/g, "$1 $2") // Add space between numbers and letters
      .trim();

    return textContent;
  };

  // Loading skeleton component
  const NoteSkeleton = () => (
    <Card className="h-fit">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" /> {/* Badge */}
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7 rounded" /> {/* Star button */}
              <Skeleton className="h-7 w-7 rounded" /> {/* Menu button */}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" /> {/* Title */}
            <Skeleton className="h-4 w-full" /> {/* Content line */}
            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <Skeleton className="h-3 w-16" /> {/* Date */}
              <Skeleton className="h-3 w-12" /> {/* Word count */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const loadNotes = useCallback(
    async (showLoader = true) => {
      if (!session) return;

      try {
        if (showLoader) setIsLoading(true);

        const response = await fetch("/api/notes", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();

        // Transform API data to match component expectations
        const transformedNotes = data.notes.map((note) => ({
          id: note._id,
          title: note.title,
          content: note.content,
          folder: note.folder,
          starred: note.starred,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));

        setNotes(transformedNotes);
      } catch (error) {
        console.error("Failed to load notes:", error);
        if (showLoader) toast.error("Failed to load notes");
        setNotes([]);
      } finally {
        if (showLoader) setIsLoading(false);
        setIsInitialLoad(false);
      }
    },
    [session]
  );

  useEffect(() => {
    // Only run once when session status changes from loading to loaded
    if (status === "loading") return;

    if (
      status === "authenticated" &&
      session &&
      !hasLoadedRef.current &&
      isInitialLoad
    ) {
      hasLoadedRef.current = true;
      loadNotes();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [status, session, loadNotes]); // Minimal dependencies

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      // Remove from local state
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success("Note moved to trash");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleStarToggle = async (noteId) => {
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const response = await fetch(`/api/notes/${noteId}/star`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const data = await response.json();

      // Update local state
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, starred: data.starred } : n))
      );

      toast.success(data.starred ? "Added to starred" : "Removed from starred");
    } catch (error) {
      console.error("Failed to toggle star:", error);
      toast.error("Failed to update note");
    }
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "starred" && note.starred) ||
        (filterBy === "folder" && note.folder === filterBy);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "updated":
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Mobile-Responsive Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          {/* Top Bar - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Notes</h1>
              <span className="text-sm text-muted-foreground font-medium">
                {shouldShowLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"}`
                )}
              </span>
            </div>
            <Button
              asChild
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg px-4 py-2 font-medium w-full sm:w-auto"
            >
              <Link href="/dashboard">
                <Plus className="h-4 w-4" />
                New Note
              </Link>
            </Button>
          </div>

          {/* Mobile-Responsive Search and Filter Bar */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by title or content..."
                className="pl-10 h-10 bg-card border-border rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all duration-200 text-sm w-full"
                disabled={shouldShowLoading}
              />
            </div>

            {/* Filter Controls - Mobile Stack Layout */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Filter Buttons - Full width on mobile */}
              <div className="flex items-center bg-muted rounded-lg p-1 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterBy("all")}
                  className={`flex-1 sm:flex-none h-8 px-4 text-sm font-medium rounded-md transition-all duration-200 ${filterBy === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                >
                  All Notes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterBy("starred")}
                  className={`flex-1 sm:flex-none h-8 px-4 text-sm font-medium rounded-md transition-all duration-200 gap-1.5 ${filterBy === "starred"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  Starred
                </Button>
              </div>

              {/* Sort and View Controls - Mobile responsive */}
              <div className="flex gap-2 sm:gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1 sm:w-44 h-9 text-sm bg-card border-border rounded-lg transition-all duration-200">
                    <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border">
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${viewMode === "grid"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    title="List View"
                    className={`h-8 w-8 p-0 rounded-md transition-all duration-200 ${viewMode === "list"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Content - Notion-like spacing */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Show loading skeletons during initial load */}
          {shouldShowLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <NoteSkeleton key={index} />
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto px-6">
                {/* Enhanced Empty State Icon */}
                <div className="relative mb-8">
                  <div className="bg-muted rounded-xl p-8 w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-primary" />
                  </div>
                </div>

                {/* Enhanced Messaging */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {searchQuery ? "Nothing here yet" : "Your notes await"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {searchQuery
                      ? "Looks like your search didn't match any notes. Want to create one instead?"
                      : "Transform your thoughts into organized knowledge. Create your first note and start building your digital brain."}
                  </p>
                </div>

                {/* Enhanced Action Button */}
                <div className="space-y-3">
                  <Button
                    asChild
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-3 font-medium text-base"
                  >
                    <Link href="/dashboard">
                      <Plus className="h-5 w-5" />
                      Create Your First Note
                    </Link>
                  </Button>

                  {searchQuery && (
                    <Button
                      variant="ghost"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-foreground text-sm"
                    >
                      Clear search and view all notes
                    </Button>
                  )}
                </div>

                {/* Subtle Tips */}
                {!searchQuery && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 Tip: Use folders to organize your notes and star important ones for quick access
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4"
              }
            >
              {filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="group cursor-pointer transition-all duration-200 hover:shadow-md border border-border bg-card hover:bg-card/80 rounded-lg overflow-hidden"
                  onClick={() => router.push(`/dashboard/notes/${note.id}`)}
                >
                  <CardContent className="p-5">
                    {/* Top Header - Folder Badge and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Folder Badge - Top Left */}
                      <div className="flex-shrink-0">
                        {note.folder ? (
                          <Badge
                            variant="secondary"
                            className="text-xs h-6 px-3 bg-secondary text-secondary-foreground border-0 font-medium rounded-md"
                          >
                            {note.folder}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs h-6 px-3 bg-muted/50 text-muted-foreground border-border font-normal rounded-md"
                          >
                            No folder
                          </Badge>
                        )}
                      </div>

                      {/* Actions - Top Right with proper spacing */}
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStarToggle(note.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-muted rounded-md"
                        >
                          <Star
                            className={`h-4 w-4 ${note.starred
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground hover:text-yellow-500"
                              }`}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 p-0 hover:bg-muted rounded-md"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/notes/${note.id}`} className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Open note
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStarToggle(note.id);
                              }}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {note.starred ? "Remove star" : "Add star"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Move to trash
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="space-y-4">
                      {/* Title - Bold and Clear */}
                      <h3 className="font-bold text-xl leading-tight text-foreground line-clamp-2 group-hover:text-foreground/90">
                        {note.title || "Untitled"}
                      </h3>

                      {/* Content Preview with Better Structure */}
                      <div className="space-y-3">
                        {note.content ? (
                          (() => {
                            const cleanContent = stripHtml(note.content);
                            if (!cleanContent || cleanContent.trim() === "") {
                              return (
                                <p className="text-muted-foreground text-sm italic leading-relaxed">
                                  No content yet...
                                </p>
                              );
                            }

                            // Parse content for better display
                            const lines = cleanContent.split(/\n+/).filter(line => line.trim());

                            // Check if content looks like subject list (contains keywords like "Major", "Minor", "Subjects")
                            const isSubjectList = cleanContent.includes("Major") || cleanContent.includes("Minor") || cleanContent.includes("Subjects");

                            if (isSubjectList && lines.length > 1) {
                              // Display as structured subject list
                              return (
                                <div className="space-y-2">
                                  {lines.slice(0, 3).map((line, index) => {
                                    // Check if line contains subject categories
                                    if (line.includes("Major") || line.includes("Minor")) {
                                      const parts = line.split(/\s+/);
                                      return (
                                        <div key={index} className="flex flex-wrap gap-1.5">
                                          {parts.map((part, partIndex) => (
                                            <span
                                              key={partIndex}
                                              className={`text-xs px-2 py-1 rounded-sm ${part.includes("Major") || part.includes("Minor") || part.includes("Subjects")
                                                ? "bg-accent text-accent-foreground font-medium"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                            >
                                              {part}
                                            </span>
                                          ))}
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <p key={index} className="text-muted-foreground text-sm leading-relaxed">
                                          {line.length > 60 ? line.substring(0, 60) + "..." : line}
                                        </p>
                                      );
                                    }
                                  })}
                                  {lines.length > 3 && (
                                    <p className="text-muted-foreground/70 text-xs">
                                      +{lines.length - 3} more lines...
                                    </p>
                                  )}
                                </div>
                              );
                            } else {
                              // Display as regular content
                              const preview = lines.slice(0, 2).join(" ");
                              return (
                                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                                  {preview.length > 120 ? preview.substring(0, 120) + "..." : preview}
                                  {lines.length > 2 && "..."}
                                </p>
                              );
                            }
                          })()
                        ) : (
                          <p className="text-muted-foreground text-sm italic leading-relaxed">
                            No content yet...
                          </p>
                        )}
                      </div>

                      {/* Divider Line */}
                      <div className="border-t border-border"></div>

                      {/* Footer Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-medium">
                            {new Date(note.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year:
                                new Date(note.updatedAt).getFullYear() !==
                                  new Date().getFullYear()
                                  ? "numeric"
                                  : undefined,
                            })}
                          </span>
                        </div>
                        {note.content && (
                          <span className="font-medium">
                            {stripHtml(note.content).split(" ").filter(word => word.trim()).length} words
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
