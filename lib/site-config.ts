export const siteConfig = {
  name: "Leo Club of Pannipitiya Metro Titans",
  shortName: "LCP Metro Titans",
  domain: "https://titanleos.org",
  tagline: "Leadership. Experience. Opportunity.",
  description:
    "The Leo Club of Pannipitiya Metro Titans is a youth-led community service organisation in Pannipitiya, Sri Lanka, sponsored by Lions Clubs International. We run community, environment, health and youth-development projects across the area.",
  foundingYear: 2023,
  district: "306 A2",
  sponsoringLionsClub: "Lions Club of Pannipitiya",
  email: "info@titanleos.org",
  phone: "+94 77 000 0000",
  whatsapp: "+94770000000",

  social: {
    facebook: "https://www.facebook.com/titanleos.sl",
    instagram: "https://www.instagram.com/titan_leos",
    whatsappChannel: "https://whatsapp.com/channel/0029VbD91YFDJ6Gw22rDTW0j",
    linkedin: "https://www.linkedin.com/in/titanleos/",
  },
} as const;

export const navLinks = [
  { href: "/#hero", label: "Home" },
  { href: "/#projects", label: "Projects" },
  { href: "/gallery", label: "Gallery" },
  { href: "/join", label: "Join Us" },
  { href: "/#contact", label: "Contact" },
] as const;