"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Mail,
  Crown,
  Edit3,
  Eye,
  UserPlus,
  Copy,
  Check,
  Globe,
  Lock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function ShareNoteDialog({ open, onOpenChange, note }) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock collaborators data
  const collaborators = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "editor",
      avatar: "/avatars/user2.jpg",
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "viewer",
      avatar: "/avatars/user3.jpg",
      status: "active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "viewer",
      avatar: "/avatars/user4.jpg",
      status: "pending",
    },
  ];

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      // TODO: Replace with actual API call
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const handleCopyShareLink = async () => {
    const shareLink = `${window.location.origin}/shared/${note?.id || 'note-id'}`;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Share link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      // TODO: Replace with actual API call
      toast.success("Collaborator removed");
    } catch (error) {
      toast.error("Failed to remove collaborator");
    }
  };

  const handleRoleChange = async (collaboratorId, newRole) => {
    try {
      // TODO: Replace with actual API call
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share "{note?.title || 'Note'}"
          </DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this note or make it publicly accessible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Access */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Public Access</h4>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view this note
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            
            {isPublic && (
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/shared/${note?.id || 'note-id'}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyShareLink}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            )}
          </div>

          {/* Invite People */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Invite People</h4>
            
            <div className="flex gap-2">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInviteUser} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </div>
          </div>

          {/* Current Collaborators */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              People with access ({collaborators.length + 1})
            </h4>
            
            <div className="space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user1.jpg" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">Shree Jaybhay (You)</div>
                    <div className="text-xs text-muted-foreground">shreejaybhay26@gmail.com</div>
                  </div>
                </div>
                
                <Badge variant="default" className="gap-1">
                  <Crown className="h-3 w-3" />
                  Owner
                </Badge>
              </div>

              {/* Collaborators */}
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{collaborator.name}</div>
                      <div className="text-xs text-muted-foreground">{collaborator.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={collaborator.role}
                      onValueChange={(newRole) => handleRoleChange(collaborator.id, newRole)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {collaborator.status === "pending" && (
                      <Badge variant="outline" className="text-orange-600">
                        Pending
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
