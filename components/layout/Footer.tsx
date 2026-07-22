import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Call02Icon,
  Location01Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";
import { navLinks, siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
              LT
            </span>
            <span className="text-base font-bold">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            {siteConfig.description}
          </p>
          <p className="mt-4 text-xs uppercase tracking-wide text-primary-foreground/60">
            Sponsored by {siteConfig.sponsoringLionsClub} &middot; District{" "}
            {siteConfig.district}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-secondary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary">
            Get in Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2.5">
              <HugeiconsIcon
                icon={Location01Icon}
                size={18}
                className="mt-0.5 shrink-0 text-secondary"
              />
              <span>
                {siteConfig.address.line1}, {siteConfig.address.line2}
                <br />
                {siteConfig.address.country}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={18}
                className="shrink-0 text-secondary"
              />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-secondary">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <HugeiconsIcon
                icon={Call02Icon}
                size={18}
                className="shrink-0 text-secondary"
              />
              <a href={`tel:${siteConfig.phone}`} className="hover:text-secondary">
                {siteConfig.phone}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground"
            >
              <HugeiconsIcon icon={Facebook01Icon} size={18} />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground"
            >
              <HugeiconsIcon icon={InstagramIcon} size={18} />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground"
            >
              <HugeiconsIcon icon={Linkedin01Icon} size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>A member club of Lions Clubs International.</p>
        </div>
      </div>
    </footer>
  );
}