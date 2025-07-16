"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect } from "react";
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
} from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode_toggle"

export default function SmartNotesLanding() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SmartNotes</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-foreground hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6">AI-Powered Note Taking</Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your Notes, But
            <span className="text-primary block">Actually Smart</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop losing brilliant ideas in messy notes. SmartNotes uses AI to automatically organize, connect, and
            surface your thoughts exactly when you need them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/signup">
                Start Taking Smart Notes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
              <img
                src="https://i.postimg.cc/Pfc3nhXT/original-aa5bad4f3605f2720069c817bdbb2f5f.webp"
                alt="SmartNotes App Interface"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Tired of Note-Taking Chaos?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Traditional notes are where good ideas go to die. We built SmartNotes to solve that.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-destructive/20">
              <CardContent className="p-8 text-center">
                <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shuffle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Scattered & Disorganized</h3>
                <p className="text-muted-foreground">Ideas spread across apps, notebooks, and sticky notes with no connection</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="p-8 text-center">
                <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Impossible to Find</h3>
                <p className="text-muted-foreground">Spending more time searching for notes than actually using them</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="p-8 text-center">
                <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Forgotten Insights</h3>
                <p className="text-muted-foreground">Brilliant connections and ideas lost in the void of unstructured notes</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
              <ArrowRight className="h-8 w-8 text-primary-foreground transform rotate-90" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">SmartNotes Changes Everything</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI automatically organizes, connects, and surfaces your notes so you can focus on thinking, not
              searching.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Smart Features That Actually Work</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed to make your notes more intelligent and useful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Link2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">AI-Powered Linking</h3>
                <p className="text-muted-foreground mb-4">
                  Automatically discovers connections between your notes, creating a web of knowledge that grows smarter
                  over time.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <img src="/placeholder.svg?height=120&width=200" alt="AI Linking Demo" className="w-full rounded" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Intelligent Search</h3>
                <p className="text-muted-foreground mb-4">
                  Find notes by meaning, not just keywords. Search for concepts and get relevant results even if you
                  used different words.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <img src="/placeholder.svg?height=120&width=200" alt="Smart Search Demo" className="w-full rounded" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Auto-Summarization</h3>
                <p className="text-muted-foreground mb-4">
                  Long notes automatically get smart summaries. Capture everything, but review only what matters.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <img src="/placeholder.svg?height=120&width=200" alt="Auto Summary Demo" className="w-full rounded" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Smart Suggestions</h3>
                <p className="text-muted-foreground mb-4">
                  Get contextual suggestions for related notes, relevant resources, and potential connections as you
                  write.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <img
                    src="/placeholder.svg?height=120&width=200"
                    alt="Smart Suggestions Demo"
                    className="w-full rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Context Awareness</h3>
                <p className="text-muted-foreground mb-4">
                  Notes surface at the right time based on your current work, location, and patterns.
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <img src="/placeholder.svg?height=120&width=200" alt="Context Demo" className="w-full rounded" />
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
              <h3 className="text-2xl font-semibold text-foreground mb-4">Write Naturally</h3>
              <p className="text-muted-foreground text-lg">
                Just start writing. No special formatting or structure required. SmartNotes understands your natural
                writing style.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">AI Does the Work</h3>
              <p className="text-muted-foreground text-lg">
                Our AI automatically organizes, tags, and connects your notes in the background while you focus on your
                ideas.
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
              Loved by Thousands of Smart Note-Takers
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
                  &quot;SmartNotes completely changed how I study. It automatically connects my chemistry notes with biology
                  concepts I learned weeks ago. It&apos;s like having a personal tutor!&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sarah Martinez</p>
                    <p className="text-muted-foreground text-sm">Pre-Med Student, Stanford</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  &quot;I&apos;ve tried every note app out there. SmartNotes is the first one that actually makes my notes more
                  valuable over time. The AI connections are genuinely helpful, not gimmicky.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">DK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">David Kim</p>
                    <p className="text-muted-foreground text-sm">Product Manager, Tech Startup</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground mb-6 italic">
                  &quot;As a writer, I capture ideas everywhere. SmartNotes helps me see patterns in my thinking and
                  rediscover forgotten gems. It&apos;s like having a conversation with my past self.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold">ER</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Emma Rodriguez</p>
                    <p className="text-muted-foreground text-sm">Freelance Writer & Author</p>
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
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">Ready to Make Your Notes Actually Smart?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students, professionals, and creatives who&apos;ve transformed their thinking with SmartNotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
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
                <span className="text-2xl font-bold text-foreground">SmartNotes</span>
              </div>
              <p className="text-muted-foreground mb-4">Making your notes smarter, one connection at a time.</p>
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
                    Integrations
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
            <p className="text-muted-foreground">© 2024 SmartNotes. All rights reserved. Made with ☕ and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}








