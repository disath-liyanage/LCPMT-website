import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import AdminEditForm from "./AdminEditForm"; 

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project, error } = await supabase.from("projects").select("*").eq("id", resolvedParams.id).single();
  if (error || !project) redirect("/admin/projects");

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border hover:bg-accent transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>
      <AdminEditForm project={project} />
    </div>
  );
}