"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users,
  FileText,
  Settings,
  UserPlus,
  Crown,
  Edit3,
  Eye,
  Calendar,
  Activity,
  Plus,
  Folder,
  FolderPlus,
  Check,
  CheckCircle,
  Clock,
  MoreVertical,
  X,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { TeamManagementDialog } from "@/components/team-management-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import TeamSettings from "@/components/team-settings";

export default function TeamDashboard() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId;

  const [team, setTeam] = useState(null);
  const [teamNotes, setTeamNotes] = useState([]);
  const [teamFolders, setTeamFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      fetchTeamFolders();
      fetchTeamNotes();
    }
  }, [teamId]);

  // Auto-select appropriate folder when data loads
  useEffect(() => {
    if (!selectedFolder && (teamNotes.length > 0 || teamFolders.length > 0)) {
      const unfiledNotes = teamNotes.filter((note) => !note.folder);
      if (teamFolders.length > 0) {
        // If there are folders, select the first folder
        setSelectedFolder(teamFolders[0].name);
      } else if (unfiledNotes.length > 0) {
        // If no folders but unfiled notes exist, select unfiled
        setSelectedFolder("unfiled");
      } else {
        // Default to showing all notes
        setSelectedFolder("all");
      }
    }
  }, [teamNotes, teamFolders, selectedFolder]);

  // Fetch notes when folder selection changes
  useEffect(() => {
    if (teamId && activeTab === "notes") {
      fetchTeamNotes();
    }
  }, [selectedFolder, teamId, activeTab]);

  // Fetch activities when Activity tab is selected
  useEffect(() => {
    if (activeTab === "activity" && teamId) {
      fetchActivities();
    }
  }, [activeTab, teamId]);

  // Listen for team member updates
  useEffect(() => {
    const handleTeamMemberAdded = () => {
      fetchTeamData(); // Refresh team data when member is added
      if (activeTab === "activity") {
        fetchActivities(); // Refresh activities if on activity tab
      }
    };

    window.addEventListener("teamMemberAdded", handleTeamMemberAdded);

    return () => {
      window.removeEventListener("teamMemberAdded", handleTeamMemberAdded);
    };
  }, [activeTab]);

  const fetchTeamData = async () => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching team data for ID:", teamId);
      }
      const response = await fetch(`/api/teams/${teamId}`);

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Response status:", response.status);
      }

      if (!response.ok) {
        const errorData = await response.json();
        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("API Error:", errorData);
        }

        if (response.status === 404) {
          toast.error("Team not found");
          router.push("/dashboard");
          return;
        }
        if (response.status === 403) {
          toast.error("Access denied to this team");
          router.push("/dashboard");
          return;
        }
        throw new Error(errorData.error || "Failed to fetch team data");
      }

      const data = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Team data received:", data);
      }
      setTeam(data.team);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching team:", error);
      }
      toast.error(`Failed to load team: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamFolders = async () => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching team folders for team ID:", teamId);
      }
      const response = await fetch(`/api/teams/${teamId}/folders`);

      if (!response.ok) {
        const errorData = await response.json();
        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Team folders API Error:", errorData);
        }
        throw new Error(errorData.error || "Failed to fetch team folders");
      }

      const data = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Team folders data received:", data);
      }
      setTeamFolders(data.folders || []);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching team folders:", error);
      }
      toast.error(`Failed to load team folders: ${error.message}`);
    }
  };

  const fetchTeamNotes = async () => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Fetching team notes for team ID:",
          teamId,
          "folder:",
          selectedFolder
        );
      }
      let url = `/api/teams/${teamId}/notes`;
      if (selectedFolder && selectedFolder !== "all") {
        if (selectedFolder === "unfiled") {
          url += "?folder=null";
        } else {
          url += `?folder=${encodeURIComponent(selectedFolder)}`;
        }
      }

      const response = await fetch(url);

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Team notes response status:", response.status);
      }

      if (!response.ok) {
        const errorData = await response.json();
        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Team notes API Error:", errorData);
        }
        throw new Error(errorData.error || "Failed to fetch team notes");
      }

      const data = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Team notes data received:", data);
      }
      setTeamNotes(data.notes || []);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching team notes:", error);
      }
      toast.error(`Failed to load team notes: ${error.message}`);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const response = await fetch(`/api/teams/${teamId}/activities`);

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching activities:", error);
      }
      toast.error("Failed to load activities");
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const logActivity = async (type, description, metadata = {}) => {
    try {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Logging activity:", { type, description, metadata });
      }

      const response = await fetch(`/api/teams/${teamId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          description,
          metadata,
        }),
      });

      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Activity log response status:", response.status);
      }

      if (!response.ok) {
        const errorData = await response.json();
        // Only log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error("Activity log error:", errorData);
        }
        throw new Error(errorData.error || "Failed to log activity");
      }

      const data = await response.json();
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Activity logged successfully:", data);
      }
    } catch (error) {
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error logging activity:", error);
      }
      // Don't show error to user for activity logging failures
    }
  };

  const handleCreateTeamNote = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/notes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Team Note",
          content: "",
          // Don't auto-assign folder - let users organize notes manually
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create team note");
      }

      const data = await response.json();
      toast.success("Team note created successfully!");

      // Log activity
      await logActivity("note_created", "Created a new team note", {
        noteTitle: data.note.title,
        noteId: data.note.id,
      });

      // Refresh team notes and folders
      fetchTeamNotes();
      fetchTeamFolders();

      // Navigate to the new note editor
      window.location.href = `/dashboard/notes/${data.note.id}?team=${teamId}`;
    } catch (error) {
      console.error("Error creating team note:", error);
      toast.error(`Failed to create team note: ${error.message}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create folder");
      }

      const data = await response.json();

      // Refresh folders
      fetchTeamFolders();

      // Reset form
      setIsCreatingFolder(false);
      setNewFolderName("");

      // Select the new folder
      setSelectedFolder(data.folder.name);

      toast.success(`Folder "${data.folder.name}" created successfully`);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(error.message);
    }
  };

  const handleMoveNoteToFolder = async (noteId, folderName) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder: folderName === "unfiled" ? null : folderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to move note");
      }

      // Refresh notes and folders
      fetchTeamNotes();
      fetchTeamFolders();

      const action =
        folderName === "unfiled"
          ? "removed from folder"
          : `moved to ${folderName}`;
      toast.success(`Note ${action} successfully`);
    } catch (error) {
      console.error("Error moving note:", error);
      toast.error(error.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "admin":
        return <Settings className="h-3 w-3" />;
      case "editor":
        return <Edit3 className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "editor":
        return "outline";
      case "viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium">Loading team...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium">Team not found</div>
          <div className="text-sm text-muted-foreground mb-4">
            The team you're looking for doesn't exist or you don't have access
            to it.
          </div>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Team Header */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {team.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {team.description || "College Friends"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{team.memberCount} members</span>
            <span>•</span>
            <span>{team.userRole}</span>
          </div>
        </div>
      </div>

      {/* Team Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <div className="border-b border-border/60">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "notes"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "members"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === "activity"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Activity
            </button>
            {(team.isOwner || team.userPermissions?.canManageTeam) && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`pb-3 text-sm font-medium transition-colors ${
                  activeTab === "settings"
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Settings
              </button>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border/50 rounded-md p-6 bg-background hover:bg-muted/20 transition-colors">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Total Notes
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {team.stats?.totalNotes || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Shared team notes
              </div>
            </div>

            <div className="border border-border/50 rounded-md p-6 bg-background hover:bg-muted/20 transition-colors">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Team Members
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {team.memberCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Active collaborators
              </div>
            </div>

            <div className="border border-border/50 rounded-md p-6 bg-background hover:bg-muted/20 transition-colors">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Last Activity
              </div>
              <div className="text-2xl font-semibold text-foreground mb-1">
                {team.stats?.lastActivity
                  ? new Date(team.stats.lastActivity).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )
                  : "None"}
              </div>
              <div className="text-xs text-muted-foreground">
                Recent team activity
              </div>
            </div>
          </div>

          {/* Recent Members */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                Recent Members
              </h3>
              <p className="text-sm text-muted-foreground">
                Latest team members who joined
              </p>
            </div>

            <div className="space-y-3">
              {team.members?.slice(0, 5).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-md border border-border/50 bg-background hover:bg-muted/20 transition-colors"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage
                      src={member.user?.image}
                      alt={member.user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                      {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {member.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.user?.email || "No email"}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${
                      member.role === "owner"
                        ? "bg-foreground text-background"
                        : member.role === "editor"
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {member.role}
                  </div>
                </div>
              ))}
              {team.members?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">
                    No members yet. Invite someone to get started!
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Team Notes Card */}
            <div
              className="group cursor-pointer p-5 rounded-md border border-border/50 bg-background hover:bg-muted/20 transition-all duration-200"
              onClick={() =>
                (window.location.href = `/dashboard/teams/${teamId}/notes`)
              }
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-muted/50 rounded-sm flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    All Team Notes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    View and manage all team notes
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-foreground">
                  {team?.stats?.totalNotes || 0}
                </span>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </div>
              </div>
            </div>

            {/* All Team Folders Card */}
            <div
              className="group cursor-pointer p-5 rounded-md border border-border/50 bg-background hover:bg-muted/20 transition-all duration-200"
              onClick={() =>
                (window.location.href = `/dashboard/teams/${teamId}/folders`)
              }
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-muted/50 rounded-sm flex items-center justify-center">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">
                    All Team Folders
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Organize notes into folders
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-foreground">
                  {teamFolders.length}
                </span>
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-border/50 rounded-md p-5 bg-background">
            <div className="mb-4">
              <h3 className="font-medium text-foreground mb-1">
                Quick Actions
              </h3>
              <p className="text-sm text-muted-foreground">
                Create new notes and folders for your team
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="gap-2" onClick={handleCreateTeamNote}>
                <Plus className="h-4 w-4" />
                Create Team Note
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCreatingFolder(true)}
              >
                <FolderPlus className="h-4 w-4" />
                Create Team Folder
              </Button>
            </div>

            {/* Folder Creation Form */}
            {isCreatingFolder && (
              <div className="mt-6 p-4 border border-border/50 rounded-lg bg-muted/10">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">
                      Folder Name
                    </label>
                    <Input
                      placeholder="Enter folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateFolder();
                        } else if (e.key === "Escape") {
                          setIsCreatingFolder(false);
                          setNewFolderName("");
                        }
                      }}
                      autoFocus
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" onClick={handleCreateFolder}>
                      <Check className="h-4 w-4 mr-2" />
                      Create Folder
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">
                Team Members
              </h2>
              <p className="text-sm text-muted-foreground">
                {team.members?.length || 0} member
                {(team.members?.length || 0) !== 1 ? "s" : ""} • Manage
                collaborators and permissions
              </p>
            </div>
            {(team.isOwner || team.userPermissions?.canInviteMembers) && (
              <Button
                className="gap-2"
                onClick={() => setIsTeamDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-2">
            {team.members?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No team members yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  Invite collaborators to start building your team
                </p>
                {(team.isOwner || team.userPermissions?.canInviteMembers) && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsTeamDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                  </Button>
                )}
              </div>
            ) : (
              team.members.map((member) => (
                <div
                  key={member.id}
                  className="group flex items-center justify-between p-4 bg-background hover:bg-muted/30 border border-border/40 hover:border-border/60 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={member.user?.image}
                        alt={member.user?.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                        {member.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground text-sm">
                          {member.user?.name || "Unknown User"}
                        </h4>
                        {member.status === "pending" && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.user?.email || "No email"}
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        Joined{" "}
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        member.role === "owner"
                          ? "default"
                          : member.role === "editor"
                          ? "secondary"
                          : "outline"
                      }
                      className={`text-xs ${
                        member.role === "owner"
                          ? "bg-foreground text-background"
                          : member.role === "editor"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted/50 text-muted-foreground border-border"
                      }`}
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-1">
                Recent Activity
              </h2>
              <p className="text-sm text-muted-foreground">
                Track team collaboration and changes
              </p>
            </div>
          </div>

          {/* Activity Feed */}
          {isLoadingActivities ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 bg-background border border-border/40 rounded-lg"
                >
                  <div className="h-8 w-8 bg-muted/50 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted/30 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center mb-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                No activity yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Team activities will appear here as members create notes, edit
                content, and collaborate
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 p-4 bg-background hover:bg-muted/30 border border-border/40 hover:border-border/60 rounded-lg transition-all duration-200"
                >
                  <div className="flex-shrink-0">
                    {activity.user?.avatar ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={activity.user.avatar}
                          alt={activity.user.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                          {activity.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {activity.user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    {activity.type.includes("note") && (
                      <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                    )}
                    {activity.type.includes("folder") && (
                      <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                        <Folder className="h-3.5 w-3.5 text-yellow-600" />
                      </div>
                    )}
                    {activity.type.includes("member") && (
                      <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    )}
                    {activity.type.includes("team") && (
                      <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                        <Settings className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activities.length >= 20 && (
                <div className="text-center pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.info("Load more functionality coming soon");
                    }}
                  >
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        {(team.isOwner || team.userPermissions?.canManageTeam) && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamSettings team={team} onTeamUpdate={fetchTeamData} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Team Management Dialog */}
      <TeamManagementDialog
        open={isTeamDialogOpen}
        onOpenChange={setIsTeamDialogOpen}
        team={team}
        isCreating={false}
      />
    </div>
  );
}
