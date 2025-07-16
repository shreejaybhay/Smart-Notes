"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Folder, X, Plus } from "lucide-react";
import { toast } from "sonner";

export default function MoveToFolderDialog({
  isOpen,
  onClose,
  noteTitle,
  teamId,
  noteId,
  currentFolder,
  onMoveSuccess,
}) {
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch team folders
  useEffect(() => {
    if (isOpen && teamId) {
      fetchFolders();
    }
  }, [isOpen, teamId]);

  // Filter folders based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredFolders(
        folders.filter((folder) =>
          folder.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredFolders(folders);
    }
  }, [searchQuery, folders]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/folders`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
    }
  };

  const handleMoveToFolder = async () => {
    if (!selectedFolder) {
      toast.error("Please select a folder");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${noteId}/move-to-folder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: selectedFolder.id === "root" ? null : selectedFolder.id,
          folderName: selectedFolder.id === "root" ? null : selectedFolder.name,
        }),
      });

      if (response.ok) {
        const message =
          selectedFolder.id === "root"
            ? "Note removed from folder"
            : `Note moved to "${selectedFolder.name}"`;
        toast.success(message);
        onMoveSuccess?.(
          selectedFolder.id === "root" ? null : selectedFolder.name
        );
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to move note");
      }
    } catch (error) {
      console.error("Error moving note:", error);
      toast.error(error.message || "Failed to move note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAndMove = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsLoading(true);
    try {
      // Create folder
      const createResponse = await fetch(`/api/teams/${teamId}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create folder");
      }

      const newFolderData = await createResponse.json();

      // Move note to new folder
      const moveResponse = await fetch(`/api/notes/${noteId}/move-to-folder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: newFolderData.folder.id,
          folderName: newFolderData.folder.name,
        }),
      });

      if (moveResponse.ok) {
        toast.success(
          `Note moved to new folder "${newFolderData.folder.name}"`
        );
        onMoveSuccess?.(newFolderData.folder.name);
        onClose();
      } else {
        const moveErrorData = await moveResponse.json();
        throw new Error(
          moveErrorData.error || "Failed to move note to new folder"
        );
      }
    } catch (error) {
      console.error("Error creating folder and moving note:", error);
      toast.error(error.message || "Failed to create folder and move note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFolder(null);
    setIsCreatingFolder(false);
    setNewFolderName("");
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Move to Folder
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Move "{noteTitle}" to a different folder
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Select Folder */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Select Folder
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-hide">
              {filteredFolders.length > 0 ? (
                filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      selectedFolder?.id === folder.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/30 hover:border-border/50 hover:bg-muted/30"
                    }`}
                    onClick={() => setSelectedFolder(folder)}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded ${
                        selectedFolder?.id === folder.id
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Folder className="h-3.5 w-3.5" />
                    </div>
                    <span
                      className={`text-sm ${
                        selectedFolder?.id === folder.id
                          ? "text-foreground font-medium"
                          : "text-foreground/80"
                      }`}
                    >
                      {folder.name}
                    </span>
                    {selectedFolder?.id === folder.id && (
                      <div className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30 mx-auto mb-3">
                    <Folder className="h-5 w-5 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No folders found</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Create your first folder below"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Create New Folder */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Create New Folder
            </h4>
            {!isCreatingFolder ? (
              <Button
                variant="outline"
                onClick={() => setIsCreatingFolder(true)}
                className="w-full gap-2 h-9 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Create New Folder
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Enter folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newFolderName.trim()) {
                        handleCreateAndMove();
                      } else if (e.key === "Escape") {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    className="h-9 pr-10"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName("");
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter to create and move, or Escape to cancel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {isCreatingFolder && newFolderName.trim() ? (
            <Button onClick={handleCreateAndMove} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create & Move
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleMoveToFolder}
              disabled={!selectedFolder || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground mr-2" />
                  Moving...
                </>
              ) : (
                <>
                  <Folder className="h-4 w-4 mr-2" />
                  Move Note
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
