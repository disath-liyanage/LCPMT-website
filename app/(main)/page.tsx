import Hero from "@/components/sections/Hero";
import AboutPreview from "@/components/sections/About";
import LeadershipPage from "@/components/sections/leadership";
import ProjectsPreview from "@/components/sections/Projects";
import NewsletterPreview from "@/components/sections/NewsletterPreview";
import JoinCta from "@/components/sections/JoinCta";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <LeadershipPage />
      <ProjectsPreview />
      <NewsletterPreview />
      <Contact />
      <JoinCta />
    </>
  );
}