"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotes } from "@/contexts/NotesContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Trash2,
  Calendar,
  Folder,
  MoreHorizontal,
  RotateCcw,
  Trash,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  Square,
  Clock,
  FileX,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function TrashPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { triggerRefresh } = useNotes();
  const [deletedNotes, setDeletedNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] =
    useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Bulk actions state
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null); // 'restore' or 'delete'

  useEffect(() => {
    // Load deleted notes with initial loader
    loadDeletedNotes(true);
  }, [session]);

  // Utility functions
  const getDaysUntilDeletion = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(
      deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // 30 days
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const getDeletionProgress = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(
      deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const totalTime = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    const timeElapsed = now - deletedDate;
    return Math.min(100, Math.max(0, (timeElapsed / totalTime) * 100));
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // Bulk selection functions
  const toggleNoteSelection = (noteId) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const selectAllNotes = () => {
    if (selectedNotes.size === deletedNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(deletedNotes.map((note) => note._id)));
    }
  };

  const clearSelection = () => {
    setSelectedNotes(new Set());
  };

  const loadDeletedNotes = async (showLoader = false) => {
    if (!session) return;

    try {
      if (showLoader) setIsLoading(true);
      const response = await fetch("/api/notes/trash", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch deleted notes");
      }

      const data = await response.json();
      setDeletedNotes(data.notes || []);
    } catch (error) {
      console.error("Failed to load deleted notes:", error);
      if (showLoader) toast.error("Failed to load deleted notes");
    } finally {
      if (showLoader) setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Show restore dialog
  const handleRestoreNote = (note) => {
    setSelectedNote(note);
    setRestoreDialogOpen(true);
  };

  // Confirm restore
  const confirmRestoreNote = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(`/api/notes/${selectedNote._id}/restore`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to restore note");
      }

      await loadDeletedNotes(); // Refresh the trash list
      triggerRefresh(); // Refresh the sidebar to show restored note
      setRestoreDialogOpen(false);
      setSelectedNote(null);
      toast.success("Note restored successfully", {
        description: `"${
          selectedNote.title || "Untitled Note"
        }" has been moved back to your notes`,
        duration: 4000,
      });
    } catch (error) {
      toast.error("Failed to restore note");
      console.error("Failed to restore note:", error);
    }
  };

  // Show permanent delete dialog
  const handlePermanentDelete = (note) => {
    setSelectedNote(note);
    setPermanentDeleteDialogOpen(true);
  };

  // Confirm permanent delete
  const confirmPermanentDelete = async () => {
    if (!selectedNote) return;

    try {
      const response = await fetch(
        `/api/notes/${selectedNote._id}?permanent=true`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to permanently delete note");
      }

      await loadDeletedNotes(); // Refresh the list
      setPermanentDeleteDialogOpen(false);
      setSelectedNote(null);
      toast.success("Note permanently deleted");
    } catch (error) {
      toast.error("Failed to delete note permanently");
      console.error("Failed to permanently delete note:", error);
    }
  };

  // Empty trash with confirmation dialog
  const handleEmptyTrash = () => {
    setEmptyTrashDialogOpen(true);
  };

  const confirmEmptyTrash = async () => {
    try {
      const response = await fetch("/api/notes/trash", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to empty trash");
      }

      const data = await response.json();
      await loadDeletedNotes();
      setEmptyTrashDialogOpen(false);
      toast.success(
        `Trash emptied successfully. ${data.deletedCount} notes permanently deleted.`
      );
    } catch (error) {
      toast.error("Failed to empty trash");
      console.error("Failed to empty trash:", error);
    }
  };

  // Bulk actions
  const handleBulkAction = (actionType) => {
    setBulkActionType(actionType);
    setBulkActionDialogOpen(true);
  };

  const confirmBulkAction = async () => {
    if (selectedNotes.size === 0) return;

    try {
      const noteIds = Array.from(selectedNotes);

      if (bulkActionType === "restore") {
        // Restore selected notes
        await Promise.all(
          noteIds.map((noteId) =>
            fetch(`/api/notes/${noteId}/restore`, { method: "PUT" })
          )
        );
        toast.success(`${noteIds.length} notes restored successfully`, {
          description: `${noteIds.length} ${
            noteIds.length === 1 ? "note has" : "notes have"
          } been moved back to your notes`,
          duration: 4000,
        });
      } else if (bulkActionType === "delete") {
        // Permanently delete selected notes
        await Promise.all(
          noteIds.map((noteId) =>
            fetch(`/api/notes/${noteId}?permanent=true`, { method: "DELETE" })
          )
        );
        toast.success(`${noteIds.length} notes permanently deleted`, {
          description: `${noteIds.length} ${
            noteIds.length === 1 ? "note has" : "notes have"
          } been permanently removed`,
          duration: 4000,
        });
      }

      await loadDeletedNotes();
      triggerRefresh();
      clearSelection();
      setBulkActionDialogOpen(false);
      setBulkActionType(null);
    } catch (error) {
      toast.error(`Failed to ${bulkActionType} notes`);
      console.error(`Failed to ${bulkActionType} notes:`, error);
    }
  };

  if (isLoading && isInitialLoad) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Trash</h1>
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>

        {/* Warning Banner Skeleton */}
        <div className="bg-muted/30 border border-muted rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-80" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>

        {/* Notes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Contextual Action Bar - Clean and Elevated */}
      {selectedNotes.size > 0 && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b shadow-lg px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold">
                  {selectedNotes.size}{" "}
                  {selectedNotes.size === 1 ? "note" : "notes"} selected
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-8 px-3 text-xs"
              >
                Clear
              </Button>
            </div>

            {/* Responsive Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkAction("restore")}
                  className="h-9 px-4"
                >
                  <Undo2 className="h-4 w-4 mr-2" />
                  Restore{" "}
                  {selectedNotes.size > 1 ? `(${selectedNotes.size})` : ""}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="h-9 px-4"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete{" "}
                  {selectedNotes.size > 1 ? `(${selectedNotes.size})` : ""}
                </Button>
              </div>

              {/* Mobile Dropdown */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      Actions
                      <MoreHorizontal className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("restore")}
                    >
                      <Undo2 className="h-4 w-4 mr-2" />
                      Restore ({selectedNotes.size})
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("delete")}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete ({selectedNotes.size})
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Trash</h1>
              <p className="text-sm text-muted-foreground">
                {deletedNotes.length}{" "}
                {deletedNotes.length === 1 ? "note" : "notes"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDeletedNotes(true)}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {deletedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
              <Trash2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              No deleted notes
            </h3>
            <p className="text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
              Deleted notes will appear here for 30 days before being
              permanently removed. You can restore them anytime during this
              period.
            </p>
            <Button asChild variant="outline" className="h-10 px-6">
              <Link href="/dashboard">
                <FileX className="h-4 w-4 mr-2" />
                Browse Notes
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Theme-Consistent Warning Banner */}
            <div className="bg-muted/30 border border-border rounded-lg p-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    Notes will be permanently deleted after 30 days
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select notes to restore or delete them permanently
                  </p>
                </div>
              </div>
            </div>

            {/* Select All Control */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={
                    selectedNotes.size === deletedNotes.length &&
                    deletedNotes.length > 0
                  }
                  onCheckedChange={selectAllNotes}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  Select all {deletedNotes.length} notes
                </span>
              </div>

              {selectedNotes.size === 0 && (
                <p className="text-xs text-muted-foreground">
                  Click checkboxes to select notes for bulk actions
                </p>
              )}
            </div>

            {/* Responsive Grid Layout with Consistent Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {deletedNotes.map((note) => {
                const daysLeft = getDaysUntilDeletion(note.deletedAt);
                const isSelected = selectedNotes.has(note._id);

                return (
                  <Card
                    key={note._id}
                    className={`group h-64 transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-primary shadow-md"
                        : "hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* Header Section - Fixed Height */}
                      <div className="flex items-start justify-between mb-4 h-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              toggleNoteSelection(note._id)
                            }
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          {note.folder && (
                            <Badge variant="secondary" className="text-xs h-5">
                              <Folder className="h-3 w-3 mr-1" />
                              {note.folder}
                            </Badge>
                          )}
                        </div>

                        {/* Theme-Consistent Days Left Badge */}
                        <Badge
                          variant={
                            daysLeft <= 3
                              ? "destructive"
                              : daysLeft <= 7
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs h-5 font-medium"
                        >
                          {daysLeft === 0
                            ? "Expires today"
                            : `${daysLeft} days left`}
                        </Badge>
                      </div>

                      {/* Content Area - Flexible Height */}
                      <div className="flex-1 mb-3">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                          {note.title || "Untitled Note"}
                        </h3>
                        {note.content && (
                          <p className="text-muted-foreground text-xs line-clamp-3 leading-relaxed">
                            {note.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 100)}
                            {note.content.length > 100 ? "..." : ""}
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="mb-4">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            Deleted {formatRelativeTime(note.deletedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons - Hidden when bulk actions are active */}
                      {selectedNotes.size === 0 && (
                        <div className="mt-auto pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRestoreNote(note)}
                              className="flex-1 h-8"
                            >
                              <Undo2 className="h-3 w-3 mr-2" />
                              Restore
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handlePermanentDelete(note)}
                              className="h-8 px-3"
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Selection Indicator when bulk actions are active */}
                      {selectedNotes.size > 0 && (
                        <div className="mt-auto pt-3 border-t">
                          <div className="flex items-center justify-center">
                            <div
                              className={`text-xs font-medium ${
                                isSelected
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isSelected ? "Selected" : "Click to select"}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Restore Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore "
              {selectedNote?.title || "Untitled Note"}"?
              <span className="block mt-2 text-sm text-muted-foreground">
                The note will be moved back to your active notes.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRestoreNote}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog
        open={permanentDeleteDialogOpen}
        onOpenChange={setPermanentDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Permanently Delete Note
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "
              {selectedNote?.title || "Untitled Note"}"?
              <span className="block mt-2 text-sm text-destructive font-medium">
                This action cannot be undone. The note will be completely
                removed from the database.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermanentDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmPermanentDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Empty Trash Confirmation Dialog */}
      <Dialog
        open={emptyTrashDialogOpen}
        onOpenChange={setEmptyTrashDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty Trash
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete all{" "}
              {deletedNotes.length} notes in trash?
              <span className="block mt-2 text-sm text-destructive font-medium">
                This action cannot be undone. All notes will be completely
                removed from the database.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmptyTrashDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEmptyTrash}>
              <Trash className="h-4 w-4 mr-2" />
              Empty Trash ({deletedNotes.length} notes)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onOpenChange={setBulkActionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkActionType === "restore" ? (
                <>
                  <Undo2 className="h-5 w-5 text-green-600" />
                  Restore Notes
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete Notes Permanently
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {bulkActionType === "restore" ? (
                <>
                  Are you sure you want to restore {selectedNotes.size} selected
                  notes?
                  <span className="block mt-2 text-sm text-muted-foreground">
                    The notes will be moved back to your active notes.
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete{" "}
                  {selectedNotes.size} selected notes?
                  <span className="block mt-2 text-sm text-destructive font-medium">
                    This action cannot be undone. The notes will be completely
                    removed from the database.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkActionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={bulkActionType === "restore" ? "default" : "destructive"}
              onClick={confirmBulkAction}
              className={
                bulkActionType === "restore"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {bulkActionType === "restore" ? (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Restore {selectedNotes.size} Notes
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete {selectedNotes.size} Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
