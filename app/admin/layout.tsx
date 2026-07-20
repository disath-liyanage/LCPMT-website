import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="font-bold tracking-tight">Admin Control Panel</div>
        <nav className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Back to Main Site</Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button variant="outline" type="submit">Sign Out</Button>
          </form>
        </nav>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}