"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Eye,
  Share2,
  FileText,
  Folder,
  MoreHorizontal,
  Trash2,
  Search,
  Users,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function SharedNotesPage() {
  const [sharedItems, setSharedItems] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [permission, setPermission] = useState("read");
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

  // Search for notes and folders
  const searchFiles = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/shared/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search files');
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Failed to search files:", error);
      toast.error("Failed to search files");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Search for users by email
  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setEmailSuggestions(data.users || []);
      setShowEmailSuggestions(true);
    } catch (error) {
      console.error("Failed to search users:", error);
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
    }
  };

  // Debounced search for files
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFiles(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Debounced search for users
  useEffect(() => {
    const lastEmail = inviteEmails.split(',').pop().trim();
    const timeoutId = setTimeout(() => {
      searchUsers(lastEmail);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inviteEmails]);

  useEffect(() => {
    // Load shared items from API
    loadSharedItems();
  }, []);

  const loadSharedItems = async () => {
    try {
      // Load both shared by me and shared with me
      const [sharedByMeResponse, sharedWithMeResponse] = await Promise.all([
        fetch('/api/shared?type=shared-by-me'),
        fetch('/api/shared?type=shared-with-me')
      ]);

      if (!sharedByMeResponse.ok || !sharedWithMeResponse.ok) {
        throw new Error('Failed to fetch shared items');
      }

      const [sharedByMeData, sharedWithMeData] = await Promise.all([
        sharedByMeResponse.json(),
        sharedWithMeResponse.json()
      ]);

      setSharedByMe(sharedByMeData.items || []);
      setSharedWithMe(sharedWithMeData.items || []);
      
      // Keep the combined list for backward compatibility
      setSharedItems([...(sharedByMeData.items || []), ...(sharedWithMeData.items || [])]);
    } catch (error) {
      console.error("Failed to load shared items:", error);
      toast.error("Failed to load shared items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedNote || !inviteEmails.trim()) {
      toast.error("Please select a note/folder and enter email addresses");
      return;
    }

    try {
      const emails = inviteEmails.split(',').map(email => email.trim()).filter(Boolean);

      // Extract note ID from selected note (remove folder_ prefix if it exists)
      const noteId = selectedNote.startsWith('folder_') ? selectedNote.replace('folder_', '') : selectedNote;

      const response = await fetch('/api/shared', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          emails,
          permission: permission === 'read' ? 'viewer' : 'editor'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to share note');
      }

      const data = await response.json();

      // Show success message
      if (data.addedUsers.length > 0) {
        toast.success(`Invite sent to ${data.addedUsers.map(u => u.email).join(', ')}`);
      }

      if (data.existingUsers.length > 0) {
        toast.success(`Updated permissions for ${data.existingUsers.map(u => u.email).join(', ')}`);
      }

      if (data.notFoundEmails.length > 0) {
        toast.error(`Users not found: ${data.notFoundEmails.join(', ')}`);
      }

      // Refresh shared items list
      loadSharedItems();

      // Reset form
      setSelectedNote("");
      setInviteEmails("");
      setPermission("read");
      setSearchQuery("");
      setSearchResults([]);
      setShowShareModal(false);

    } catch (error) {
      console.error('Error sharing note:', error);
      toast.error(error.message || 'Failed to share note');
    }
  };

  const handlePermissionChange = async (itemId, newPermission, userId = null) => {
    try {
      // Find the item to get user info for permission change
      const item = sharedItems.find(i => i.id === itemId);
      if (!item) return;

      // If no specific user ID provided, update the first collaborator
      const targetUserId = userId || item.sharedWith[0]?.id;
      if (!targetUserId) return;

      const response = await fetch(`/api/shared/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-permission',
          userId: targetUserId,
          permission: newPermission === 'write' ? 'editor' : 'viewer'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permission');
      }

      // Refresh the shared items list to get updated data
      loadSharedItems();

      toast.success("Permission updated successfully");
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error(error.message || 'Failed to update permission');
    }
  };

  const handleRemoveShare = async (itemId) => {
    try {
      const response = await fetch(`/api/shared/${itemId}?action=stop-sharing`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove share');
      }

      // Remove from local state
      setSharedItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Stopped sharing successfully");
    } catch (error) {
      console.error('Error removing share:', error);
      toast.error(error.message || 'Failed to stop sharing');
    }
  };

  const handleLeaveShare = async (itemId) => {
    try {
      const response = await fetch(`/api/shared/${itemId}?action=leave`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave share');
      }

      // Remove from local state
      setSharedItems(prev => prev.filter(item => item.id !== itemId));
      toast.success("Left shared note successfully");
    } catch (error) {
      console.error('Error leaving share:', error);
      toast.error(error.message || 'Failed to leave share');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header matching notes page style */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Shared Notes</h1>
              <span className="text-sm text-muted-foreground font-medium">
                {sharedItems.length} {sharedItems.length === 1 ? "item" : "items"}
              </span>
            </div>
            <Button
              onClick={() => setShowShareModal(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg px-4 py-2 font-medium w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {sharedItems.length === 0 ? (
            // Empty State matching notes page style
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="relative mb-8">
                  <div className="bg-muted rounded-xl p-8 w-24 h-24 mx-auto flex items-center justify-center shadow-lg">
                    <Share2 className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="h-3 w-3 text-primary" />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-semibold text-foreground">Nothing shared yet</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Click + Share to invite someone.
                  </p>
                </div>

                <Button
                  onClick={() => setShowShareModal(true)}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-3 font-medium text-base"
                >
                  <Plus className="h-5 w-5" />
                  Share
                </Button>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Share notes and folders with your team for seamless collaboration
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Shared By Me Section */}
              {sharedByMe.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Shared By Me</h2>
                    <span className="text-sm text-muted-foreground font-medium">
                      {sharedByMe.length} {sharedByMe.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {sharedByMe.map((item) => (
                      <Card
                        key={item.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md border border-border bg-card hover:bg-card/80 rounded-lg overflow-hidden"
                        onClick={() => window.open(`/dashboard/notes/${item.id}`, '_blank')}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            {/* Left side - Icon, Name and Collaborators */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Document/Folder Icon */}
                              <div className="flex-shrink-0">
                                {item.type === "folder" ? (
                                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Title and Collaborators */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl leading-tight text-foreground line-clamp-1 mb-2">
                                  {item.name}
                                </h3>

                                <div className="flex items-center gap-3">
                                  {/* Avatar stack */}
                                  <div className="flex -space-x-2">
                                    {(item.sharedWith || []).slice(0, 3).map((person, index) => (
                                      <Avatar key={index} className="h-7 w-7 border-2 border-background">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                                          {(person.name || '').split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {(item.sharedWith || []).length > 3 && (
                                      <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          +{(item.sharedWith || []).length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Collaborator names */}
                                  <span className="text-sm text-muted-foreground">
                                    {(item.sharedWith || []).slice(0, 2).map(p => p.name || 'Unknown').join(', ')}
                                    {(item.sharedWith || []).length > 2 && ` and ${(item.sharedWith || []).length - 2} more`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side - Permission Badge and Actions */}
                            <div className="flex items-center gap-3 ml-4">
                              {/* Permission badge */}
                              <Badge
                                variant="default"
                                className="gap-1 px-3 py-1 font-medium"
                              >
                                <Edit className="h-3 w-3" />
                                Owner
                              </Badge>

                              {/* Three-dot menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 hover:bg-muted rounded-md opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePermissionChange(item.id, "write");
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Change to Write
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePermissionChange(item.id, "read");
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Change to Read-only
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveShare(item.id);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Stop Sharing
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Shared With Me Section */}
              {sharedWithMe.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Shared With Me</h2>
                    <span className="text-sm text-muted-foreground font-medium">
                      {sharedWithMe.length} {sharedWithMe.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {sharedWithMe.map((item) => (
                      <Card
                        key={item.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md border border-border bg-card hover:bg-card/80 rounded-lg overflow-hidden"
                        onClick={() => window.open(`/dashboard/notes/${item.id}`, '_blank')}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            {/* Left side - Icon, Name and Owner */}
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {/* Document/Folder Icon */}
                              <div className="flex-shrink-0">
                                {item.type === "folder" ? (
                                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              {/* Title and Owner */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xl leading-tight text-foreground line-clamp-1 mb-2">
                                  {item.name}
                                </h3>

                                <div className="flex items-center gap-3">
                                  {/* Owner avatar */}
                                  <Avatar className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={item.owner?.avatar} />
                                    <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                                      {(item.owner?.name || '').split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>

                                  {/* Owner name */}
                                  <span className="text-sm text-muted-foreground">
                                    {item.owner?.name || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right side - Permission Badge and Actions */}
                            <div className="flex items-center gap-3 ml-4">
                              {/* Permission badge */}
                              <Badge
                                variant={item.permission === "editor" ? "default" : "secondary"}
                                className="gap-1 px-3 py-1 font-medium"
                              >
                                {item.permission === "editor" ? (
                                  <>
                                    <Edit className="h-3 w-3" />
                                    Write
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3" />
                                    Read-only
                                  </>
                                )}
                              </Badge>

                              {/* Three-dot menu */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-8 w-8 p-0 hover:bg-muted rounded-md opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLeaveShare(item.id);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Leave Share
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Note or Folder
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Search for files and folders, then invite people to collaborate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Search files and folders
              </label>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your notes and folders..."
                  className="pl-10 bg-card border-border focus:ring-2 focus:ring-ring/20"
                />
              </div>

              {/* Search Results */}
              <div className="border border-border rounded-lg bg-card max-h-48 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? "No files found matching your search" : "Start typing to search files"}
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => setSelectedNote(note.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedNote === note.id ? "bg-primary/10 border border-primary/20" : ""
                          }`}
                      >
                        {/* File/Folder Icon */}
                        <div className="flex-shrink-0">
                          {note.type === "folder" ? (
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
                              <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {note.name}
                            </h4>
                            {selectedNote === note.id && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {note.folder && (
                              <>
                                <span>{note.folder}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{note.lastModified}</span>
                            {note.isShared && (
                              <>
                                <span>•</span>
                                <span className="text-primary">Shared</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Invite People Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Invite people
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  onFocus={() => setShowEmailSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                  placeholder="Enter email addresses (comma-separated)"
                  className="pl-10 bg-card border-border focus:ring-2 focus:ring-ring/20"
                />

                {/* Email Suggestions Dropdown */}
                {showEmailSuggestions && emailSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {emailSuggestions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          const emails = inviteEmails.split(',').map(e => e.trim()).filter(Boolean);
                          const lastEmailIndex = emails.length - 1;
                          if (lastEmailIndex >= 0) {
                            emails[lastEmailIndex] = user.email;
                          } else {
                            emails.push(user.email);
                          }
                          setInviteEmails(emails.join(', '));
                          setShowEmailSuggestions(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Separate multiple email addresses with commas
              </p>
            </div>

            {/* Permission Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Permission level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setPermission("read")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${permission === "read"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${permission === "read" ? "bg-primary/20" : "bg-muted"
                      }`}>
                      <Eye className={`h-4 w-4 ${permission === "read" ? "text-primary" : "text-muted-foreground"
                        }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">Read-only</h4>
                      <p className="text-xs text-muted-foreground">Can view and comment</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPermission("write")}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${permission === "write"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-border/80"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${permission === "write" ? "bg-primary/20" : "bg-muted"
                      }`}>
                      <Edit className={`h-4 w-4 ${permission === "write" ? "text-primary" : "text-muted-foreground"
                        }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-foreground">Write</h4>
                      <p className="text-xs text-muted-foreground">Can edit and share</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareModal(false);
                setSearchQuery("");
                setSelectedNote("");
                setInviteEmails("");
                setPermission("read");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={!selectedNote || !inviteEmails.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}