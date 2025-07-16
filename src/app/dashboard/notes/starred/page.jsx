"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Star,
  Calendar,
  Folder,
  MoreHorizontal,
  Trash2,
  Search,
  FileText,
  ChevronDown,
  Sparkles,
  StarOff,
} from "lucide-react";
import Link from "next/link";

export default function StarredNotesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch starred notes from API
  const loadStarredNotes = async (showLoader = false) => {
    if (!session) return;

    try {
      if (showLoader) setIsLoading(true);
      const response = await fetch("/api/notes/starred", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch starred notes");
      }

      const data = await response.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Error fetching starred notes:", error);
      setNotes([]);
    } finally {
      if (showLoader) setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadStarredNotes(true);
  }, [session]);

  // Real-time updates: Refresh when window gains focus (without loader)
  useEffect(() => {
    const handleFocus = () => {
      if (!isInitialLoad) {
        loadStarredNotes(false);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isInitialLoad]);

  // Real-time updates: Polling every 30 seconds (without loader)
  useEffect(() => {
    if (isInitialLoad) return;

    const interval = setInterval(() => {
      loadStarredNotes(false);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isInitialLoad]);

  // Real-time updates: Listen for storage events (without loader)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "notes-updated" && !isInitialLoad) {
        loadStarredNotes(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isInitialLoad]);

  // Real-time updates: Listen for custom events (immediate updates in same tab)
  useEffect(() => {
    const handleNoteStarredChange = (e) => {
      const { noteId, starred } = e.detail;

      if (starred) {
        // Note was starred - it might appear in starred notes, so refresh
        if (!isInitialLoad) {
          loadStarredNotes(false);
        }
      } else {
        // Note was unstarred - remove it immediately from the list
        setNotes((prev) => prev.filter((note) => note._id !== noteId));
      }
    };

    window.addEventListener("noteStarredChanged", handleNoteStarredChange);
    return () =>
      window.removeEventListener("noteStarredChanged", handleNoteStarredChange);
  }, [isInitialLoad]);

  // Real-time updates: Refresh when page becomes visible (without loader)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !isInitialLoad) {
        loadStarredNotes(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isInitialLoad]);

  const handleRemoveFromStarred = async (noteId) => {
    try {
      // Update UI immediately for better UX with smooth transition
      setNotes((prev) => prev.filter((note) => note._id !== noteId));

      // Call API to update starred status
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          starred: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to unstar note");
      }

      // Trigger storage event to notify other tabs/pages
      localStorage.setItem("notes-updated", Date.now().toString());

      // Dispatch custom event for immediate updates in same tab
      window.dispatchEvent(
        new CustomEvent("noteStarredChanged", {
          detail: { noteId, starred: false },
        })
      );
    } catch (error) {
      console.error("Failed to remove from starred:", error);
      // Reload notes on error to sync with server (without showing loader)
      loadStarredNotes(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      // Update UI immediately for better UX with smooth transition
      setNotes((prev) => prev.filter((note) => note._id !== noteId));

      // Call API to delete note
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      // Reload notes on error to sync with server (without showing loader)
      loadStarredNotes(false);
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content &&
        note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Enhanced date formatting helper with better accuracy
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      }
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
      }
      if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      }

      // For older dates, show actual date
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return "Unknown";
    }
  };

  // Format content helper
  const formatContent = (content) => {
    if (!content) return "";

    let cleanContent = content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n+/g, " ") // Replace line breaks with spaces
      .trim(); // Remove leading/trailing whitespace

    // Add spaces before capital letters to separate words
    cleanContent = cleanContent.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Limit length and add proper spacing
    return cleanContent.substring(0, 100);
  };

  if (isLoading && isInitialLoad) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search starred notes..."
              value=""
              className="pl-10 h-10"
              disabled
              readOnly
            />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Compact loading skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="h-48">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3 h-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 mb-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="mt-auto pt-3 border-t border-border/30">
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Clean Minimal Header */}
      <div className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header Section - Title and Count */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h1 className="text-xl sm:text-2xl font-medium text-foreground">Starred Notes</h1>
            <div className="flex items-center">
              <span className="px-2 sm:px-2.5 py-1 bg-muted/60 text-muted-foreground text-xs rounded-md font-normal min-w-[50px] sm:min-w-[60px] text-center">
                {isLoading && isInitialLoad ? (
                  <span className="inline-block w-6 sm:w-8 h-3 bg-muted-foreground/20 rounded animate-pulse"></span>
                ) : (
                  `${filteredNotes.length} ${filteredNotes.length === 1 ? "note" : "notes"}`
                )}
              </span>
            </div>
          </div>

          {/* Search Bar - Full Width */}
          <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search starred notes..."
              className="pl-10 h-10 sm:h-11 bg-background border-border/60 rounded-lg shadow-sm focus:shadow-md focus:border-border transition-all duration-150 text-sm w-full"
              disabled={false}
            />
          </div>

          {/* Controls Row - All Notes Button and Filter Side by Side */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            {/* All Notes Button */}
            <Button
              asChild
              variant="outline"
              className="gap-2 border-border/60 hover:border-border hover:bg-muted/50 transition-all duration-150 rounded-lg px-3 sm:px-4 py-2 font-normal text-sm"
            >
              <Link href="/dashboard/notes">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Browse All Notes</span>
                <span className="sm:hidden">All Notes</span>
              </Link>
            </Button>

            {/* Sort Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 sm:h-11 px-3 sm:px-4 gap-2 border-border/60 hover:border-border hover:bg-muted/50 rounded-lg transition-all duration-150 font-normal"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground/70" />
                  <span className="text-sm">Last edited</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl border-border/60 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
              >
                <DropdownMenuItem className="gap-3 py-2.5 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last edited</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2.5 rounded-lg">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Title A-Z</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-3 py-2.5 rounded-lg">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span>Folder</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Notes Content - Mobile Responsive */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

      {filteredNotes.length === 0 ? (
        <div className="text-center py-20">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
                <Star className="h-12 w-12 text-accent-foreground" />
              </div>
              {!searchQuery && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4 text-foreground">
            {searchQuery
              ? "No matching starred notes"
              : "✨ Start building your favorites"}
          </h3>

          <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed text-base">
            {searchQuery
              ? `No starred notes match "${searchQuery}". Try adjusting your search terms or browse all your starred notes.`
              : "Star your most important notes to create a curated collection of your best ideas. Click the star icon on any note to add it here."}
          </p>

          <div className="flex items-center justify-center gap-4">
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="gap-2 h-11 px-6"
              >
                <Star className="h-4 w-4" />
                Show All Starred
              </Button>
            ) : (
              <>
                <Button asChild className="gap-2 h-11 px-6">
                  <Link href="/dashboard">
                    <FileText className="h-4 w-4" />
                    Browse Notes
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 h-11 px-6">
                  <Link href="/dashboard/notes/new">
                    <Sparkles className="h-4 w-4" />
                    Create Note
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredNotes.map((note) => (
            <Card
              key={note._id}
              className="group cursor-pointer transition-all duration-200 hover:shadow-md border border-border bg-card hover:bg-card/80 rounded-lg overflow-hidden"
              onClick={() => router.push(`/dashboard/notes/${note._id}`)}
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
                        handleRemoveFromStarred(note._id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-muted rounded-md"
                    >
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
                          <Link href={`/dashboard/notes/${note._id}`} className="cursor-pointer">
                            <FileText className="h-4 w-4 mr-2" />
                            Open note
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromStarred(note._id);
                          }}
                        >
                          <StarOff className="h-4 w-4 mr-2" />
                          Remove star
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
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
                        const cleanContent = formatContent(note.content);
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
                      <Calendar className="h-3.5 w-3.5" />
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
                        {formatContent(note.content).split(" ").filter(word => word.trim()).length} words
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
    </div >
  );
}
