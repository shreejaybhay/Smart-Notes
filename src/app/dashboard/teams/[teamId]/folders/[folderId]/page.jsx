"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  ArrowLeft,
  Plus,
  FileText,
  Search,
  MoreVertical,
  Calendar,
  User,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const { teamId, folderId } = params;

  const [folder, setFolder] = useState(null);
  const [folderNotes, setFolderNotes] = useState([]);
  const [allTeamNotes, setAllTeamNotes] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [addNoteSearchQuery, setAddNoteSearchQuery] = useState("");
  const [selectedNotes, setSelectedNotes] = useState([]);

  // Fetch folder data
  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const [teamRes, folderNotesRes, allNotesRes] = await Promise.all([
          apiFetch(`/api/teams/${teamId}`),
          apiFetch(
            `/api/teams/${teamId}/notes?folder=${encodeURIComponent(
              folder?.name || ""
            )}`
          ),
          apiFetch(`/api/teams/${teamId}/notes`),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
        }

        if (folderNotesRes.ok) {
          const notesData = await folderNotesRes.json();
          setFolderNotes(notesData.notes || []);
        }

        if (allNotesRes.ok) {
          const allNotesData = await allNotesRes.json();
          setAllTeamNotes(allNotesData.notes || []);
        }
      } catch (error) {
        console.error("Error fetching folder data:", error);
        toast.error("Failed to load folder data");
      } finally {
        setLoading(false);
      }
    };

    if (teamId && folder) {
      fetchFolderData();
    }
  }, [teamId, folder]);

  // Fetch folder details
  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await apiFetch(`/api/teams/${teamId}/folders`);
        if (response.ok) {
          const data = await response.json();
          const foundFolder = data.folders.find((f) => f.id === folderId);
          if (foundFolder) {
            setFolder(foundFolder);
          } else {
            toast.error("Folder not found");
            router.push(`/dashboard/teams/${teamId}/folders`);
          }
        }
      } catch (error) {
        console.error("Error fetching folder:", error);
        toast.error("Failed to load folder");
      }
    };

    if (teamId && folderId) {
      fetchFolder();
    }
  }, [teamId, folderId, router]);

  const handleCreateTeamNote = async () => {
    try {
      const response = await apiFetch(`/api/teams/${teamId}/notes`, {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          isTeamNote: true,
          folder: folder.name
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

  const handleAddExistingNote = async (noteId) => {
    try {
      const response = await apiFetch(`/api/teams/${teamId}/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          folder: folder.name
        })
      });

      if (response.ok) {
        // Refresh folder notes
        const notesRes = await apiFetch(`/api/teams/${teamId}/notes?folder=${encodeURIComponent(folder.name)}`
        );
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setFolderNotes(notesData.notes || []);
        }

        // Refresh all notes
        const allNotesRes = await apiFetch(`/api/teams/${teamId}/notes`);
        if (allNotesRes.ok) {
          const allNotesData = await allNotesRes.json();
          setAllTeamNotes(allNotesData.notes || []);
        }

        setShowAddNoteDialog(false);
        toast.success("Note added to folder");
      } else {
        toast.error("Failed to add note to folder");
      }
    } catch (error) {
      console.error("Error adding note to folder:", error);
      toast.error("Failed to add note to folder");
    }
  };

  const handleRemoveFromFolder = async (noteId) => {
    try {
      const response = await apiFetch(`/api/teams/${teamId}/notes/${noteId}`, {
        method: "PATCH",
        body: JSON.stringify({
          folder: null
        })
      });

      if (response.ok) {
        // Refresh folder notes
        const notesRes = await apiFetch(`/api/teams/${teamId}/notes?folder=${encodeURIComponent(folder.name)}`
        );
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setFolderNotes(notesData.notes || []);
        }
        toast.success("Note removed from folder");
      } else {
        toast.error("Failed to remove note from folder");
      }
    } catch (error) {
      console.error("Error removing note from folder:", error);
      toast.error("Failed to remove note from folder");
    }
  };

  const filteredNotes = folderNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableNotes = allTeamNotes.filter(
    (note) => !note.folder || note.folder !== folder?.name
  );

  const filteredAvailableNotes = availableNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(addNoteSearchQuery.toLowerCase()) ||
      (note.content &&
        note.content.toLowerCase().includes(addNoteSearchQuery.toLowerCase()))
  );

  const handleBulkAddNotes = async () => {
    if (selectedNotes.length === 0) return;

    try {
      const promises = selectedNotes.map((noteId) =>
        apiFetch(`/api/teams/${teamId}/notes/${noteId}`, {
          method: "PATCH",
          body: JSON.stringify({
            folder: folder.name
          })
        })
      );

      await Promise.all(promises);

      // Refresh folder notes
      const notesRes = await apiFetch(`/api/teams/${teamId}/notes?folder=${encodeURIComponent(folder.name)}`
      );
      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setFolderNotes(notesData.notes || []);
      }

      // Refresh all notes
      const allNotesRes = await apiFetch(`/api/teams/${teamId}/notes`);
      if (allNotesRes.ok) {
        const allNotesData = await allNotesRes.json();
        setAllTeamNotes(allNotesData.notes || []);
      }

      setShowAddNoteDialog(false);
      setSelectedNotes([]);
      setAddNoteSearchQuery("");
      toast.success(`${selectedNotes.length} notes added to folder`);
    } catch (error) {
      console.error("Error adding notes to folder:", error);
      toast.error("Failed to add notes to folder");
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const selectAllNotes = () => {
    setSelectedNotes(filteredAvailableNotes.map((note) => note.id));
  };

  const clearSelection = () => {
    setSelectedNotes([]);
  };

  if (loading || !folder) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-8 -ml-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-lg"></div>
                  <div>
                    <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-28 bg-muted rounded"></div>
                  <div className="h-9 w-32 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            {/* Search skeleton */}
            <div className="mb-8">
              <div className="h-10 w-80 bg-muted rounded"></div>
            </div>
            {/* Notes skeleton */}
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-background border border-border/50 rounded-md p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-muted rounded mb-2"></div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-20 bg-muted rounded"></div>
                        <div className="h-3 w-16 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-6 bg-muted rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
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
            onClick={() => router.push(`/dashboard/teams/${teamId}/folders`)}
            className="gap-2 text-muted-foreground hover:text-foreground mb-8 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Folders
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                  {folder.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {team?.name} • {filteredNotes.length}{" "}
                  {filteredNotes.length === 1 ? "note" : "notes"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog
                open={showAddNoteDialog}
                onOpenChange={setShowAddNoteDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Team Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="text-base font-semibold">
                          Add Notes to {folder.name}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                          Search and select team notes to add to this folder
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  {/* Search and Controls */}
                  <div className="space-y-4 mt-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search available notes..."
                        value={addNoteSearchQuery}
                        onChange={(e) => setAddNoteSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Selection Controls */}
                    {filteredAvailableNotes.length > 0 && (
                      <div className="flex items-center justify-between py-2 px-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {selectedNotes.length} of{" "}
                            {filteredAvailableNotes.length} selected
                          </span>
                          {addNoteSearchQuery && (
                            <span className="text-xs">
                              (filtered from {availableNotes.length} total)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {selectedNotes.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearSelection}
                              className="text-xs"
                            >
                              Clear
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAllNotes}
                            className="text-xs"
                          >
                            Select All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes List */}
                  <div className="flex-1 min-h-0">
                    {availableNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">
                          No available notes
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          All team notes are already in folders or there are no
                          team notes yet.
                        </p>
                      </div>
                    ) : filteredAvailableNotes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">
                          No notes found
                        </h3>
                        <p className="text-sm text-muted-foreground text-center">
                          Try adjusting your search terms or clear the search to
                          see all available notes.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 overflow-y-auto pr-2">
                        {filteredAvailableNotes.map((note) => (
                          <div
                            key={note.id}
                            className={`group cursor-pointer border rounded-md p-3 transition-all duration-200 ${
                              selectedNotes.includes(note.id)
                                ? "bg-primary/5 border-primary/30 hover:bg-primary/10"
                                : "bg-background hover:bg-muted/30 border-border/50 hover:border-border/70"
                            }`}
                            onClick={() => toggleNoteSelection(note.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                  selectedNotes.includes(note.id)
                                    ? "bg-primary border-primary"
                                    : "border-border/60 group-hover:border-border"
                                }`}
                              >
                                {selectedNotes.includes(note.id) && (
                                  <div className="w-2 h-2 bg-white rounded-sm"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground mb-1 line-clamp-1">
                                  {note.title || "Untitled Note"}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {note.userId?.firstName ||
                                      note.author?.name ||
                                      "Unknown"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      note.updatedAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
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
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  {filteredAvailableNotes.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {selectedNotes.length > 0 && (
                          <span>
                            {selectedNotes.length} note
                            {selectedNotes.length !== 1 ? "s" : ""} selected
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddNoteDialog(false);
                            setSelectedNotes([]);
                            setAddNoteSearchQuery("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBulkAddNotes}
                          disabled={selectedNotes.length === 0}
                        >
                          Add{" "}
                          {selectedNotes.length > 0
                            ? `${selectedNotes.length} `
                            : ""}
                          Note{selectedNotes.length !== 1 ? "s" : ""}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <Button onClick={handleCreateTeamNote} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Note
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes in this folder..."
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
              {searchQuery ? "No notes found" : "No notes in this folder yet"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create a new note or add existing notes to this folder"}
            </p>
            {!searchQuery && (
              <div className="flex gap-2">
                <Button onClick={handleCreateTeamNote} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddNoteDialog(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Existing Note
                </Button>
              </div>
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
                        {note.title || "Untitled Note"}
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/notes/${note.id}?team=${teamId}`
                          );
                        }}
                      >
                        Edit Note
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFolder(note.id);
                        }}
                      >
                        Remove from Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
