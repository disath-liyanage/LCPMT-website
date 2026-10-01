const PREVIEW = process.env.NODE_ENV === "development";

export const filled = (value?: string | null): value is string =>
  PREVIEW ? !!value : !!value && !value.trim().startsWith("[");

export type Photo = { src?: string; alt: string };

export const ABOUT_IMAGES: Photo[] = [
  { alt: "Members of the club at a service project" },
  { alt: "Club members working together" },
  { alt: "A club event" },
];

export const CLUB = {
  overview:
    "The Leo Club of Pannipitiya Metro Titans brings young people together to serve our communities, develop as leaders and build lasting friendships. Sponsored by the Lions Club of Pannipitiya Metro, we are part of the Leo movement, where young people turn ideas into meaningful action. Through community projects and collaboration, we work to make a difference in the lives of the people we serve.",
  facts: [
    { label: "Club number", value: "98023" },
    { label: "Founded", value: "17 November 2006 " },
    { label: "District", value: "Leo District 306 D7, Sri Lanka" },
    { label: "Sponsored by", value: "Lions Club of Pannipitiya Metro" },
  ],
  mission: "To plan and carry out meaningful service projects, create opportunities for young people to lead, and strengthen our community through teamwork and fellowship.",
  vision: "A community where young people lead with compassion, take action with purpose, and inspire others to serve.",
  theme: {
    title: "Purpose Through Service",
    description: "For the 2026/27 Leoistic year, Purpose Through Service is a reminder to begin with a clear reason for every project. We want to listen to the people we serve, understand what they need, and shape our work around what will be useful to them.",
  },
};

export const HISTORY_INTRO = "The Leo Club of Pannipitiya Metro Titans was founded in 2006 and reactivated in 2019. Since then, generations of Titans have carried the club forward through service, friendship and leadership.";

export type Milestone = {
  year: string;
  title: string;
  description?: string;
};

export const MILESTONES: Milestone[] = [
  {
    year: "2006",
    title: "Club founded",
    description: "The Leo Club of Pannipitiya Metro Titans was founded on 17 November 2006, beginning its journey as a youth service club sponsored by the Lions Club of Pannipitiya Metro.",
  },
  {
    year: "2019",
    title: "Club reactivated",
    description: "The club was reactivated in 2019, opening a new chapter for young people to serve their communities and grow as leaders.",
  },
  {
    year: "2026",
    title: "A new chapter of service",
    description: "At ARCHE\’26, the club installed its 2026/27 leadership team and introduced the year theme, Purpose Through Service, setting a direction for meaningful projects and stronger fellowship.",
  },
];

export type Achievement = {
  year: string;
  title: string;
  detail: string;
  organisation: string;
  image?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    year: "2025/26",
    title: "Best Project for Peace, Religious and Cultural Activities",
    detail: "Winner - Leo Ekka Avurudu",
    organisation: "Leo District 306 D7 - INVICTUS District Conference",
    image:"/images/achievements/leo-ekk-awurudu.jpg",
  },
  {
    year: "2025/26",
    title: "Best Project for Health and Wellbeing",
    detail: "Winner - LeproSafe",
    organisation: "Leo District 306 D7 - INVICTUS District Conference",
    image:"/images/achievements/leprosafe.jpg",
  },
  {
    year: "2025/26",
    title: "Best Fundraising Project",
    detail: "1st Runner-Up - Saruwath Corner",
    organisation: "Leo District 306 D7 - INVICTUS District Conference",
    image:"/images/achievements/saruwath-corner.jpg",
  },
  {
    year: "2025/26",
    title: "Best Project for Helping Differently Abled Communities",
    detail: "2nd Runner-Up - Hadawathe Avurudu",
    organisation: "Leo District 306 D7 - INVICTUS District Conference",
    image:"/images/achievements/hadawathe-awurudu.jpg",
  },
  {
    year: "2025/26",
    title: "Most Outstanding Club Secretary",
    detail: "2nd Runner-Up - Leo Lion Shanelka Dissanayake",
    organisation: "Leo District 306 D7 - INVICTUS District Conference",
    image:"/images/achievements/secretary.jpg",
  },
];

export const LEO_MEANING = [
  {
    letter: "L",
    word: "Leadership",
    text: "Learning to guide a team, own a project and lead by example.",
  },
  {
    letter: "E",
    word: "Experience",
    text: "Hands-on service that builds skills no classroom can teach.",
  },
  {
    letter: "O",
    word: "Opportunity",
    text: "A platform to serve, connect and grow with people who care.",
  },
];