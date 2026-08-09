"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Call02Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
} from "@hugeicons/core-free-icons";
import { navLinks, siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#234D38] text-[#F7F2E7]">
      
      <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-12 px-4 pt-16 pb-8 sm:px-6 md:grid-cols-12 lg:gap-8 lg:px-8">
        
        <div className="md:col-span-12 lg:col-span-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="Leo Club Logo"
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-full object-cover shadow-lg"
            />
            <span className="text-xl font-extrabold leading-tight tracking-tight text-[#F7F2E7]">
              Leo Club of <br /> Pannipitiya Metro Titans
            </span>
          </div>
          
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#F7F2E7]/80">
            {siteConfig.description}
          </p>
          
          <div className="mt-8 flex w-full justify-center lg:justify-start lg:pl-2">
            <div className="flex w-fit items-center gap-4 rounded-2xl border border-[#173D2A] bg-[#0F2A1D] p-4 shadow-sm">
              <Image 
                src="/images/lion-logo.png" 
                alt="Lions Club International Logo" 
                width={48} 
                height={48} 
                className="h-12 w-12 shrink-0 object-contain"
              />
              <div className="flex flex-col justify-center text-left">
                <span className="text-xs uppercase tracking-wider text-[#F7F2E7]/60">
                  Sponsored by the Lions Club of
                </span>
                <span className="text-sm font-bold text-[#C8A45D]">
                  Pannipitiya Metro
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:col-span-4 lg:col-span-2 lg:pt-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#F7F2E7]">
            Quick Links
          </h3>
          <ul className="mt-6 flex flex-col items-center space-y-3 text-sm font-medium text-[#F7F2E7]/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-[#C8A45D]">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center md:col-span-4 lg:col-span-3 lg:pt-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#F7F2E7]">
            Connect
          </h3>
          <ul className="mt-6 flex flex-col items-center space-y-4 text-sm font-medium text-[#F7F2E7]/80">
            <li>
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-3 transition-colors hover:text-[#C8A45D]">
                <HugeiconsIcon icon={Mail01Icon} size={20} className="shrink-0 text-[#C8A45D]" />
                {siteConfig.email}
              </a>
            </li>
            <li>
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 transition-colors hover:text-[#C8A45D]">
                <HugeiconsIcon icon={Call02Icon} size={20} className="shrink-0 text-[#C8A45D]" />
                {siteConfig.phone}
              </a>
            </li>
          </ul>
          
          <div className="mt-8 flex items-center gap-6">
            <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-[#F7F2E7]/80 transition-all hover:-translate-y-1 hover:text-[#C8A45D]">
              <HugeiconsIcon icon={Facebook01Icon} size={24} />
            </a>
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-[#F7F2E7]/80 transition-all hover:-translate-y-1 hover:text-[#C8A45D]">
              <HugeiconsIcon icon={InstagramIcon} size={24} />
            </a>
            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#F7F2E7]/80 transition-all hover:-translate-y-1 hover:text-[#C8A45D]">
              <HugeiconsIcon icon={Linkedin01Icon} size={24} />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center text-center md:col-span-4 lg:col-span-3 lg:pt-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#F7F2E7]">
            Stay Updated
          </h3>
          <p className="mt-6 max-w-[250px] text-sm leading-relaxed text-[#F7F2E7]/80">
            Subscribe to our newsletter to receive the latest project updates and club news.
          </p>
          <form className="mt-6 flex w-full max-w-[280px] flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full rounded-full border border-[#173D2A] bg-[#0F2A1D] px-5 py-3 text-sm text-[#F7F2E7] placeholder:text-[#F7F2E7]/50 focus:border-[#C8A45D] focus:outline-none focus:ring-1 focus:ring-[#C8A45D]"
            />
            <button
              type="submit"
              className="w-full rounded-full border-2 border-[#C8A45D] bg-transparent px-5 py-3 text-sm font-bold text-[#C8A45D] transition-all hover:bg-[#C8A45D] hover:text-[#0F2A1D] active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[#F7F2E7]/15">
        <div className="mx-auto flex max-w-[90rem] items-center justify-center px-4 py-6 text-center text-sm font-medium text-[#F7F2E7]/60 sm:px-6 lg:px-8">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved. &nbsp;&middot;&nbsp; Developed by{" "}
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