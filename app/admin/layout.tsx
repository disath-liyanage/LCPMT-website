import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button"; 
import { LayoutDashboard, Mail, LogOut, Home, Users, } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-border">
          <div className="font-bold tracking-tight text-xl">Admin Control</div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
          <Link 
            href="/admin" 
            className={buttonVariants({ variant: "ghost", className: "justify-start" })}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Project Dashboard
          </Link>
          
          <Link 
            href="/admin/email" 
            className={buttonVariants({ variant: "ghost", className: "justify-start" })}
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Sender
          </Link>

           <Link 
            href="/admin/members" 
            className={buttonVariants({ variant: "ghost", className: "justify-start" })}
          >
            <Users className="mr-2 h-4 w-4" />
            Members & Approvals
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