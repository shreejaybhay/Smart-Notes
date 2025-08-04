"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Upload, Trash2, LogOut, Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function TeamSettings({ team, onTeamUpdate }) {
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || "");
  const [teamDescription, setTeamDescription] = useState(
    team?.description || ""
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Basic Team Info Section
  const handleUpdateTeamInfo = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setIsUpdatingTeam(true);
      const response = await apiFetch(`/api/teams/${team.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDescription.trim()
        })
      });

      if (response.ok) {
        toast.success("Team information updated successfully");
        onTeamUpdate?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update team information");
      }
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Failed to update team information");
    } finally {
      setIsUpdatingTeam(false);
    }
  };

  // Avatar Upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Delete previous avatar if exists
      if (team.avatar) {
        // Extract delete URL from ImgBB response if stored
        // This would require storing the delete_url when uploading
      }

      // Upload to ImgBB
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", "db6accfc0a3b951f16d45a92c2a6b3af");

      const uploadResponse = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.data.url;

      // Update team avatar
      const response = await apiFetch(`/api/teams/${team.id}`, {
        method: "PUT",
        body: JSON.stringify({
          avatar: imageUrl
        })
      });

      if (response.ok) {
        toast.success("Team avatar updated successfully");
        onTeamUpdate?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update team avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Change Member Role
  const handleChangeRole = async (memberId, newRole) => {
    try {
      const response = await apiFetch(`/api/teams/${team.id}/members/${memberId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            role: newRole
          })
        }
      );

      if (response.ok) {
        toast.success("Member role updated successfully");
        onTeamUpdate?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update member role");
      }
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Failed to update member role");
    }
  };

  // Leave Team
  const handleLeaveTeam = async () => {
    try {
      // Find current user's member ID
      const currentUserMember = team.members?.find(
        (member) =>
          (member.user?.id || member.userId) === team.currentUser?.id ||
          (member.user?.id || member.userId) === team.currentUser?.userId
      );

      if (!currentUserMember) {
        toast.error("Unable to find your membership in this team");
        return;
      }

      const response = await apiFetch(`/api/teams/${team.id}/members/${
          currentUserMember.id || currentUserMember._id
        }`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        toast.success("Left team successfully");
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to leave team");
      }
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Failed to leave team");
    }
  };

  // Delete Team
  const handleDeleteTeam = async () => {
    try {
      const response = await apiFetch(`/api/teams/${team.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Team deleted successfully");
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete team");
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Team Info */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted/50 rounded-md flex items-center justify-center">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium">Basic Information</h3>
        </div>

        <div className="space-y-6">
          {/* Team Avatar Section */}
          <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border/40">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={team?.avatar} />
                <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
                  {team?.name?.charAt(0)?.toUpperCase() || "T"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-base mb-1">Team Avatar</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Upload a team avatar to personalize your workspace
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    asChild
                    className="h-8"
                  >
                    <span className="gap-2">
                      <Upload className="h-3.5 w-3.5" />
                      {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                    </span>
                  </Button>
                </Label>
                <span className="text-xs text-muted-foreground">
                  Max 5MB, JPG/PNG only
                </span>
              </div>
            </div>
          </div>

          {/* Team Details Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-sm font-medium">
                  Team Name
                </Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="teamDescription"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Input
                  id="teamDescription"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleUpdateTeamInfo}
                disabled={isUpdatingTeam || !teamName.trim()}
                className="px-6 h-9"
              >
                {isUpdatingTeam ? "Updating..." : "Update Team Info"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {/* Member Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-muted/50 rounded-md flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">Member Management</h3>
          </div>

          <div className="space-y-2">
            {team?.members?.map((member, index) => (
              <div
                key={member.id || member.userId || index}
                className="flex items-center justify-between p-3 bg-background hover:bg-muted/30 border border-border/40 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {(member.user?.name || member.name)
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {member.user?.name || member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user?.email || member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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

                  {team?.isOwner && member.role !== "owner" && (
                    <Select
                      value={member.role}
                      onValueChange={(newRole) =>
                        handleChangeRole(member.id || member._id, newRole)
                      }
                    >
                      <SelectTrigger className="w-24 h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        {/* Danger Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-destructive/10 rounded-md flex items-center justify-center">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </div>
            <h3 className="text-sm font-medium text-destructive">
              Danger Zone
            </h3>
          </div>

          <div className="space-y-2">
            {!team?.isOwner && (
              <div className="flex items-center justify-between p-3 border border-orange-200/60 rounded-md bg-orange-50/50 dark:bg-orange-950/10 dark:border-orange-800/40">
                <div>
                  <p className="font-medium text-sm">Leave Team</p>
                  <p className="text-xs text-muted-foreground">
                    You will lose access to all team notes and folders
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-8">
                      <LogOut className="h-3.5 w-3.5" />
                      Leave Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Team</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave this team? You will lose
                        access to all team notes and folders. This action cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeaveTeam}
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Leave Team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {team?.isOwner && (
              <div className="flex items-center justify-between p-3 border border-destructive/60 rounded-md bg-destructive/5">
                <div>
                  <p className="font-medium text-sm">Delete Team</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete this team and all its data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2 h-8"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Team
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Team</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this team? This will
                        permanently delete all team notes, folders, and member
                        data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteTeam}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Team
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
