import ProjectsGrid from "@/components/sections/ProjectsGrid";
import { getProjects } from "@/app/actions/projects";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              All Projects
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our complete history of community service, environmental initiatives, and youth development programs.
            </p>
          </div>
          
          <ProjectsGrid projects={projects} />
        </div>
      </main>

      <Footer />
    </div>
  );
}