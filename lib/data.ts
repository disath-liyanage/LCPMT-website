export type ProjectCategory =
  | "Community Service"
  | "Environment"
  | "Health"
  | "Youth Development"
  | "Fundraising";

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  date: string;
  location: string;
  image: string;
  summary: string;
  status: "upcoming" | "completed";
}

export const projects: Project[] = [
  {
    slug: "beach-cleanup-mount-lavinia",
    title: "Coastal Clean-Up Drive",
    category: "Environment",
    date: "March 2026",
    location: "Mount Lavinia Beach",
    image: "/images/placeholders/project-1.jpg",
    summary:
      "Members and volunteers collected waste along the coastline and ran a short awareness session on marine plastic pollution for beachgoers.",
    status: "completed",
  },
  {
    slug: "blood-donation-camp",
    title: "Blood Donation Camp",
    category: "Health",
    date: "January 2026",
    location: "Pannipitiya Community Hall",
    image: "/images/placeholders/project-2.jpg",
    summary:
      "Organised in partnership with the National Blood Transfusion Service, the camp brought in donors from across the area to support the local blood bank.",
    status: "completed",
  },
  {
    slug: "school-supplies-drive",
    title: "Back-to-School Supplies Drive",
    category: "Community Service",
    date: "December 2025",
    location: "Pannipitiya area schools",
    image: "/images/placeholders/project-3.jpg",
    summary:
      "Stationery packs and books were distributed to children from low-income families ahead of the new school term.",
    status: "completed",
  },
  {
    slug: "tree-planting-homagama",
    title: "Community Tree Planting",
    category: "Environment",
    date: "August 2026",
    location: "Homagama",
    image: "/images/placeholders/project-4.jpg",
    summary:
      "A reforestation project planting native saplings in partnership with the local Divisional Secretariat.",
    status: "upcoming",
  },
  {
    slug: "leadership-workshop",
    title: "Youth Leadership Workshop",
    category: "Youth Development",
    date: "September 2026",
    location: "Pannipitiya",
    image: "/images/placeholders/project-5.jpg",
    summary:
      "A one-day workshop for school leavers covering public speaking, teamwork and project planning, run by senior Leos and Lions mentors.",
    status: "upcoming",
  },
  {
    slug: "charity-walk",
    title: "Charity Walk for Elders' Homes",
    category: "Fundraising",
    date: "October 2026",
    location: "Pannipitiya - Kottawa route",
    image: "/images/placeholders/project-6.jpg",
    summary:
      "A sponsored community walk to raise funds for elders' homes in the district.",
    status: "upcoming",
  },
];

export interface BoardMember {
  name: string;
  role: string;
  image: string;
}

export const boardMembers: BoardMember[] = [
  { name: "TODO: Full Name", role: "President", image: "/images/placeholders/board-1.jpg" },
  { name: "TODO: Full Name", role: "Vice President", image: "/images/placeholders/board-2.jpg" },
  { name: "TODO: Full Name", role: "Secretary", image: "/images/placeholders/board-3.jpg" },
  { name: "TODO: Full Name", role: "Treasurer", image: "/images/placeholders/board-4.jpg" },
  { name: "TODO: Full Name", role: "Project Chairperson", image: "/images/placeholders/board-5.jpg" },
  { name: "TODO: Full Name", role: "Membership Chairperson", image: "/images/placeholders/board-6.jpg" },
];

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