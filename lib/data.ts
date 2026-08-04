export type ProjectCategory =
  | "Community Service"
  | "Environment"
  | "Health"
  | "Youth Development"
  | "Fundraising"
  | string;

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  date: string;
  location: string;
  description: string;
  images: string[];
  main_image: string | null;
  collaborative_club?: string | null;
  collaborative_club_link?: string | null;
  status?: "upcoming" | "completed";
  summary?: string;
}

export const impactStats = [
  { label: "Active Members", value: "30+" },
  { label: "Projects Completed", value: "20+" },
  { label: "Volunteer Hours", value: "1,000+" },
  { label: "Years of Service", value: "3+" },
];

export const galleryImages = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/placeholders/gallery-${i + 1}.jpg`,
  alt: `Leo Club of Pannipitiya Metro Titans - gallery photo placeholder ${i + 1}`,
}));