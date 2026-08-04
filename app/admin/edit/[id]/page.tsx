import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminEditForm from "./AdminEditForm"; 

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (error || !project) {
    redirect("/admin/projects");
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      <AdminEditForm project={project} />
    </div>
  );
}