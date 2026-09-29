"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail02Icon,
  Call02Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  ArrowUpRight01Icon,
  TiktokIcon,
  YoutubeIcon
} from "@hugeicons/core-free-icons";
import { footLinks, siteConfig } from "@/lib/site-config";

const socials = [
  { label: "Instagram", href: siteConfig.social.instagram, icon: InstagramIcon },
  { label: "Facebook", href: siteConfig.social.facebook, icon: Facebook01Icon },
  { label: "TikTok", href: siteConfig.social.tiktok, icon: TiktokIcon },
  { label: "YouTube", href: siteConfig.social.youtube, icon: YoutubeIcon },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: Linkedin01Icon },
];

type Status = "idle" | "loading" | "success" | "error";

const heading =
  "text-sm font-bold uppercase tracking-widest text-[#F7F2E7]";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-[#234D38] text-[#F7F2E7]">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.svg"
                alt="Leo Club Logo"
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
              <span className="text-xl font-extrabold leading-tight tracking-tight">
                Leo Club of <br /> Pannipitiya Metro Titans
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#F7F2E7]/75">
              {siteConfig.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[#F7F2E7]/15 bg-[#F7F2E7]/5 text-[#F7F2E7] transition-all duration-200 hover:-translate-y-1 hover:border-[#C8A45D] hover:bg-[#C8A45D] hover:text-[#0F2A1D] hover:shadow-lg hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D]"
                >
                  <HugeiconsIcon icon={icon} size={20} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h3 className={heading}>Quick Links</h3>
            <ul className="mt-6 space-y-3 text-sm font-medium text-[#F7F2E7]/75">
              {footLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-flex items-center gap-1 pb-0.5 transition-all duration-200 hover:translate-x-1 hover:text-[#C8A45D] focus-visible:text-[#C8A45D] focus-visible:outline-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#C8A45D] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                  >
                    {link.label}
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={14}
                      className="-translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className={heading}>Connect</h3>
            <ul className="mt-6 space-y-4 text-sm font-medium text-[#F7F2E7]/75">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-3 transition-colors hover:text-[#C8A45D] focus-visible:text-[#C8A45D] focus-visible:outline-none"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F7F2E7]/10 text-[#C8A45D] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#C8A45D] group-hover:text-[#0F2A1D]">
                    <HugeiconsIcon icon={Mail02Icon} size={20} />
                  </span>
                  <span className="min-w-0 break-all">{siteConfig.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="group flex items-center gap-3 transition-colors hover:text-[#C8A45D] focus-visible:text-[#C8A45D] focus-visible:outline-none"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F7F2E7]/10 text-[#C8A45D] transition-all duration-200 group-hover:scale-105 group-hover:bg-[#C8A45D] group-hover:text-[#0F2A1D]">
                    <HugeiconsIcon icon={Call02Icon} size={20} />
                  </span>
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <h3 className={heading}>Stay Updated</h3>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-[#F7F2E7]/75">
              Project updates and club news, straight to your inbox.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-5 flex max-w-sm items-center rounded-full border border-[#173D2A] bg-[#0F2A1D] p-1.5 transition-colors focus-within:border-[#C8A45D]"
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-[#F7F2E7] placeholder:text-[#F7F2E7]/45 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-[#C8A45D] px-5 py-2 text-sm font-bold text-[#0F2A1D] transition-all duration-200 hover:bg-[#F7F2E7] active:scale-95 disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Subscribe"}
              </button>
            </form>
            <p role="status" aria-live="polite" className="mt-3 min-h-5 pl-2 text-sm">
              {status === "success" && (
                <span className="text-[#C8A45D]">You're subscribed. Thanks!</span>
              )}
              {status === "error" && (
                <span className="text-red-300">Something went wrong. Try again.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#F7F2E7]/15 py-6 text-sm text-[#F7F2E7]/65 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/lion-logo.png"
              alt="Lions Club International Logo"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <span>
              Sponsored by the{" "}
              <span className="font-semibold text-[#C8A45D]">
                Lions Club of Pannipitiya Metro
              </span>
            </span>
          </div>
          <p>
            &copy; {year} {siteConfig.name} &bull; Developed by{" "}
            <a
              href="https://disath.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold transition-colors hover:text-[#F7F2E7] hover:underline hover:underline-offset-4"
            >
              Disath Liyanage
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}