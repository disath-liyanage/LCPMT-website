import { getProjects } from "@/app/actions/projects";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GalleryGrid from "@/components/sections/GalleryGrid";

export const metadata = {
  title: "Gallery",
  description: "Explore photos from all our projects and initiatives.",
};

export default async function GalleryPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow pt-36 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Project Gallery
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              A visual history of our work. Filter by project to see specific highlights.
            </p>
          </div>
          
          <GalleryGrid projects={projects} />
        </div>
      </main>

      <Footer />
    </div>
  );
}