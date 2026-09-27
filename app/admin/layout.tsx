"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button"; 
import { LayoutDashboard, Mail, LogOut, Home, Users, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <div className="font-bold tracking-tight text-xl">Admin Control</div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          <Link 
            href="/admin" 
            className={cn(buttonVariants({ variant: pathname === "/admin" ? "default" : "ghost", className: "justify-start" }))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Project Dashboard
          </Link>
          
          <Link 
            href="/admin/email" 
            className={cn(buttonVariants({ variant: pathname.startsWith("/admin/email") ? "default" : "ghost", className: "justify-start" }))}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Sender
          </Link>

           <Link 
            href="/admin/members" 
            className={cn(buttonVariants({ variant: pathname.startsWith("/admin/members") ? "default" : "ghost", className: "justify-start" }))}
          >
            <Users className="mr-2 h-4 w-4" />
            Members & Approvals
          </Link>

          <Link 
            href="/admin/newsletters" 
            className={cn(buttonVariants({ variant: pathname.startsWith("/admin/newsletters") ? "default" : "ghost", className: "justify-start" }))}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Newsletters
          </Link>
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link 
            href="/" 
            className={buttonVariants({ variant: "outline", className: "justify-start w-full" })}
          >
            <Home className="mr-2 h-4 w-4" />
            Main Site
          </Link>

          <form action="/auth/signout" method="post" className="w-full">
            <Button variant="destructive" type="submit" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export function GlassFilter() {
  return (
    <svg className="hidden pointer-events-none absolute">
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}