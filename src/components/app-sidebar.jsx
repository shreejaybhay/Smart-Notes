"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useNotes } from "@/contexts/NotesContext";
import {
  Brain,
  FileText,
  BookOpen,
  Search,
  Star,
  StarOff,
  Trash2,
  Plus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Edit,
  Trash,
  Users,
  Copy,
  Settings
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { apiFetch } from "@/lib/api";


export function AppSidebar({ onSearchClick, onRefreshNotes, ...props }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { state } = useSidebar();
  const { setRefreshNotes } = useNotes();

  // State for real notes data
  const [recentNotes, setRecentNotes] = React.useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = React.useState(true);

  // State for real folders data
  const [folders, setFolders] = React.useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = React.useState(true);

  // State to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = React.useState(false);

  // Refs to prevent double loading
  const hasLoadedNotesRef = React.useRef(false);
  const hasLoadedFoldersRef = React.useRef(false);

  // Show loading immediately if we're still waiting for session
  const shouldShowNotesLoading = status === "loading" || isLoadingNotes;
  const shouldShowFoldersLoading = status === "loading" || isLoadingFolders;

  // Fetch recent notes from API
  const fetchRecentNotes = React.useCallback(async () => {
    if (!session) return;

    try {
      setIsLoadingNotes(true);
      const response = await apiFetch(`/api/notes?limit=5&t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();

      // Transform API data to sidebar format
      const transformedNotes = data.notes.map((note) => ({
        id: note._id,
        title: note.title || "Untitled",
        url: `/dashboard/notes/${note._id}`,
        createdAt: formatRelativeTime(new Date(note.updatedAt)),
        starred: note.starred || false
      }));

      setRecentNotes(transformedNotes);
    } catch (error) {
      console.error("Error fetching recent notes:", error);
      setRecentNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [session]);

  // Set mounted state on client side
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to format relative time (client-side only)
  const formatRelativeTime = (date) => {
    // Avoid hydration mismatch by only calculating on client side
    if (!isMounted) {
      return ""; // Return empty string during SSR
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // Fetch folders from API
  const fetchFolders = React.useCallback(async () => {
    if (!session) return;

    try {
      setIsLoadingFolders(true);
      const response = await apiFetch("/api/folders");

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();

      // Transform API data to sidebar format
      const transformedFolders = data.folders.map((folder) => ({
        id: folder.id || folder.name, // Use actual database ID
        name: folder.name,
        icon: Folder,
        count: folder.count,
        subfolders: [],
        notes: (folder.notes || []).map((note) => ({
          id: note.id,
          title: note.title || "Untitled",
          url: note.url || `/dashboard/notes/${note.id}`,
          starred: note.starred || false,
          updatedAt: note.updatedAt
        }))
      }));

      setFolders(transformedFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setFolders([]);
    } finally {
      setIsLoadingFolders(false);
    }
  }, [session]);

  // Function to refresh all data (resets loading guards)
  const refreshAllData = React.useCallback(() => {
    if (!session) return;

    hasLoadedNotesRef.current = false;
    hasLoadedFoldersRef.current = false;

    fetchRecentNotes();
    fetchFolders();
  }, [session, fetchRecentNotes, fetchFolders]);

  // Load notes and folders when component mounts or session changes
  React.useEffect(() => {
    if (status === "loading") return; // Wait for session to load

    if (status === "authenticated" && session) {
      // Load notes only once
      if (!hasLoadedNotesRef.current) {
        hasLoadedNotesRef.current = true;
        fetchRecentNotes();
      }

      // Load folders only once
      if (!hasLoadedFoldersRef.current) {
        hasLoadedFoldersRef.current = true;
        fetchFolders();
      }
    } else if (status === "unauthenticated") {
      setIsLoadingNotes(false);
      setIsLoadingFolders(false);
    }
  }, [status, session, fetchRecentNotes, fetchFolders]);

  // Expose refresh function to parent (stable reference)
  React.useEffect(() => {
    if (onRefreshNotes) {
      onRefreshNotes(refreshAllData);
    }
  }, [onRefreshNotes, refreshAllData]);

  // Register refresh function with notes context
  React.useEffect(() => {
    setRefreshNotes(refreshAllData);
  }, [setRefreshNotes, refreshAllData]);

  // State for folder expansion
  const [expandedFolders, setExpandedFolders] = React.useState(
    new Set(["work", "personal"])
  );

  // Close all folders when sidebar is collapsed
  React.useEffect(() => {
    if (state === "collapsed") {
      setExpandedFolders(new Set());
    }
  }, [state]);

  // State for folder creation and editing
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [isCreatingSubFolder, setIsCreatingSubFolder] = React.useState(null);
  const [editingFolder, setEditingFolder] = React.useState(null);
  const [folderName, setFolderName] = React.useState("");
  
  // Ref for folder input field
  const folderInputRef = React.useRef(null);

  // Focus input field when creating folder
  React.useEffect(() => {
    if (isCreatingFolder) {
      // Use a single, reliable timeout with a longer delay
      const timer = setTimeout(() => {
        if (folderInputRef.current) {
          folderInputRef.current.focus();
          folderInputRef.current.select();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isCreatingFolder]);

  // State for delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [folderToDelete, setFolderToDelete] = React.useState(null);

  // State for note delete dialog
  const [noteDeleteDialogOpen, setNoteDeleteDialogOpen] = React.useState(false);
  const [noteToDelete, setNoteToDelete] = React.useState(null);

  // State for move to folder dialog
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = React.useState(false);
  const [noteToMove, setNoteToMove] = React.useState(null);
  const [selectedFolder, setSelectedFolder] = React.useState("");
  const [folderSearchQuery, setFolderSearchQuery] = React.useState("");
  const [showNewFolderInput, setShowNewFolderInput] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");

  // State for rename note dialog
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [noteToRename, setNoteToRename] = React.useState(null);
  const [newNoteName, setNewNoteName] = React.useState("");

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Context menu handlers
  const handleAddFolder = () => {
    setIsCreatingFolder(true);
    setFolderName("");
  };

  const handleAddSubFolder = (parentFolderId) => {
    setIsCreatingSubFolder(parentFolderId);
    setFolderName("");
  };

  const handleRenameFolder = (folderId, currentName) => {
    setEditingFolder(folderId);
    setFolderName(currentName);
  };

  const handleDeleteFolder = (folderId, folderName) => {
    // Open delete confirmation dialog
    setFolderToDelete({ id: folderId, name: folderName });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      // Call API to delete folder
      const response = await apiFetch(`/api/folders/${folderToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete folder");
      }

      // Refresh folders list
      await fetchFolders();

      // Close dialog and reset state
      setDeleteDialogOpen(false);
      setFolderToDelete(null);

      console.log(`Folder "${folderToDelete.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert(`Failed to delete folder: ${error.message}`);
    }
  };

  const cancelDeleteFolder = () => {
    setDeleteDialogOpen(false);
    setFolderToDelete(null);
  };

  // Note context menu handlers
  const handleStarNote = async (noteId, starred) => {
    try {
      // Optimistic update: Update UI immediately to prevent visual stutter
      setRecentNotes((prev) =>
        prev.map((note) => (note.id === noteId ? { ...note, starred } : note))
      );

      setFolders((prev) =>
        prev.map((folder) => ({
          ...folder,
          notes: folder.notes.map((note) =>
            note.id === noteId ? { ...note, starred } : note
          )
        }))
      );

      // Make API call in background
      const response = await apiFetch(`/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
          starred: starred
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      // Trigger storage event to notify other tabs/pages
      localStorage.setItem("notes-updated", Date.now().toString());

      // Dispatch custom event for immediate updates in same tab
      window.dispatchEvent(
        new CustomEvent("noteStarredChanged", {
          detail: { noteId, starred }
        })
      );
    } catch (error) {
      // Revert optimistic update on error by refetching
      await fetchRecentNotes();
      await fetchFolders();

      alert(`Failed to update note: ${error.message}`);
    }
  };

  const handleDuplicateNote = async (noteId) => {
    try {
      // Get the original note
      const response = await apiFetch(`/api/notes/${noteId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch note");
      }

      const originalNote = await response.json();

      // Create duplicate
      const duplicateResponse = await apiFetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: `${originalNote.note.title} (Copy)`,
          content: originalNote.note.content,
          folder: originalNote.note.folder
        })
      });

      if (!duplicateResponse.ok) {
        throw new Error("Failed to duplicate note");
      }

      // Refresh notes list
      await fetchRecentNotes();

      console.log("Note duplicated successfully!");
    } catch (error) {
      console.error("Error duplicating note:", error);
      alert(`Failed to duplicate note: ${error.message}`);
    }
  };

  const handleMoveNoteToFolder = (noteId, noteTitle) => {
    const note = recentNotes.find((n) => n.id === noteId);
    setNoteToMove({
      id: noteId,
      title: noteTitle,
      currentFolder: note?.folder
    });
    setSelectedFolder("");
    setFolderSearchQuery("");
    setShowNewFolderInput(false);
    setNewFolderName("");
    setMoveFolderDialogOpen(true);
  };

  const confirmMoveToFolder = async () => {
    if (!noteToMove || !selectedFolder) return;

    try {
      let targetFolder = selectedFolder;

      // If creating a new folder, create it first
      if (selectedFolder === "new-folder" && newFolderName.trim()) {
        const createResponse = await apiFetch("/api/folders", {
          method: "POST",
          body: JSON.stringify({
            name: newFolderName.trim()
          })
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || "Failed to create folder");
        }

        targetFolder = newFolderName.trim();
      }

      const response = await apiFetch(`/api/notes/${noteToMove.id}`, {
        method: "PUT",
        body: JSON.stringify({
          folder: targetFolder
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to move note");
      }

      // Refresh notes and folders
      await fetchRecentNotes();
      await fetchFolders();

      // Close dialog and reset state
      setMoveFolderDialogOpen(false);
      setNoteToMove(null);
      setSelectedFolder("");
      setFolderSearchQuery("");
      setShowNewFolderInput(false);
      setNewFolderName("");

      console.log("Note moved successfully!");
    } catch (error) {
      console.error("Error moving note:", error);
      alert(`Failed to move note: ${error.message}`);
    }
  };

  const cancelMoveToFolder = () => {
    setMoveFolderDialogOpen(false);
    setNoteToMove(null);
    setSelectedFolder("");
    setFolderSearchQuery("");
    setShowNewFolderInput(false);
    setNewFolderName("");
  };

  const handleRenameNote = (noteId, currentTitle) => {
    setNoteToRename({ id: noteId, title: currentTitle });
    setNewNoteName(currentTitle);
    setRenameDialogOpen(true);
  };

  const confirmRenameNote = async () => {
    if (
      !noteToRename ||
      !newNoteName ||
      newNoteName.trim() === "" ||
      newNoteName.trim() === noteToRename.title
    ) {
      return;
    }

    try {
      const response = await apiFetch(`/api/notes/${noteToRename.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: newNoteName.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to rename note");
      }

      // Refresh notes list
      await fetchRecentNotes();

      // Close dialog and reset state
      setRenameDialogOpen(false);
      setNoteToRename(null);
      setNewNoteName("");

      console.log("Note renamed successfully!");
    } catch (error) {
      console.error("Error renaming note:", error);
      alert(`Failed to rename note: ${error.message}`);
    }
  };

  const cancelRenameNote = () => {
    setRenameDialogOpen(false);
    setNoteToRename(null);
    setNewNoteName("");
  };

  const handleDeleteNote = (noteId, noteTitle) => {
    setNoteToDelete({ id: noteId, title: noteTitle });
    setNoteDeleteDialogOpen(true);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const response = await apiFetch(`/api/notes/${noteToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete note");
      }

      // Wait a moment for database transaction to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Force refresh notes list
      await fetchRecentNotes();

      console.log("Note deleted successfully!");

      // Close dialog and reset state
      setNoteDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(`Failed to delete note: ${error.message}`);
    }
  };

  const cancelDeleteNote = () => {
    setNoteDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleAddNoteToFolder = async (folderId) => {
    try {
      // Find the folder name from the folders list
      const folder = folders.find((f) => f.id === folderId);
      const folderName = folder ? folder.name : null;

      // Create a new note with the folder assigned
      const response = await apiFetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          folder: folderName, // Assign to the selected folder
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const data = await response.json();

      // Navigate to the new note
      window.location.href = `/dashboard/notes/${data.note.id}`;
    } catch (error) {
      console.error("Error creating note:", error);
      alert(`Failed to create note: ${error.message}`);
    }
  };

  // Handle folder name submission
  const handleFolderNameSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    if (isCreatingFolder) {
      try {
        // Create new folder via API
        const response = await apiFetch("/api/folders", {
          method: "POST",
          body: JSON.stringify({
            name: folderName.trim()
          })
        });

        if (!response.ok) {
          throw new Error("Failed to create folder");
        }

        // Refresh folders list
        await fetchFolders();
        setIsCreatingFolder(false);

        // Show success message (you can add toast import if needed)
        console.log(`Folder "${folderName.trim()}" created successfully!`);
      } catch (error) {
        console.error("Error creating folder:", error);
        // Show error message (you can add toast import if needed)
        alert(`Failed to create folder: ${error.message}`);
      }
    } else if (isCreatingSubFolder) {
      try {
        // Create new subfolder via API
        const response = await apiFetch("/api/folders", {
          method: "POST",
          body: JSON.stringify({
            name: folderName.trim(),
            parentFolder: isCreatingSubFolder, // Parent folder ID
          })
        });

        if (!response.ok) {
          throw new Error("Failed to create subfolder");
        }

        // Refresh folders list
        await fetchFolders();
        setIsCreatingSubFolder(null);

        console.log(`Subfolder "${folderName.trim()}" created successfully!`);
      } catch (error) {
        console.error("Error creating subfolder:", error);
        alert(`Failed to create subfolder: ${error.message}`);
      }
    } else if (editingFolder) {
      try {
        // Rename existing folder via API
        const response = await apiFetch(`/api/folders/${editingFolder}`, {
          method: "PUT",
          body: JSON.stringify({
            name: folderName.trim()
          })
        });

        if (!response.ok) {
          throw new Error("Failed to rename folder");
        }

        // Refresh folders list
        await fetchFolders();
        setEditingFolder(null);

        console.log(`Folder renamed to "${folderName.trim()}" successfully!`);
      } catch (error) {
        console.error("Error renaming folder:", error);
        alert(`Failed to rename folder: ${error.message}`);
      }
    }

    setFolderName("");
  };

  const handleFolderNameCancel = () => {
    setIsCreatingFolder(false);
    setIsCreatingSubFolder(null);
    setEditingFolder(null);
    setFolderName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleFolderNameCancel();
    }
  };

  // Recursive component to render folders and subfolders
  const renderFolder = (folder, depth = 0) => (
    <div key={folder.id}>
      {/* Folder Header */}
      <SidebarMenuItem>
        {editingFolder === folder.id ? (
          // Editing mode
          <form
            onSubmit={handleFolderNameSubmit}
            className="px-2 py-1 group-data-[collapsible=icon]:px-2 w-full"
          >
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onBlur={handleFolderNameCancel}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm group-data-[collapsible=icon]:hidden"
              autoFocus
            />
          </form>
        ) : (
          // Normal mode
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <SidebarMenuButton
                onClick={() => toggleFolder(folder.id)}
                className="w-full justify-between group-data-[collapsible=icon]:justify-center"
              >
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:gap-0">
                  {expandedFolders.has(folder.id) ? (
                    <FolderOpen
                      className={`h-4 w-4 ${depth > 0 ? "text-blue-500" : ""}`}
                    />
                  ) : (
                    <Folder
                      className={`h-4 w-4 ${depth > 0 ? "text-blue-500" : ""}`}
                    />
                  )}
                  <span
                    className={`group-data-[collapsible=icon]:hidden ${
                      depth > 0 ? "text-blue-600 font-medium" : ""
                    }`}
                  >
                    {depth > 0 && "└ "}
                    {folder.name}
                  </span>
                </div>
                <div className="group-data-[collapsible=icon]:hidden">
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </SidebarMenuButton>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleAddNoteToFolder(folder.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => handleRenameFolder(folder.id, folder.name)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rename Folder
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </SidebarMenuItem>

      {/* Subfolder Creation Input */}
      {isCreatingSubFolder === folder.id && (
        <SidebarMenuItem>
          <form
            onSubmit={handleFolderNameSubmit}
            className="px-2 py-1 group-data-[collapsible=icon]:hidden"
          >
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onBlur={handleFolderNameCancel}
              onKeyDown={handleKeyDown}
              placeholder="Folder name"
              className="h-8 text-sm"
              autoFocus
            />
          </form>
        </SidebarMenuItem>
      )}

      {/* Subfolders */}
      <div className="group-data-[collapsible=icon]:hidden">
        {expandedFolders.has(folder.id) &&
          folder.subfolders &&
          Array.isArray(folder.subfolders) &&
          folder.subfolders.map((subfolder) =>
            renderFolder(subfolder, depth + 1, subfolder.id || subfolder.name)
          )}
      </div>

      {/* Folder Notes */}
      <div className="group-data-[collapsible=icon]:hidden">
        {expandedFolders.has(folder.id) && (
          <div className="space-y-1 ml-6">
            {folder.notes.map((note) => (
              <SidebarMenuItem key={note.id}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <SidebarMenuButton asChild tooltip={note.title}>
                      <Link
                        href={note.url}
                        className="flex flex-col items-start gap-1 p-2 pl-4"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate text-sm">{note.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-5">
                          {note.createdAt}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem
                      onClick={() => handleStarNote(note.id, !note.starred)}
                    >
                      {note.starred ? (
                        <StarOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Star className="h-4 w-4 mr-2" />
                      )}
                      {note.starred ? "Unstar Note" : "Star Note"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDuplicateNote(note.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Note
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => {
                        setNoteToMove({
                          id: note.id,
                          title: note.title,
                          currentFolder: folder.name
                        });
                        setMoveFolderDialogOpen(true);
                      }}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Move to Folder
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => handleRenameNote(note.id, note.title)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename Note
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Move to Trash
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </SidebarMenuItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // SmartNotes data structure
  const data = {
    user: {
      name:
        session?.user?.firstName && session?.user?.lastName
          ? `${session.user.firstName} ${session.user.lastName}`
          : session?.user?.name || "User",
      email: session?.user?.email || "user@example.com",
      avatar: session?.user?.image || "/avatars/default.jpg"
    },
    teams: [
      {
        id: "personal",
        name: "SmartNotes",
        logo: Brain,
        plan: "Personal",
        isPersonal: true
      },
    ], // Personal workspace + teams from API
    navMain: [
      {
        title: "New Note",
        url: "/dashboard",
        icon: Plus
      },
      {
        title: "Search Notes",
        url: "#",
        icon: Search,
        isSearchDialog: true
      },
      {
        title: "All Notes",
        url: "/dashboard/notes",
        icon: FileText
      },
      {
        title: "Study",
        url: "/dashboard/study",
        icon: BookOpen
      },
      {
        title: "Shared Notes",
        url: "/dashboard/shared",
        icon: Users
      },
    ],
    recentNotes: recentNotes,
    folders: folders,
    collections: [
      {
        name: "Starred",
        url: "/dashboard/notes/starred",
        icon: Star
      },
      {
        name: "Trash",
        url: "/dashboard/notes/trash",
        icon: Trash2
      },
    ]
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onSearchClick={onSearchClick} />

        {/* Recent Notes Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Recent Notes</SidebarGroupLabel>
          <SidebarMenu>
            {shouldShowNotesLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <SidebarMenuItem key={`loading-${index}`}>
                  <div className="flex flex-col gap-1 p-2">
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                    </div>
                    <div className="h-3 bg-muted rounded animate-pulse w-16 ml-6" />
                  </div>
                </SidebarMenuItem>
              ))
            ) : data.recentNotes.length > 0 ? (
              data.recentNotes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        tooltip={note.title}
                        isActive={pathname === note.url}
                      >
                        <Link
                          href={note.url}
                          className={`flex flex-col items-start gap-1 p-2 ${
                            pathname === note.url
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate text-sm font-medium">
                              {note.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground ml-6">
                            {note.createdAt}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() => handleStarNote(note.id, !note.starred)}
                      >
                        {note.starred ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Unstar Note
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Star Note
                          </>
                        )}
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleDuplicateNote(note.id)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate Note
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          handleMoveNoteToFolder(note.id, note.title)
                        }
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Move to Folder
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => handleRenameNote(note.id, note.title)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename Note
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Move to Trash
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </SidebarMenuItem>
              ))
            ) : state !== "collapsed" ? (
              // Empty state - only show when sidebar is expanded
              <SidebarMenuItem>
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-sm text-muted-foreground">
                    No notes yet
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Create your first note to get started
                  </div>
                </div>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>

        {/* Folders Section */}
        <SidebarGroup>
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex items-center justify-between group cursor-pointer hover:bg-sidebar-accent/50 rounded-md px-2 py-1 transition-colors">
                <SidebarGroupLabel className="cursor-pointer">
                  Folders
                </SidebarGroupLabel>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Right-click
                  </span>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={handleAddFolder}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <SidebarMenu>
            {/* New Folder Creation */}
            {isCreatingFolder && (
              <SidebarMenuItem>
                <form onSubmit={handleFolderNameSubmit} className="px-2 py-1">
                  <Input
                    ref={folderInputRef}
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={handleFolderNameCancel}
                    onKeyDown={handleKeyDown}
                    placeholder="Folder name"
                    className="h-8 text-sm"
                  />
                </form>
              </SidebarMenuItem>
            )}

            {/* Render all folders with loading and empty states */}
            {shouldShowFoldersLoading ? (
              // Loading skeleton
              Array.from({ length: 2 }).map((_, index) => (
                <SidebarMenuItem key={`folder-loading-${index}`}>
                  <div className="flex items-center gap-2 p-2">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                  </div>
                </SidebarMenuItem>
              ))
            ) : data.folders.length > 0 ? (
              data.folders.map((folder) =>
                renderFolder(folder, 0, folder.id || folder.name)
              )
            ) : state !== "collapsed" ? (
              // Empty state - only show when sidebar is expanded
              <SidebarMenuItem>
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Folder className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-sm text-muted-foreground">
                    No folders yet
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Right-click to create your first folder
                  </div>
                </div>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroup>

        {/* Collections Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarMenu>
            {data.collections.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild tooltip={item.name}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />

      {/* Delete Folder Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{folderToDelete?.name}" folder?
              {folderToDelete && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  This action cannot be undone. All notes in this folder will
                  become unorganized (no folder assigned).
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteFolder}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFolder}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation Dialog */}
      <Dialog
        open={noteDeleteDialogOpen}
        onOpenChange={setNoteDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Trash</DialogTitle>
            <DialogDescription>
              Are you sure you want to move "{noteToDelete?.title}" to trash?
              {noteToDelete && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  You can restore it later from the trash.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteNote}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteNote}>
              Move to Trash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Move to Folder Dialog */}
      <Dialog
        open={moveFolderDialogOpen}
        onOpenChange={setMoveFolderDialogOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Move to Folder
            </DialogTitle>
            <DialogDescription>
              Move "{noteToMove?.title}" to a different folder
              {noteToMove?.currentFolder && (
                <span className="block mt-2 text-sm">
                  Currently in:{" "}
                  <Badge
                    variant="outline"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    {noteToMove.currentFolder}
                  </Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={folderSearchQuery}
                onChange={(e) => setFolderSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Existing Folders Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Select Folder
                </h3>
                <ScrollArea className="h-48 w-full">
                  <div className="space-y-2 pr-3">
                    <TooltipProvider>
                      <RadioGroup
                        value={selectedFolder}
                        onValueChange={setSelectedFolder}
                        className="space-y-2"
                      >
                        {/* Existing Folders */}
                        {folders
                          .filter((folder) =>
                            folder.name
                              .toLowerCase()
                              .includes(folderSearchQuery.toLowerCase())
                          )
                          .map((folder) => (
                            <div
                              key={folder.id || folder.name}
                              className="space-y-2"
                            >
                              <Label
                                htmlFor={folder.name}
                                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border shadow-sm hover:shadow-md hover:border-accent ${
                                  selectedFolder === folder.name
                                    ? "bg-primary/10 border-primary shadow-md"
                                    : "bg-background border-border hover:bg-accent/30"
                                }`}
                              >
                                <RadioGroupItem
                                  value={folder.name}
                                  id={folder.name}
                                />
                                <div className="flex items-center gap-3 flex-1">
                                  <Folder className="h-4 w-4 text-blue-500" />
                                  <div className="flex-1">
                                    <span className="font-medium text-sm">
                                      {folder.name}
                                    </span>
                                    {folder.noteCount > 0 && (
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                        {folder.noteCount} notes
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}

                        {/* No folders found */}
                        {folders.filter((folder) =>
                          folder.name
                            .toLowerCase()
                            .includes(folderSearchQuery.toLowerCase())
                        ).length === 0 &&
                          folderSearchQuery && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No folders found</p>
                              <p className="text-xs">
                                Try a different search term or create a new
                                folder below
                              </p>
                            </div>
                          )}
                      </RadioGroup>
                    </TooltipProvider>
                  </div>
                </ScrollArea>
              </div>

              {/* Create New Folder Section */}
              <div className="bg-muted/30 rounded-lg p-4 border border-muted/50">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Create New Folder
                </h3>
                {!showNewFolderInput ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewFolderInput(true)}
                    className="w-full justify-start gap-2 h-10 border-dashed hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Folder
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        placeholder="Enter folder name..."
                        value={newFolderName}
                        onChange={(e) => {
                          setNewFolderName(e.target.value);
                          setSelectedFolder("new-folder");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newFolderName.trim()) {
                            confirmMoveToFolder();
                          }
                        }}
                        className="pr-8"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowNewFolderInput(false);
                          setNewFolderName("");
                          if (selectedFolder === "new-folder") {
                            setSelectedFolder("");
                          }
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Validation message */}
                    {!newFolderName.trim() && (
                      <div className="text-xs text-muted-foreground">
                        Enter a folder name to create and move the note
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-8">
            <Button variant="outline" onClick={cancelMoveToFolder}>
              Cancel
            </Button>
            <Button
              onClick={confirmMoveToFolder}
              disabled={
                !selectedFolder ||
                (selectedFolder === "new-folder" && !newFolderName.trim())
              }
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {selectedFolder === "new-folder" ? "Create & Move" : "Move Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Note Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Rename Note
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{noteToRename?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="note-name" className="text-sm font-medium">
                Note Title
              </label>
              <Input
                id="note-name"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                placeholder="Enter note title..."
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    confirmRenameNote();
                  } else if (e.key === "Escape") {
                    cancelRenameNote();
                  }
                }}
                autoFocus
              />
            </div>

            {/* Character count */}
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {newNoteName.length > 0 &&
                newNoteName.trim() !== noteToRename?.title
                  ? "Press Enter to save"
                  : ""}
              </span>
              <span>{newNoteName.length}/100</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelRenameNote}>
              Cancel
            </Button>
            <Button
              onClick={confirmRenameNote}
              disabled={
                !newNoteName ||
                newNoteName.trim() === "" ||
                newNoteName.trim() === noteToRename?.title
              }
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Rename Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
