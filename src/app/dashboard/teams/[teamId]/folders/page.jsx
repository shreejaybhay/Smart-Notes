"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Folder,
  ArrowLeft,
  Calendar,
  FileText,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

export default function AllTeamFoldersPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId;

  const [teamFolders, setTeamFolders] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [createFolderName, setCreateFolderName] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const [teamRes, foldersRes] = await Promise.all([
          fetch(`/api/teams/${teamId}`),
          fetch(`/api/teams/${teamId}/folders`),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
        }

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setTeamFolders(foldersData.folders || []);
        }
      } catch (error) {
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const handleCreateFolder = async () => {
    if (!createFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: createFolderName.trim(),
          description: "",
          color: "primary",
        }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        setTeamFolders((prev) => [...prev, newFolder.folder]);
        setCreateFolderName("");
        setIsCreatingFolder(false);
        toast.success("Folder created successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleRenameFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    try {
      const response = await fetch(
        `/api/teams/${teamId}/folders/${folderToRename.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newFolderName.trim(),
          }),
        }
      );

      if (response.ok) {
        const updatedFolder = await response.json();
        setTeamFolders((prev) =>
          prev.map((folder) =>
            folder.id === folderToRename.id
              ? { ...folder, name: updatedFolder.folder.name }
              : folder
          )
        );
        setRenameDialogOpen(false);
        setFolderToRename(null);
        setNewFolderName("");
        toast.success("Folder renamed successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to rename folder");
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };

  const handleDeleteFolder = async () => {
    try {
      const response = await fetch(
        `/api/teams/${teamId}/folders/${folderToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setTeamFolders((prev) =>
          prev.filter((folder) => folder.id !== folderToDelete.id)
        );
        setDeleteDialogOpen(false);
        setFolderToDelete(null);
        toast.success("Folder deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-8 -ml-2">
                <div className="h-4 w-4 bg-muted rounded"></div>
                <div className="h-4 w-8 bg-muted rounded"></div>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="h-8 w-48 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-32 bg-muted rounded"></div>
                </div>
                <div className="h-9 w-36 bg-muted rounded"></div>
              </div>
            </div>
            {/* Folders grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-background border border-border/50 rounded-md p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted rounded-lg"></div>
                      <div>
                        <div className="h-5 w-24 bg-muted rounded mb-1"></div>
                        <div className="h-3 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-6 bg-muted rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
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
                All Team Folders
              </h1>
              <p className="text-sm text-muted-foreground">
                {team?.name} • {teamFolders.length}{" "}
                {teamFolders.length === 1 ? "folder" : "folders"}
              </p>
            </div>
            {(team?.team?.userPermissions?.canCreateNotes || team?.team?.isOwner) && 
             team?.team?.currentUser?.role !== 'viewer' && (
              <Button onClick={() => setIsCreatingFolder(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Team Folder
              </Button>
            )}
          </div>
        </div>

        {/* Inline Folder Creation */}
        {isCreatingFolder && (
          <div className="bg-background border border-border/50 rounded-md p-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Folder className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Enter folder name..."
                  value={createFolderName}
                  onChange={(e) => setCreateFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && createFolderName.trim()) {
                      handleCreateFolder();
                    } else if (e.key === "Escape") {
                      setIsCreatingFolder(false);
                      setCreateFolderName("");
                    }
                  }}
                  autoFocus
                  className="border-0 bg-transparent focus:ring-0 focus:border-0 text-base font-medium placeholder:text-muted-foreground/70"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={!createFolderName.trim()}
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setCreateFolderName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Folders List */}
        {teamFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center mb-4">
              <Folder className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No team folders yet
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
              Create your first folder to organize your team notes
            </p>
            {(team?.team?.userPermissions?.canCreateNotes || team?.team?.isOwner) && (
              <Button onClick={() => setIsCreatingFolder(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Folder
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamFolders.map((folder) => (
              <div
                key={folder.id}
                className="group cursor-pointer bg-background hover:bg-muted/20 border border-border/50 hover:border-border/70 rounded-md p-5 transition-all duration-200"
                onClick={() =>
                  router.push(`/dashboard/teams/${teamId}/folders/${folder.id}`)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Folder className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium text-foreground line-clamp-1 flex-1">
                          {folder.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {folder.createdBy?.firstName || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(folder.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {folder.count || 0}{" "}
                        {folder.count === 1 ? "note" : "notes"}
                      </span>
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
                          setFolderToRename(folder);
                          setNewFolderName(folder.name);
                          setRenameDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToDelete(folder);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rename Folder Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Edit2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    Rename Folder
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter a new name for "{folderToRename?.name}"
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Folder Name
                </label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      handleRenameFolder();
                    } else if (e.key === "Escape") {
                      setRenameDialogOpen(false);
                    }
                  }}
                  placeholder="Enter folder name..."
                  autoFocus
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRenameDialogOpen(false);
                  setFolderToRename(null);
                  setNewFolderName("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRenameFolder}
                disabled={
                  !newFolderName.trim() ||
                  newFolderName === folderToRename?.name
                }
              >
                Rename Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Folder</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{folderToDelete?.name}"? This
              action cannot be undone.
              {folderToDelete?.count > 0 && (
                <span className="block mt-2 text-destructive">
                  This folder contains {folderToDelete.count} note
                  {folderToDelete.count !== 1 ? "s" : ""}.
                </span>
              )}
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteFolder}>
                Delete Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
