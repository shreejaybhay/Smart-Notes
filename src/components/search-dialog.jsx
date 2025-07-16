"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  FileText,
  X,
  Hash,
  Calendar,
  Folder,
  Trash2,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function SearchDialog({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const router = useRouter();

  // Fetch real notes data
  useEffect(() => {
    if (open) {
      fetchNotes();
      fetchFolders();
      loadRecentSearches();
    }
  }, [open]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const loadRecentSearches = () => {
    // Load from localStorage
    try {
      const saved = localStorage.getItem("smartnotes-recent-searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    }
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;

    try {
      const newSearch = {
        query: query.trim(),
        timestamp: Date.now(),
        type: query.startsWith("#")
          ? "tag"
          : query.includes(":")
            ? "filter"
            : "text",
      };

      const updated = [
        newSearch,
        ...recentSearches.filter((s) => s.query !== query.trim()),
      ].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem(
        "smartnotes-recent-searches",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Error saving recent search:", error);
    }
  };

  // Strip HTML tags from content for display
  const stripHtml = (html) => {
    if (!html) return "";

    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get text content and clean up extra whitespace
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    return textContent.replace(/\s+/g, " ").trim();
  };

  // Smart search suggestions
  const searchSuggestions = [
    { icon: Hash, label: "#tags", description: "Search by tags" },
    { icon: Calendar, label: "date:", description: "Filter by date" },
    { icon: Folder, label: "folder:", description: "Search in folder" },
    { icon: Star, label: "starred:", description: "Show starred notes" },
  ];

  // Enhanced search filtering for real notes
  const filteredNotes = searchQuery
    ? notes.filter((note) => {
      const query = searchQuery.toLowerCase();

      // Basic text search
      const titleMatch = note.title?.toLowerCase().includes(query);

      // Clean content for searching (strip HTML)
      const cleanContent = stripHtml(note.content || "");
      const contentMatch = cleanContent.toLowerCase().includes(query);

      // Folder search
      const folderMatch = note.folder?.toLowerCase().includes(query);

      // Tag search (if note has tags)
      const tagMatch = note.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      // Special search patterns
      if (query.startsWith("#")) {
        const tagQuery = query.slice(1);
        return note.tags?.some((tag) => tag.toLowerCase().includes(tagQuery));
      }

      if (query.startsWith("folder:")) {
        const folderQuery = query.slice(7);
        return note.folder?.toLowerCase().includes(folderQuery);
      }

      if (query === "starred:" || query === "starred") {
        return note.starred === true;
      }

      return titleMatch || contentMatch || folderMatch || tagMatch;
    })
    : notes.slice(0, 8); // Show recent notes when not searching

  // Helper functions
  const removeRecentSearch = (searchToRemove) => {
    try {
      const updated = recentSearches.filter((s) => s.query !== searchToRemove);
      setRecentSearches(updated);
      localStorage.setItem(
        "smartnotes-recent-searches",
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.label);
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search.query);
    saveRecentSearch(search.query);
  };

  const handleNoteClick = (note) => {
    // Save search query if there was one
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }

    // Navigate to note
    router.push(`/dashboard/notes/${note.id}`);
    onOpenChange(false);
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays - 1} days ago`;

      return date.toLocaleDateString();
    } catch {
      return dateString || "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl w-[95vw] sm:w-[90vw] md:w-[85vw] h-[85vh] sm:h-[600px] p-0 gap-0 bg-background/95 backdrop-blur-md border-border rounded-xl shadow-lg"
        showCloseButton={false}
      >
        <div className="p-4 sm:p-6">
          <DialogTitle className="sr-only">Search Notes</DialogTitle>

          {/* Enhanced Search Input - Mobile Optimized */}
          <div className="relative mb-4 sm:mb-6">
            <div className="relative bg-card border border-border rounded-lg hover:border-primary/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/20 transition-all duration-200">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, tags, folders..."
                className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-12 sm:h-14 text-sm sm:text-base bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape" && searchQuery) {
                    setSearchQuery("");
                  }
                }}
              />
              {/* Clear button - Mobile friendly */}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-md hover:bg-muted transition-all duration-200"
                  onClick={() => setSearchQuery("")}
                  title="Clear search"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="h-[calc(85vh-8rem)] sm:h-[480px]">
            {searchQuery ? (
              // Enhanced Search Results - Mobile Optimized
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">Results for "</span>
                    <span className="sm:hidden">Results: </span>
                    <span className="truncate max-w-[120px] sm:max-w-none">{searchQuery}</span>
                    <span className="hidden sm:inline">"</span>
                  </h3>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {filteredNotes.length}
                  </Badge>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {isLoading ? (
                    // Enhanced Loading State
                    <div className="space-y-2 sm:space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-card border border-border rounded-lg p-3 sm:p-4"
                        >
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-1"></div>
                            <div className="h-3 bg-muted rounded w-2/3 mb-3"></div>
                            <div className="flex gap-2">
                              <div className="h-4 bg-muted rounded w-16"></div>
                              <div className="h-4 bg-muted rounded w-12"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredNotes.length > 0 ? (
                    filteredNotes.slice(0, 8).map((note) => (
                      <div
                        key={note.id}
                        onClick={() => handleNoteClick(note)}
                        className="group bg-card border border-border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              <h4 className="font-semibold text-sm sm:text-base truncate group-hover:text-primary transition-colors">
                                {note.title || "Untitled Note"}
                              </h4>
                              {note.starred && (
                                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                              {note.content
                                ? (() => {
                                  const cleanContent = stripHtml(note.content);
                                  const maxLength = window.innerWidth < 640 ? 100 : 150;
                                  return cleanContent.length > maxLength
                                    ? cleanContent.substring(0, maxLength) + "..."
                                    : cleanContent;
                                })()
                                : "No content"}
                            </p>
                            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                              {note.folder && (
                                <Badge variant="outline" className="text-xs h-5">
                                  <Folder className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="truncate max-w-[80px] sm:max-w-none">{note.folder}</span>
                                </Badge>
                              )}
                              {note.tags &&
                                note.tags.length > 0 &&
                                note.tags.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs h-5"
                                  >
                                    <Hash className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    <span className="truncate max-w-[60px] sm:max-w-none">{tag}</span>
                                  </Badge>
                                ))}
                              {note.tags && note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs h-5">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs text-muted-foreground/70 font-medium">
                              {formatDate(note.updatedAt || note.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-muted/30 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-medium text-sm mb-2">
                        No notes found
                      </h3>
                      <p className="text-xs text-muted-foreground px-4">
                        Try adjusting your search terms or create a new note
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Enhanced Recent Searches and Notes - Mobile Optimized
              <div className="space-y-4 sm:space-y-6">
                {/* Smart Search Suggestions - Mobile Responsive */}
                <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Quick Search
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-card border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left"
                      >
                        <suggestion.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors truncate">
                            {suggestion.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches Card - Mobile Optimized */}
                {recentSearches.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Recent Searches
                      </h3>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {recentSearches.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-2.5 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                              {search.type === "tag" ? (
                                <Hash className="h-3 w-3 text-primary" />
                              ) : search.type === "filter" ? (
                                <Folder className="h-3 w-3 text-primary" />
                              ) : (
                                <Search className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                {search.query}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Recent search
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search.query);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Notes Card - Mobile Optimized */}
                <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Recent Notes
                    </h3>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {Math.min(notes.length, 6)}
                    </Badge>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {notes.length > 0 ? (
                      notes.slice(0, 6).map((note) => (
                        <div
                          key={note.id}
                          onClick={() => handleNoteClick(note)}
                          className="group bg-muted/20 border border-border/30 rounded-lg p-2.5 sm:p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                  {note.title || "Untitled Note"}
                                </h4>
                                {note.starred && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2 leading-relaxed">
                                {note.content
                                  ? (() => {
                                    const cleanContent = stripHtml(note.content);
                                    const maxLength = window.innerWidth < 640 ? 80 : 120;
                                    return cleanContent.length > maxLength
                                      ? cleanContent.substring(0, maxLength) + "..."
                                      : cleanContent;
                                  })()
                                  : "No content"}
                              </p>
                              <div className="flex items-center gap-1">
                                {note.folder && (
                                  <Badge variant="outline" className="text-xs h-4">
                                    <span className="truncate max-w-[100px] sm:max-w-none">{note.folder}</span>
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground/70 font-medium shrink-0">
                              {formatDate(note.updatedAt || note.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs sm:text-sm mb-1">No notes found</p>
                        <p className="text-xs text-muted-foreground/70">
                          Create your first note to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
