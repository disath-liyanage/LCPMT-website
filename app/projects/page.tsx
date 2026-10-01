import ProjectsGrid from "@/components/sections/ProjectsGrid";
import { getProjects } from "@/app/actions/projects";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBF8]">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[300px] bg-[#2F6B4A]/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-5">
              Explore Our <span className="text-[#2F6B4A]">Projects</span>
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 font-medium leading-relaxed">
              Discover our complete history of community service, environmental initiatives, and youth development programs driving real change.
            </p>
          </div>
          
          <ProjectsGrid projects={projects} />
        </div>
      </main>

      <Footer />
    </div>
  );
}