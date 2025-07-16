"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Settings, Users } from "lucide-react";
import { TeamManagementDialog } from "@/components/team-management-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function TeamSwitcher({ teams: initialTeams }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [teams, setTeams] = React.useState(initialTeams || []);
  const [activeTeam, setActiveTeam] = React.useState(initialTeams?.[0]);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = React.useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Get personal workspace (always first)
  const personalWorkspace =
    initialTeams?.find((team) => team.isPersonal) || initialTeams?.[0];

  // Detect current team from URL and set active team
  React.useEffect(() => {
    if (!teams.length) return;

    // Check if we're on a team page
    const teamPageMatch = pathname.match(/\/dashboard\/teams\/([^\/]+)/);

    if (teamPageMatch) {
      const teamIdFromUrl = teamPageMatch[1];
      const teamFromUrl = teams.find((team) => team.id === teamIdFromUrl);

      if (teamFromUrl && teamFromUrl.id !== activeTeam?.id) {
        console.log("Setting active team from URL:", teamFromUrl.name);
        setActiveTeam(teamFromUrl);
      }
    } else if (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/notes")
    ) {
      // On main dashboard or notes pages, use personal workspace
      if (personalWorkspace && personalWorkspace.id !== activeTeam?.id) {
        console.log("Setting active team to personal workspace");
        setActiveTeam(personalWorkspace);
      }
    }
  }, [pathname, teams, activeTeam?.id, personalWorkspace]);

  // Fetch teams from API
  const fetchTeams = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teams");

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();

      // Merge personal workspace with API teams
      const apiTeams = data.teams || [];
      const allTeams = personalWorkspace
        ? [personalWorkspace, ...apiTeams]
        : apiTeams;
      setTeams(allTeams);

      // Set active team if none selected
      if (!activeTeam && allTeams.length > 0) {
        setActiveTeam(allTeams[0]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam, personalWorkspace]);

  // Load teams on mount
  React.useEffect(() => {
    // Always fetch teams to get latest data, but keep personal workspace
    fetchTeams();
  }, [fetchTeams]);

  // Listen for team events
  React.useEffect(() => {
    const handleTeamCreated = (event) => {
      const newTeam = event.detail;
      setTeams((prev) => {
        // Insert new team after personal workspace
        const personalIndex = prev.findIndex((team) => team.isPersonal);
        if (personalIndex >= 0) {
          return [
            ...prev.slice(0, personalIndex + 1),
            newTeam,
            ...prev.slice(personalIndex + 1),
          ];
        }
        return [newTeam, ...prev];
      });
      setActiveTeam(newTeam);
      toast.success("Team created successfully!");
    };

    const handleTeamUpdated = (event) => {
      const updatedTeam = event.detail;
      setTeams((prev) =>
        prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
      );
      if (activeTeam?.id === updatedTeam.id) {
        setActiveTeam(updatedTeam);
      }
    };

    const handleTeamMemberAdded = () => {
      // Refresh teams to get updated member counts
      fetchTeams();
    };

    window.addEventListener("teamCreated", handleTeamCreated);
    window.addEventListener("teamUpdated", handleTeamUpdated);
    window.addEventListener("teamMemberAdded", handleTeamMemberAdded);

    return () => {
      window.removeEventListener("teamCreated", handleTeamCreated);
      window.removeEventListener("teamUpdated", handleTeamUpdated);
      window.removeEventListener("teamMemberAdded", handleTeamMemberAdded);
    };
  }, [activeTeam, fetchTeams]);

  const handleCreateTeam = () => {
    setIsCreatingTeam(true);
    setSelectedTeam(null);
    setIsTeamDialogOpen(true);
  };

  const handleTeamSwitch = (team) => {
    setActiveTeam(team);

    // Navigate to team dashboard if it's not personal workspace
    if (!team.isPersonal && team.id) {
      router.push(`/dashboard/teams/${team.id}`);
    } else {
      // Navigate back to main dashboard for personal workspace
      router.push("/dashboard");
    }
  };

  const handleManageTeam = (team) => {
    // Don't allow managing personal workspace
    if (team.isPersonal) {
      toast.info("Personal workspace settings are managed in your profile");
      return;
    }

    setIsCreatingTeam(false);
    setSelectedTeam(team);
    setIsTeamDialogOpen(true);
  };

  if (!activeTeam) {
    return null;
  }

  return (
    <>
      <TeamManagementDialog
        open={isTeamDialogOpen}
        onOpenChange={setIsTeamDialogOpen}
        team={selectedTeam}
        isCreating={isCreatingTeam}
      />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden group-data-[collapsible=icon]:size-10">
                  {activeTeam.avatar ? (
                    <img
                      src={activeTeam.avatar}
                      alt={activeTeam.name}
                      className="w-full h-full object-cover"
                    />
                  ) : activeTeam.logo ? (
                    <activeTeam.logo className="size-4 group-data-[collapsible=icon]:size-6" />
                  ) : (
                    <Users className="size-4 group-data-[collapsible=icon]:size-6" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">
                    {activeTeam.name}
                  </span>
                  <span className="truncate text-xs">
                    {activeTeam.plan ||
                      (activeTeam.isOwner
                        ? "Owner"
                        : activeTeam.userRole || "Member")}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Teams
              </DropdownMenuLabel>
              {teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => handleTeamSwitch(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border overflow-hidden">
                    {team.avatar ? (
                      <img
                        src={team.avatar}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : team.logo ? (
                      <team.logo className="size-3.5 shrink-0" />
                    ) : (
                      <Users className="size-3.5 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">{team.name}</div>
                  <div className="flex items-center gap-1">
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleManageTeam(team);
                      }}
                      className="p-1 hover:bg-accent rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="h-3 w-3" />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCreateTeam}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Add team
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
