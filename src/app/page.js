"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Search,
  Link2,
  Zap,
  FileText,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Target,
  Shuffle,
  Play,
  Quote,
  FolderOpen,
  Share2,
  Shield,
  Edit3,
  Trash2,
  Eye,
  Menu,
  X
} from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode_toggle"

export default function NoteFlowLanding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated
  if (status === "authenticated") {
    return null;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 sm:h-9 sm:w-9 text-primary" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                NoteFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-all duration-200 font-medium relative group">
                Reviews
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <div className="flex items-center gap-4">
                <Button asChild variant="ghost" className="hover:bg-primary/10">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <ModeToggle />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex lg:hidden items-center gap-2">
              <ModeToggle />
              <Button asChild size="sm" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-xs px-3 py-2">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Links - Overlay */}
          {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-lg animate-in slide-in-from-top-2 duration-200 z-40">
              <div className="container mx-auto px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-6 sm:justify-center">
                  <Link 
                    href="#features" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium text-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    href="#how-it-works" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium text-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                  <Link 
                    href="#testimonials" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium text-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Reviews
                  </Link>
                  <Link 
                    href="/login" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium text-center py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30"></div>

        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-8 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors px-4 py-2 text-sm font-medium">
            ✨ Collaborative Note Taking Platform
          </Badge>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Notes That
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent relative">
              Flow Together
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-full"></div>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Modern collaborative note-taking with powerful features for personal management and 
            <span className="text-foreground font-medium"> real-time team collaboration</span>. 
            Organize, share, and work together seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Button
              size="lg"
              className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/signup">
                Start Collaborating Today
                <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-7 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
            >
              <Play className="mr-3 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Floating elements around the main image */}
            <div className="absolute -top-12 -left-16 bg-card border border-border rounded-xl p-4 shadow-xl rotate-[-8deg] hidden xl:block z-10">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Team Workspace</div>
                  <div className="text-xs text-muted-foreground">5 members active</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-8 -right-20 bg-card border border-border rounded-xl p-4 shadow-xl rotate-[12deg] hidden xl:block z-10">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Note Shared</div>
                  <div className="text-xs text-muted-foreground">Editor access</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 left-12 bg-card border border-border rounded-xl p-4 shadow-xl rotate-[-6deg] hidden xl:block z-10">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Advanced Search</div>
                  <div className="text-xs text-muted-foreground">with highlighting</div>
                </div>
              </div>
            </div>

            {/* Mobile floating elements - simpler and positioned differently */}
            <div className="absolute -top-4 left-4 bg-card border border-border rounded-lg p-2 shadow-lg rotate-[-3deg] block xl:hidden z-10">
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Team Active</span>
              </div>
            </div>

            <div className="absolute -top-2 right-4 bg-card border border-border rounded-lg p-2 shadow-lg rotate-[5deg] block xl:hidden z-10">
              <div className="flex items-center gap-2 text-xs">
                <Share2 className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Note Shared</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl shadow-2xl border border-border/50 p-4 md:p-6 backdrop-blur-sm relative">
              <div className="relative">
                <img
                  src="https://i.postimg.cc/GtdrH5wp/Screenshot-2025-07-19-110313-1.jpg"
                  alt="SmartNotes App Interface"
                  className="w-full h-auto rounded-xl shadow-lg max-h-[500px] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted border border-border mb-6">
              <span className="text-sm font-medium text-muted-foreground">The Problem</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Tired of Scattered
              <span className="text-foreground block">Note-Taking?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional note-taking tools lack collaboration and organization. We built NoteFlow to solve that once and for all.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-muted transition-colors">
                  <Shuffle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Scattered & Disorganized</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ideas spread across apps, notebooks, and sticky notes with no connection or structure
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-muted transition-colors">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Impossible to Find</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Spending more time searching for notes than actually using them productively
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-muted transition-colors">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Forgotten Insights</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Brilliant connections and ideas lost forever in the void of unstructured notes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Solution Section */}
          <div className="text-center mt-20 pt-16 border-t border-border/50">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              NoteFlow Changes Everything
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful features for <span className="font-semibold text-foreground">personal management and real-time team collaboration</span>. Organize, share, and work together seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-32 px-4 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-40 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8">
              Smart Features That
              <span className="text-primary block">Actually Work</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Every feature is designed to make your notes more intelligent, connected, and useful than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <Edit3 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Rich Text Editing</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Create and edit notes with full formatting support, powered by TipTap editor with real-time collaboration features.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Real-time editing</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary/20 rounded-full w-full"></div>
                    <div className="h-2 bg-primary/15 rounded-full w-3/4"></div>
                    <div className="h-2 bg-primary/10 rounded-full w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Advanced Search</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Search through notes by title, content, and tags with highlighting. Find exactly what you need instantly.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">&quot;project meeting&quot;</span>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Meeting Notes - Q4 Planning</span>
                      <span className="text-primary">Match</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Project Roadmap Draft</span>
                      <span className="text-primary">Match</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <FolderOpen className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Folder Organization</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Organize notes into custom folders with color coding and icons. Keep everything structured and easy to find.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="text-xs text-muted-foreground mb-2">My Folders</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-xs text-muted-foreground">Work Projects</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="text-xs text-muted-foreground">Personal Ideas</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-xs text-muted-foreground">Meeting Notes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <Share2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Note Sharing</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Share individual notes with specific users with viewer or editor permissions. Control access and collaborate seamlessly.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="flex items-center gap-2 text-sm text-primary mb-3">
                    <Share2 className="h-3 w-3" />
                    <span>Shared with 2 people</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>John Doe</span>
                      <span className="text-primary">Editor</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jane Smith</span>
                      <span className="text-muted-foreground">Viewer</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Context Awareness</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Notes surface at the right time based on your current work, location, and behavioral patterns.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Context: Meeting prep</span>
                    <span className="text-primary">Active</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-primary/30 rounded-full w-full"></div>
                    <div className="h-1.5 bg-primary/20 rounded-full w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/30 md:col-span-2 lg:col-span-1">
              <CardContent className="p-10">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-2xl w-20 h-20 flex items-center justify-center mb-8 transition-all duration-300">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Team Collaboration</h3>
                <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                  Share notes, collaborate in real-time, and build collective knowledge with your team seamlessly.
                </p>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border border-border/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="h-3 w-3 text-primary" />
                    <span>3 team members active</span>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-primary/20 rounded-full border-2 border-background"></div>
                    <div className="w-6 h-6 bg-primary/30 rounded-full border-2 border-background"></div>
                    <div className="w-6 h-6 bg-primary/40 rounded-full border-2 border-background"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Getting Started is Effortless</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your note-taking forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Create & Organize</h3>
              <p className="text-muted-foreground text-lg">
                Start writing with our rich text editor. Organize notes into folders with color coding and tags for easy management.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Share & Collaborate</h3>
              <p className="text-muted-foreground text-lg">
                Create team workspaces, share notes with specific permissions, and collaborate in real-time with your team members.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Discover Insights</h3>
              <p className="text-muted-foreground text-lg">
                Find connections you never noticed, rediscover forgotten ideas, and build on your knowledge
                effortlessly.
              </p>
            </div>
          </div>

          <div className="bg-background rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">Perfect for Every Use Case</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Students</h4>
                  <p className="text-muted-foreground text-sm">
                    Connect lecture notes, research, and assignments automatically
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Professionals</h4>
                  <p className="text-muted-foreground text-sm">
                    Organize meeting notes, project ideas, and strategic thinking
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">Creatives</h4>
                  <p className="text-muted-foreground text-sm">
                    Capture inspiration and see unexpected connections between ideas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Trusted by Teams and Individuals Worldwide
            </h2>
            <div className="flex justify-center items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-primary fill-current" />
              ))}
              <span className="ml-2 text-muted-foreground font-semibold">4.9/5 from 2,847 reviews</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  &quot;NoteFlow transformed how our team collaborates. Real-time editing and shared workspaces make project planning so much smoother. It&apos;s like having everyone in the same room!&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Martinez</p>
                    <p className="text-muted-foreground text-sm">Project Manager, Tech Startup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  &quot;I&apos;ve tried every note app out there. NoteFlow is the first one that actually makes team collaboration seamless. The real-time editing and permission system are game-changers.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">DK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">David Kim</p>
                    <p className="text-muted-foreground text-sm">Engineering Lead, Fortune 500</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  &quot;As a content creator, I need to organize research and collaborate with my team. NoteFlow's folder system and real-time collaboration features are exactly what we needed.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">ER</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Emma Rodriguez</p>
                    <p className="text-muted-foreground text-sm">Content Creator & Author</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-70">
              <span className="text-muted-foreground font-semibold">As featured in:</span>
              <div className="flex flex-wrap gap-4">
                <div className="bg-card px-4 py-2 rounded border border-border">TechCrunch</div>
                <div className="bg-card px-4 py-2 rounded border border-border">Product Hunt</div>
                <div className="bg-card px-4 py-2 rounded border border-border">Hacker News</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">Ready to Transform Your Team Collaboration?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams and individuals who&apos;ve revolutionized their note-taking with NoteFlow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
              asChild
            >
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6"
            >
              Schedule a Demo
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-primary-foreground/80">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">NoteFlow</span>
              </div>
              <p className="text-muted-foreground mb-4">Collaborative note-taking that flows with your team.</p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">𝕏</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">in</span>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">f</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Team Collaboration
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">© 2024 NoteFlow. All rights reserved. Built with Next.js and modern web technologies.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

