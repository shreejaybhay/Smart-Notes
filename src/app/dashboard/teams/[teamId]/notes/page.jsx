"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  FolderPlus,
  ArrowLeft,
  Calendar,
  User,
  Folder
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import MoveToFolderDialog from "@/components/dialogs/MoveToFolderDialog";
import { apiFetch } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function AllTeamNotesPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId;

  const [teamNotes, setTeamNotes] = useState([]);
  const [teamFolders, setTeamFolders] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [teamRes, notesRes, foldersRes] = await Promise.all([
          apiFetch(`/api/teams/${teamId}`),
          apiFetch(`/api/teams/${teamId}/notes`),
          apiFetch(`/api/teams/${teamId}/folders`),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
        }

        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setTeamNotes(notesData.notes || []);
        }

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setTeamFolders(foldersData.folders || []);
        }
      } catch (error) {
        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching team data:", error);
        }
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const handleCreateTeamNote = async () => {
    try {
      const response = await apiFetch(`/api/teams/${teamId}/notes`, {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          isTeamNote: true
        })
      });

      if (response.ok) {
        const newNote = await response.json();
        toast.success("Team note created successfully!");
        // Use the correct route for editing notes
        router.push(`/dashboard/notes/${newNote.note.id}?team=${teamId}`);
      } else {
        toast.error("Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  const filteredNotes = teamNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            {/* Header */}
            <div className="mb-12">
              {/* Back button skeleton */}
              <div className="flex items-center gap-2 mb-8 -ml-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="h-4 w-8 bg-muted rounded"></div>
              </div>

              {/* Title and button skeleton */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="h-8 w-48 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
                <div className="h-9 w-24 bg-muted rounded"></div>
              </div>
            </div>

            {/* Search skeleton */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <div className="h-10 w-full bg-muted rounded"></div>
              </div>
            </div>

            {/* Notes list skeleton */}
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-background border border-border/50 rounded-md p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        {/* Note title skeleton */}
                        <div className="h-5 w-32 bg-muted rounded mb-2"></div>
                        {/* Metadata skeleton */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-muted rounded"></div>
                            <div className="h-3 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-muted rounded"></div>
                            <div className="h-3 w-20 bg-muted rounded"></div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 rounded-lg">
                            <div className="h-3 w-3 bg-muted rounded"></div>
                            <div className="h-3 w-12 bg-muted rounded"></div>
                          </div>
                        </div>
                      </div>
                      {/* Content skeleton */}
                      <div className="space-y-1">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                      </div>
                    </div>
                    {/* Three dots menu skeleton */}
                    <div className="h-7 w-7 bg-muted rounded shrink-0"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground mb-8 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                All Team Notes
              </h1>
              <p className="text-sm text-muted-foreground">
                {team?.name} • {filteredNotes.length}{" "}
                {filteredNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>
            {(team?.team?.userPermissions?.canCreateNotes || team?.team?.isOwner) && 
             team?.team?.currentUser?.role !== 'viewer' && (
              <Button onClick={handleCreateTeamNote} className="gap-2">
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border border-border/50 focus:border-border"
            />
          </div>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No notes found" : "No team notes yet"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first team note to get started"}
            </p>
            {!searchQuery && (team?.team?.userPermissions?.canCreateNotes || team?.team?.isOwner) && 
             team?.team?.currentUser?.role !== 'viewer' && (
              <Button onClick={handleCreateTeamNote} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="group cursor-pointer bg-background hover:bg-muted/20 border border-border/50 hover:border-border/70 rounded-md p-5 transition-all duration-200"
                onClick={() =>
                  router.push(`/dashboard/notes/${note.id}?team=${teamId}`)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <h3 className="font-medium text-foreground mb-2 line-clamp-1">
                        {note.title || "Untitled"}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.userId?.firstName ||
                            note.author?.name ||
                            "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                        {note.folder && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-lg">
                            <Folder className="h-3 w-3" />
                            {note.folder}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {note.content ? (
                        (() => {
                          const cleanText = note.content.replace(
                            /<[^>]*>/g,
                            ""
                          );
                          return cleanText || "No content";
                        })()
                      ) : (
                        <span className="italic">No content</span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/50 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 shadow-lg border-border/50"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/notes/${note.id}?team=${teamId}`
                          );
                        }}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
                          setMoveDialogOpen(true);
                        }}
                        className="gap-2"
                      >
                        <Folder className="h-4 w-4" />
                        Move to Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Move to Folder Dialog */}
      <MoveToFolderDialog
        isOpen={moveDialogOpen}
        onClose={() => {
          setMoveDialogOpen(false);
          setSelectedNote(null);
        }}
        noteTitle={selectedNote?.title || ""}
        teamId={teamId}
        noteId={selectedNote?.id}
        currentFolder={selectedNote?.folder}
        onMoveSuccess={(folderName) => {
          // Update the note in the local state
          setTeamNotes((prevNotes) =>
            prevNotes.map((note) =>
              note.id === selectedNote.id
                ? { ...note, folder: folderName }
                : note
            )
          );
        }}
      />
    </div>
  );
}
