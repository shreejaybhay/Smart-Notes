"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TiptapEditor } from "@/components/tiptap-editor";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Component to handle search params with Suspense
function SearchParamsProvider({ children }) {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team");
  
  return children({ teamId });
}

function NotePageContent({ teamId }) {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id;

  const [note, setNote] = useState({
    title: "",
    content: "",
    _id: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [canEdit, setCanEdit] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isReadMode, setIsReadMode] = useState(true); // Start in read mode by default

  // Load note from API
  const loadNote = useCallback(async () => {
    if (!noteId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notes/${noteId}`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Note not found");
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to load note");
      }

      const data = await response.json();
      setNote(data.note);
      setLastSaved(new Date());
      setHasUnsavedChanges(false); // Clear unsaved changes when loading

      // Check user permissions for this note
      try {
        const permissionResponse = await fetch(`/api/notes/${noteId}/permissions`);
        if (permissionResponse.ok) {
          const permissionData = await permissionResponse.json();
          setUserRole(permissionData.role);
          setCanEdit(permissionData.canEdit);
          
          // Store permission details for UI display
          setNote(prev => ({
            ...prev,
            permissionDetails: permissionData.permissionDetails,
            accessSource: permissionData.accessSource,
            teamRole: permissionData.teamRole,
            collaboratorRole: permissionData.collaboratorRole
          }));
          
          console.log("User permissions:", permissionData);
        } else {
          // Fallback: check if user owns the note
          const session = await fetch('/api/auth/session').then(res => res.json());
          const isOwner = data.note.userId === session?.user?.id;
          setCanEdit(isOwner);
          setUserRole(isOwner ? 'owner' : 'viewer');
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        // Default to read-only for safety
        setCanEdit(false);
        setUserRole('viewer');
      }

      // If it's a team note, also get team permissions
      if (data.note.isTeamNote && teamId) {
        try {
          const teamResponse = await fetch(`/api/teams/${teamId}`);
          if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            const currentUser = teamData.team.currentUser;

            if (currentUser) {
              console.log("Team permissions:", currentUser);
              // Team permissions override individual permissions for team notes
              setUserRole(currentUser.role);
              setCanEdit(currentUser.permissions?.canEditNotes || false);
            }
          }
        } catch (error) {
          console.error("Error fetching team permissions:", error);
        }
      }
    } catch (error) {
      console.error("Error loading note:", error);
      toast.error("Failed to load note");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [noteId, router]);

  // Save note to API
  const saveNote = useCallback(
    async (updatedNote, isManualSave = false) => {
      if (!noteId || !updatedNote._id) return;

      // Don't save if user doesn't have edit permissions (respects highest permission)
      if (!canEdit) {
        console.log("Save blocked: User doesn't have edit permissions");
        toast.error("You don't have permission to edit this note");
        return;
      }

      try {
        setIsSaving(true);

        // Add manual save flag to URL if this is a manual save
        const url = isManualSave
          ? `/api/notes/${noteId}?manual=true`
          : `/api/notes/${noteId}`;

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updatedNote.title,
            content: updatedNote.content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save note");
        }

        const data = await response.json();
        setNote(data.note);
        setLastSaved(new Date());
        setHasUnsavedChanges(false); // Clear unsaved changes flag

        // Show success indication with activity info for team notes
        if (note.isTeamNote && isManualSave) {
          toast.success("Note saved & team activity logged", {
            duration: 2000,
          });
        } else {
          toast.success("Note saved", {
            duration: 1000,
          });
        }
      } catch (error) {
        console.error("Error saving note:", error);
        toast.error("Failed to save note");
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, note.isTeamNote, userRole, canEdit]
  );

  // Auto-save disabled - Manual save only
  // Users must press Ctrl+S to save their changes

  // Load note on component mount
  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleContentChange = (content) => {
    // Don't update if user is a viewer on a team note
    if (note.isTeamNote && userRole === "viewer" && !canEdit) {
      console.log("Content change blocked: User is viewer on team note");
      return;
    }
    setNote((prev) => ({ ...prev, content }));
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (title) => {
    // Don't update if user is a viewer on a team note
    if (note.isTeamNote && userRole === "viewer" && !canEdit) {
      console.log("Title change blocked: User is viewer on team note");
      return;
    }
    setNote((prev) => ({ ...prev, title }));
    setHasUnsavedChanges(true);
  };

  // Manual save function (for Ctrl+S)
  const handleManualSave = useCallback(() => {
    // Don't save if user is a viewer on a team note
    if (note.isTeamNote && userRole === "viewer" && !canEdit) {
      console.log("Manual save blocked: User is viewer on team note");
      return;
    }
    if (note._id) {
      saveNote(note, true); // Pass true for manual save
    }
  }, [note, saveNote, userRole, canEdit]);

  // Toggle between read and edit mode
  const handleToggleMode = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        "You have unsaved changes. Do you want to save before switching to read mode?"
      );
      if (confirmSwitch) {
        handleManualSave();
      }
    }
    setIsReadMode(!isReadMode);
  }, [isReadMode, hasUnsavedChanges, handleManualSave]);

  // Switch to edit mode
  const handleEditMode = useCallback(() => {
    setIsReadMode(false);
  }, []);

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // If it's a team note and user is viewer, show read-only view
  if (note.isTeamNote && !canEdit && userRole === "viewer") {
    return (
      <div className="h-full overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header with team info */}
          <div className="mb-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Team Note</span>
                {note.teamMetadata?.teamName && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    {note.teamMetadata.teamName}
                  </span>
                )}
              </div>
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                Read Only (viewer)
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {note.title || "Untitled"}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              {note.wordCount && <span>{note.wordCount} words</span>}
            </div>
          </div>

          {/* Note content - rendered as HTML */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html:
                note.content ||
                '<p class="text-muted-foreground">This note is empty.</p>',
            }}
          />

          {/* Tags if any */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show read mode or edit mode based on user preference
  if (isReadMode) {
    return (
      <div className="h-full overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Read Mode Header */}
          <div className="mb-6 pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs rounded-md border border-green-200 dark:border-green-800 font-medium">
                  Read Mode
                </span>
                {note.isTeamNote && note.teamMetadata?.teamName && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                    {note.teamMetadata.teamName}
                  </span>
                )}
                
                {/* Permission Status Indicator */}
                {note.permissionDetails && (
                  <div className="flex items-center gap-2">
                    {/* Main Permission Badge */}
                    <span className={`px-2 py-1 text-xs rounded-md font-medium flex items-center gap-1 ${
                      canEdit 
                        ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    }`}>
                      {canEdit ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Write Access
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Read-only Access
                        </>
                      )}
                      {note.accessSource === 'direct-share' && (
                        <span className="text-xs opacity-75">(from direct share)</span>
                      )}
                    </span>

                    {/* Conflicting Permissions Indicator */}
                    {note.permissionDetails.hasTeamAccess && note.permissionDetails.hasDirectShare && (
                      <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 text-xs rounded-md border border-yellow-200 dark:border-yellow-800 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Team: {note.permissionDetails.teamPermission}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={handleEditMode}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-lg transition-colors duration-200 font-medium"
                  >
                    Edit Note
                  </button>
                )}
                {!canEdit && (
                  <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-lg font-medium">
                    Read-only Access
                  </span>
                )}
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3">
              {note.title || "Untitled"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              {note.content && (
                <span>
                  {note.content.replace(/<[^>]*>/g, "").split(" ").filter(word => word.trim()).length} words
                </span>
              )}
            </div>
          </div>

          {/* Note Content - Read Only with Exact Editor Styling */}
          <div className="tiptap-editor">
            <div className="ProseMirror">
              {note.content ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: note.content,
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <p className="text-lg mb-2">This note is empty</p>
                    {canEdit ? (
                      <p className="text-sm">Click "Edit Note" to start writing</p>
                    ) : (
                      <p className="text-sm">You have read-only access to this note</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags if any */}
          {note.tags && note.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground font-medium">Tags:</span>
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Floating Edit Button for Mobile - Only show if user can edit */}
          {canEdit && (
            <div className="fixed bottom-6 right-6 sm:hidden">
              <button
                onClick={handleEditMode}
                className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                title="Edit Note"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit Mode - Show the full editor
  return (
    <div className="h-full overflow-hidden">
      <TiptapEditor
        content={note.content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        title={note.title}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={handleManualSave}
        onToggleReadMode={handleToggleMode}
        isTeamNote={note.isTeamNote}
        teamName={note.teamMetadata?.teamName}
        teamId={teamId}
        readOnly={false}
        userRole={userRole}
        hasUnsavedChanges={hasUnsavedChanges}
        isReadMode={isReadMode}
      />
    </div>
  );
}
export default function NotePage() {
  return (
    <Suspense fallback={
      <div className="h-full overflow-hidden p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    }>
      <SearchParamsProvider>
        {({ teamId }) => <NotePageContent teamId={teamId} />}
      </SearchParamsProvider>
    </Suspense>
  );
}