"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { SearchDialog } from "@/components/search-dialog";
import { Separator } from "@/components/ui/separator";
import { Home, ChevronRight } from "lucide-react";
import { NotesProvider, useNotes } from "@/contexts/NotesContext";
import { ModeToggle } from "@/components/mode_toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

function DashboardContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setRefreshNotes } = useNotes();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ];

    if (pathSegments.length > 1) {
      // Add section breadcrumb (notes, shared, etc.)
      const section = pathSegments[1];
      const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
      breadcrumbs.push({
        label: sectionLabel,
        href: `/dashboard/${section}`
      });

      // Add specific page breadcrumb if exists
      if (pathSegments.length > 2) {
        const page = pathSegments[2];
        if (page === "starred") {
          breadcrumbs.push({ label: "Starred", href: null });
        } else if (page === "trash") {
          breadcrumbs.push({ label: "Trash", href: null });
        } else if (page !== "page.jsx") {
          // For note IDs or other specific pages
          breadcrumbs.push({ label: "Note", href: null });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar
        onSearchClick={handleSearchClick}
        onRefreshNotes={setRefreshNotes}
      />
      <SidebarInset className="flex-1 h-screen flex flex-col">
        {/* Header - Consistent across all dashboard routes */}
        <header className="flex-shrink-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4" />

              {/* Dynamic Breadcrumb Navigation */}
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && (
                        <BreadcrumbSeparator>
                          <ChevronRight className="h-4 w-4" />
                        </BreadcrumbSeparator>
                      )}
                      <BreadcrumbItem>
                        {crumb.href ? (
                          <BreadcrumbLink
                            href={crumb.href}
                            className="flex items-center gap-1"
                          >
                            {crumb.icon && <crumb.icon className="h-4 w-4" />}
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="font-medium max-w-[200px] truncate">
                            {crumb.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right side - Theme Toggle */}
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Page Content - Takes remaining height */}
        <div className="flex-1 overflow-hidden dashboard-content">{children}</div>
      </SidebarInset>
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <NotesProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotesProvider>
  );
}
