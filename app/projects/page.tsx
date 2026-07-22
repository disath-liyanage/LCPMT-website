import ProjectsGrid from "@/components/sections/ProjectsGrid";
import { getProjects } from "@/app/actions/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <h1 className="text-center text-4xl font-bold mt-12">All Projects</h1>
      <ProjectsGrid projects={projects} />
    </div>
  );
}