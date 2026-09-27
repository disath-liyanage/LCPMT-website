import Hero from "@/components/sections/Hero";
import AboutPreview from "@/components/sections/About";
import ProjectsPreview from "@/components/sections/Projects";
import NewsletterPreview from "@/components/sections/NewsletterPreview";
import JoinCta from "@/components/sections/JoinCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <ProjectsPreview />
      <NewsletterPreview />
      <JoinCta />
    </>
  );
}