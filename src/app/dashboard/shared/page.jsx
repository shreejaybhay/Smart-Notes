"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Star,
  Calendar,
  Users,
  MoreHorizontal,
  FileText,
  Trash2,
  Crown,
  Edit3,
  Eye,
  Share,
} from "lucide-react";
import Link from "next/link";

export default function SharedNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Mock shared notes data
  const mockSharedNotes = [
    {
      id: "1",
      title: "Team Project Roadmap 2024",
      content:
        "Comprehensive roadmap for our upcoming projects and milestones...",
      folder: "Work",
      starred: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      owner: {
        name: "Shree Jaybhay",
        email: "shreejaybhay26@gmail.com",
        avatar: "/avatars/user1.jpg",
      },
      collaborators: [
        { name: "John Doe", avatar: "/avatars/user2.jpg", role: "editor" },
        { name: "Jane Smith", avatar: "/avatars/user3.jpg", role: "viewer" },
      ],
      team: "SmartNotes Team",
      permission: "editor",
    },
    {
      id: "2",
      title: "Meeting Notes - Q4 Planning",
      content:
        "Quarterly planning session notes with action items and decisions...",
      folder: "Meetings",
      starred: false,
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-18"),
      owner: {
        name: "John Doe",
        email: "john@example.com",
        avatar: "/avatars/user2.jpg",
      },
      collaborators: [
        { name: "Shree Jaybhay", avatar: "/avatars/user1.jpg", role: "editor" },
        { name: "Jane Smith", avatar: "/avatars/user3.jpg", role: "viewer" },
      ],
      team: "SmartNotes Team",
      permission: "viewer",
    },
    {
      id: "3",
      title: "Design System Guidelines",
      content: "Comprehensive design system documentation for the team...",
      folder: "Design",
      starred: true,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-15"),
      owner: {
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "/avatars/user3.jpg",
      },
      collaborators: [
        { name: "Shree Jaybhay", avatar: "/avatars/user1.jpg", role: "editor" },
        { name: "John Doe", avatar: "/avatars/user2.jpg", role: "editor" },
      ],
      team: "Design Team",
      permission: "editor",
    },
  ];

  useEffect(() => {
    // Load shared notes
    loadSharedNotes();
  }, []);

  const loadSharedNotes = async () => {
    try {
      // TODO: Replace with actual API call
      setNotes(mockSharedNotes);
    } catch (error) {
      console.error("Failed to load shared notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to remove this shared note?")) return;

    try {
      // TODO: Replace with actual API call
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Failed to remove shared note:", error);
    }
  };

  const handleStarToggle = async (noteId) => {
    try {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, starred: !note.starred } : note
        )
      );
      // TODO: Replace with actual API call
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "editor":
        return <Edit3 className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission) {
      case "owner":
        return "text-yellow-600";
      case "editor":
        return "text-blue-600";
      case "viewer":
        return "text-gray-600";
      default:
        return "text-gray-600";
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
        (filterBy === "owned" && note.permission === "owner") ||
        (filterBy === "editable" &&
          ["owner", "editor"].includes(note.permission));
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
    <>
      {/* Header */}
      <header className="bg-background border-b shadow-sm">
        {/* Main Header */}
        <div className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="ml-auto">
            <Button asChild className="gap-2">
              <Link href="/dashboard">
                <Plus className="h-4 w-4" />
                New Note
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 px-4 py-3 border-t bg-muted/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shared notes..."
              className="pl-10"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shared</SelectItem>
              <SelectItem value="starred">Starred</SelectItem>
              <SelectItem value="owned">Owned by Me</SelectItem>
              <SelectItem value="editable">Can Edit</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Shared Notes Grid/List */}
      <main className="p-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No shared notes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Notes shared with you will appear here"}
            </p>
            <Button asChild>
              <Link href="/dashboard">Create Note</Link>
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs">
                        {note.team}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${getPermissionColor(
                          note.permission
                        )}`}
                      >
                        {getPermissionIcon(note.permission)}
                        {note.permission}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarToggle(note.id);
                        }}
                        className={note.starred ? "text-yellow-500" : ""}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            note.starred ? "fill-current" : ""
                          }`}
                        />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/notes/${note.id}`}>
                              {note.permission === "viewer" ? "View" : "Edit"}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStarToggle(note.id)}
                          >
                            {note.starred
                              ? "Remove from starred"
                              : "Add to starred"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from shared
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Link href={`/dashboard/notes/${note.id}`}>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {note.content}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.owner.avatar} />
                          <AvatarFallback className="text-xs">
                            {note.owner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          by {note.owner.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {note.updatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Collaborators */}
                    <div className="flex items-center gap-1 mt-3">
                      <div className="flex -space-x-1">
                        {note.collaborators
                          .slice(0, 3)
                          .map((collaborator, index) => (
                            <Avatar
                              key={index}
                              className="h-5 w-5 border-2 border-background"
                            >
                              <AvatarImage src={collaborator.avatar} />
                              <AvatarFallback className="text-xs">
                                {collaborator.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        {note.collaborators.length > 3 && (
                          <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{note.collaborators.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {note.collaborators.length + 1} collaborator
                        {note.collaborators.length !== 0 ? "s" : ""}
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
