"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Mail,
  Crown,
  Edit3,
  Eye,
  UserPlus,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export function TeamManagementDialog({
  open,
  onOpenChange,
  team,
  isCreating = false
}) {
  const [teamName, setTeamName] = useState(team?.name || "");
  const [teamDescription, setTeamDescription] = useState(
    team?.description || ""
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch team members when team changes
  React.useEffect(() => {
    if (!isCreating && team?.id && open) {
      fetchTeamMembers();
    }
  }, [team?.id, open, isCreating]);

  const fetchTeamMembers = async () => {
    if (!team?.id) return;

    try {
      setLoadingMembers(true);
      const response = await apiFetch(`/api/teams/${team.id}/members`);

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsLoading(true);
    try {
      if (isCreating) {
        // Create new team
        const response = await apiFetch("/api/teams", {
          method: "POST",
          body: JSON.stringify({
            name: teamName.trim(),
            description: teamDescription.trim()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create team");
        }

        toast.success("Team created successfully!");

        // Trigger refresh of teams in parent component
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("teamCreated", { detail: data.team })
          );
        }
      } else {
        // Update existing team
        const response = await apiFetch(`/api/teams/${team.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: teamName.trim(),
            description: teamDescription.trim()
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update team");
        }

        toast.success("Team updated successfully!");

        // Trigger refresh of teams in parent component
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("teamUpdated", { detail: data.team })
          );
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving team:", error);
      toast.error(error.message || "Failed to save team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await apiFetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite member");
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");

      // Refresh team members list
      fetchTeamMembers();

      // Trigger refresh of team data
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("teamMemberAdded", { detail: data.member })
        );
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error(error.message || "Failed to send invitation");
    }
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite/${
      team?.id || "new-team"
    }`;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
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

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case "owner":
        return "default";
      case "editor":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  // Handle Enter key submission
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && teamName.trim() && !isLoading) {
      e.preventDefault();
      handleSaveTeam();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-medium">
            <Users className="h-4 w-4" />
            {isCreating ? "Create New Team" : `Manage ${team?.name}`}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isCreating
              ? "Create a new team to collaborate with others"
              : "Manage team settings, members, and permissions"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-3 space-y-3">
          {isCreating ? (
            // Simplified team creation form
            <>
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-sm font-medium">
                  Team Name
                </Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="team-description"
                  className="text-sm font-medium"
                >
                  Description (Optional)
                </Label>
                <Textarea
                  id="team-description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Describe what this team is for..."
                  rows={2}
                  onKeyDown={handleKeyDown}
                  className="resize-none text-sm"
                />
              </div>
            </>
          ) : (
            // Full team management interface
            <div className="space-y-3">
              {/* Team Details */}
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-sm font-medium">
                  Team Name
                </Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="team-description"
                  className="text-sm font-medium"
                >
                  Description (Optional)
                </Label>
                <Textarea
                  id="team-description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Describe what this team is for..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {/* Invite Members */}
              <div className="space-y-3 border-t pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Invite Members</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInviteLink}
                    className="gap-1 h-7 text-xs px-2"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied!" : "Copy Invite Link"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="flex-1 h-9"
                  />
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInviteMember}
                  className="w-full gap-2 h-9"
                  disabled={!inviteEmail.trim()}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              </div>

              {/* Team Members */}
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-sm font-medium">
                  Team Members ({teamMembers.length})
                </h4>
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="text-sm text-muted-foreground">
                      Loading members...
                    </div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-3 text-center">
                    <div className="w-8 h-8 bg-muted/30 rounded-lg flex items-center justify-center mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      No members yet. Invite someone to get started!
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-background hover:bg-muted/30 border border-border/40 rounded-md transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground">
                              {member.user?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs text-foreground">
                              {member.user?.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {member.user?.email}
                            </div>
                          </div>
                        </div>

                        <Badge
                          className={`text-xs px-1.5 py-0.5 ${
                            member.role === "owner"
                              ? "bg-foreground text-background"
                              : member.role === "editor"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 py-3 border-t">
          {isCreating ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTeam}
                disabled={!teamName.trim() || isLoading}
                className="flex-1 h-9"
              >
                {isLoading ? "Creating..." : "Create Team"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTeam}
                disabled={isLoading}
                className="flex-1 h-9"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
