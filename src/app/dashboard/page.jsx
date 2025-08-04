"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useNotes } from "@/contexts/NotesContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  FileText,
  Search,
  Star,
  BookOpen,
  Tag,
  Brain,
  Plus,
} from "lucide-react";

export default function DashboardHomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { triggerRefresh } = useNotes();

  const [noteTitle, setNoteTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Get user's first name for personalized greeting
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;

    setIsCreating(true);
    try {
      const response = await apiFetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note");
      }

      const data = await response.json();
      const createdNote = data.note;

      toast.success("Note created successfully!");
      setNoteTitle("");
      triggerRefresh();
      router.push(`/dashboard/notes/${createdNote._id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error(error.message || "Failed to create note. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreateNote();
    }
  };

  const quickActions = [
    {
      label: "All Notes",
      icon: FileText,
      action: () => router.push("/dashboard/notes"),
    },
    {
      label: "Starred",
      icon: Star,
      action: () => router.push("/dashboard/notes/starred"),
    },
    {
      label: "Search",
      icon: Search,
      action: () => {
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
        );
      },
    },
    {
      label: "Templates",
      icon: BookOpen,
      action: () => {
        toast.info("Templates coming soon!");
      },
    },
    {
      label: "Tags",
      icon: Tag,
      action: () => {
        toast.info("Tags feature coming soon!");
      },
    },
  ];

  return (
    <div className="min-h-full flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl space-y-8 sm:space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                SmartNotes
              </h1>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-foreground">
                {getGreeting()}, {firstName}! 👋
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                What would you like to create today?
              </p>
            </div>
          </div>

          {/* Note Creation Section */}
          <div className="space-y-6 sm:space-y-8">
            <div className="relative">
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a title for your note..."
                className="w-full h-12 sm:h-14 text-base sm:text-lg pr-12 sm:pr-14 bg-background border-2 border-border focus:border-primary transition-colors duration-200 rounded-xl"
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateNote}
                disabled={!noteTitle.trim() || isCreating}
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isCreating ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>

            {/* Quick Create Button for Mobile */}
            <div className="sm:hidden">
              <Button
                onClick={() => {
                  setNoteTitle("Untitled Note");
                  setTimeout(() => handleCreateNote(), 100);
                }}
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={isCreating}
              >
                <Plus className="h-5 w-5 mr-2" />
                Quick Create Note
              </Button>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-center text-muted-foreground">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="group flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-200">
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing for Mobile */}
      <div className="h-4 sm:h-8"></div>
    </div>
  );
}
