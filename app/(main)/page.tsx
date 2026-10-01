import Hero from "@/components/sections/Hero";
import AboutPreview from "@/components/sections/About";
import LeadershipPage from "@/components/sections/leadership";
import ProjectsPreview from "@/components/sections/Projects";
import NewsletterPreview from "@/components/sections/NewsletterPreview";
import Contact from "@/components/sections/Contact";
import PhotoSlider from "@/components/sections/PhotoSlider";
import JoinCta from "@/components/sections/JoinCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <LeadershipPage />
      <ProjectsPreview />
      <NewsletterPreview />
      <PhotoSlider />
      <Contact />
      <JoinCta />
    </>
  );
}