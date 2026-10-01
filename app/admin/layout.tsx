"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, LogOut, Home, Users, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? null);
    };
    fetchUser();
  }, []);

  const isProjectsActive = 
    pathname === "/admin" || 
    pathname === "/admin/" || 
    pathname?.startsWith("/admin/projects") ||
    pathname?.startsWith("/admin/create") || 
    pathname?.startsWith("/admin/edit");

  const getNavClasses = (isActive: boolean) => 
    isActive 
      ? "bg-[#2F6B4A] text-white hover:bg-[#3A8B5E] shadow-sm" 
      : "text-muted-foreground hover:bg-[#2F6B4A]/10 hover:text-[#2F6B4A]";

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-background overflow-hidden font-sans">
      <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        
        <div className="w-full h-24 border-b border-border/50 flex items-center justify-center p-3 flex-shrink-0">
          <img 
            src="/images/email.svg" 
            alt="Titan Leos Banner" 
            className="w-full h-full object-contain object-center" 
          />
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-1 px-2 uppercase tracking-wider">
            Menu
          </div>
          
          <Link 
            href="/admin/projects" 
            className={cn("flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-200", getNavClasses(isProjectsActive))}
          >
            <LayoutDashboard className="h-5 w-5" />
            Project Dashboard
          </Link>
          
          <Link 
            href="/admin/email" 
            className={cn("flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-200", getNavClasses(pathname?.startsWith("/admin/email")))}
          >
            <Mail className="h-5 w-5" />
            Email Sender
          </Link>

           <Link 
            href="/admin/members" 
            className={cn("flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-200", getNavClasses(pathname?.startsWith("/admin/members")))}
          >
            <Users className="h-5 w-5" />
            Members & Approvals
          </Link>

          <Link 
            href="/admin/newsletters" 
            className={cn("flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors duration-200", getNavClasses(pathname?.startsWith("/admin/newsletters")))}
          >
            <BookOpen className="h-5 w-5" />
            Newsletters
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-border/50">
          <div className="flex items-center gap-2 bg-[#2F6B4A]/5 p-1.5 rounded-full border border-[#2F6B4A]/10">
            
            <Link 
              href="/" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-[#2F6B4A]/10 hover:text-[#2F6B4A] transition-all duration-200"
              title="Open Main Site in New Tab"
            >
              <Home className="h-5 w-5" />
            </Link>
            
            <div className="h-6 w-px bg-[#2F6B4A]/20 mx-0.5"></div>
            
            <div className="relative flex-1">
              {isProfileOpen && (
                <div className="absolute bottom-full right-0 mb-4 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg animate-in slide-in-from-bottom-2 fade-in-20 z-50 origin-bottom-right">
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium text-foreground truncate mt-0.5">
                      {email || "Loading..."}
                    </p>
                  </div>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </div>
              )}
              
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-10 w-full items-center justify-between rounded-full bg-transparent pl-3 pr-1.5 hover:bg-[#2F6B4A]/10 transition-colors border border-transparent shadow-sm outline-none focus:ring-2 focus:ring-[#2F6B4A]/30"
                title="User Account"
              >
                <span className="text-xs font-semibold text-muted-foreground truncate mr-2">
                  {email ? email.split('@')[0] : 'Admin'}
                </span>
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2F6B4A] text-white text-xs font-bold shadow-sm">
                  {email ? email.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                </div>
              </button>
            </div>
            
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background">
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