export type ProjectCategory =
  | "Community Service"
  | "International Service"
  | "Digital Transformation"
  | "Public Relations"
  | "Sports & Recreation"
  | "Membership Development"
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
  collaborators?: { name: string; link: string }[];
  location_type?: "Online" | "Onsite" | "Multiple";
  collaborative_club?: string | null;
  collaborative_club_link?: string | null;
  status?: "upcoming" | "completed";
  summary?: string; 
  featured_on_main?: boolean;
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