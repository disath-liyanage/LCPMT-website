import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowUpRight01Icon,
  ArrowRight01Icon,
  Facebook01Icon, 
  InstagramIcon, 
  TiktokIcon, 
  YoutubeIcon, 
  Linkedin01Icon 
} from "@hugeicons/core-free-icons";
import { siteConfig } from "@/lib/site-config";
import {
  ACHIEVEMENTS,
  CLUB,
  HISTORY_INTRO,
  LEO_MEANING,
  MILESTONES,
  filled,
} from "@/lib/about-data";
import JourneyTimeline from "@/components/sections/JourneyTimeline";
import LeoScrollCards from "@/components/sections/LeoScrollCards";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who we are, what Leo stands for, our mission and vision, our journey and the recognition we have earned.",
};

const wrap = "mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8";
const h2 = "text-3xl font-bold leading-tight tracking-tight text-[#16241B] sm:text-4xl lg:text-5xl";
const tile = "relative overflow-hidden rounded-3xl bg-[#16241B]/5";

export default function AboutPage() {
  const facts = CLUB.facts.filter((f) => filled(f.value));
  const milestones = MILESTONES.filter((m) => filled(m.year));
  const achievements = ACHIEVEMENTS.filter((a) => filled(a.title));

  const numFact = facts.find((f) => f.label.toLowerCase().includes("number"));
  const foundFact = facts.find((f) => f.label.toLowerCase().includes("founded"));
  const otherFacts = facts.filter(
    (f) =>
      !f.label.toLowerCase().includes("number") &&
      !f.label.toLowerCase().includes("founded")
  );

  return (
    <main className="flex-1 bg-[#FBFBF8] text-[#16241B]">
      <section className="pb-16 pt-16 lg:pb-24 lg:pt-20">
        <div className={wrap}>
          <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h1 className="text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
                Our club
              </h1>
              {filled(CLUB.overview) && (
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5F6F65] sm:text-xl">
                  {CLUB.overview}
                </p>
              )}
            </div>
            <div className="grid h-[24rem] grid-cols-5 grid-rows-2 gap-4 sm:h-[30rem] lg:col-span-6">
              <div className={`${tile} col-span-3 row-span-2 group`}>
                <Image
                  src="/images/about/group.jpeg"
                  alt="Our club in action"
                  fill
                  priority
                  sizes="(min-width: 1024px) 28vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className={`${tile} col-span-2 group`}>
                <Image
                  src="/images/about/small1.jpeg"
                  alt="Club logo"
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className={`${tile} col-span-2 group`}>
                <Image
                  src="/images/about/small2.jpeg"
                  alt="Club community"
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {facts.length > 0 && (
            <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-[0.8fr_2fr_2fr] lg:mt-20">
              <div className="flex flex-col gap-5">
                {[numFact, foundFact].map((fact) => {
                  if (!fact) return null;
                  return (
                    <div
                      key={fact.label}
                      className="group relative flex flex-1 flex-col justify-center overflow-hidden rounded-3xl border border-[#16241B]/10 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2F6B4A]/40 hover:shadow-xl hover:shadow-[#2F6B4A]/10"
                    >
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2F6B4A] to-[#2F6B4A]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <dt className="text-[0.7rem] font-bold uppercase tracking-wider text-[#5F6F65] transition-colors group-hover:text-[#2F6B4A] sm:text-xs">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-xl font-black leading-tight tracking-tight text-[#16241B]">
                        {fact.value}
                      </dd>
                    </div>
                  );
                })}
              </div>

              {otherFacts.map((f) => (
                <div
                  key={f.label}
                  className="group relative flex flex-col justify-center overflow-hidden rounded-3xl border border-[#16241B]/10 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#2F6B4A]/40 hover:shadow-xl hover:shadow-[#2F6B4A]/10"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2F6B4A] to-[#2F6B4A]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <dt className="text-sm font-bold uppercase tracking-wider text-[#5F6F65] transition-colors group-hover:text-[#2F6B4A] sm:text-base">
                    {f.label}
                  </dt>
                  <dd className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#16241B] sm:text-3xl">
                    {f.value}
                  </dd>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-20`}>
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <h2 className={h2}>What Leo stands for</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5F6F65]">
              Every Leo carries three ideas into everything the club does:
              leading, learning by doing and making the most of each chance to
              serve.
            </p>
          </div>

          <LeoScrollCards cards={LEO_MEANING} />
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className={wrap}>
          <h2 className={`${h2} max-w-3xl`}>Why we exist</h2>

          {(filled(CLUB.mission) || filled(CLUB.vision)) && (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {filled(CLUB.mission) && (
                <article className="group rounded-3xl border border-[#16241B]/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2F6B4A]/5 lg:p-12">
                  <span aria-hidden className="block h-1.5 w-12 rounded-full bg-[#2F6B4A] transition-all duration-300 group-hover:w-20" />
                  <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                    Our mission
                  </h3>
                  <p className="mt-4 text-lg font-medium leading-relaxed text-[#16241B]/80 sm:text-xl">
                    {CLUB.mission}
                  </p>
                </article>
              )}
              {filled(CLUB.vision) && (
                <article className="group rounded-3xl border border-[#16241B]/5 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2F6B4A]/5 lg:p-12">
                  <span aria-hidden className="block h-1.5 w-12 rounded-full bg-[#2F6B4A] transition-all duration-300 group-hover:w-20" />
                  <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
                    Our vision
                  </h3>
                  <p className="mt-4 text-lg font-medium leading-relaxed text-[#16241B]/80 sm:text-xl">
                    {CLUB.vision}
                  </p>
                </article>
              )}
            </div>
          )}

          <div className="group relative mt-12 overflow-hidden rounded-[2.5rem] bg-[#E8F0EB] border border-[#2F6B4A]/10 px-8 py-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2F6B4A]/20 hover:shadow-xl hover:shadow-[#2F6B4A]/10 sm:px-10 lg:px-16 lg:py-10">
            <div className="absolute left-0 top-0 h-full w-2 bg-[#2F6B4A] transition-all duration-300 group-hover:w-3 group-hover:bg-[#25573C]" />
            <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h3 className="text-sm font-bold tracking-widest text-[#2F6B4A] uppercase transition-colors duration-300 group-hover:text-[#25573C]">
                  Our year theme
                </h3>
                <p className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#16241B] sm:text-4xl lg:text-5xl">
                  {CLUB.theme.title}
                </p>
                {filled(CLUB.theme.description) && (
                  <p className="mt-4 text-lg font-medium leading-relaxed text-[#3A4A40]">
                    {CLUB.theme.description}
                  </p>
                )}
              </div>
              <div className="relative h-40 w-40 shrink-0 self-center transition-transform duration-700 group-hover:scale-110 md:h-56 md:w-56 lg:h-64 lg:w-64">
                <Image
                  src="/images/logo-bk.png"
                  alt="Year Theme Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className={wrap}>
          <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
            <h3 className="relative mb-4 pb-4 text-sm font-bold uppercase tracking-widest text-[#2F6B4A]">
              What we are part of
              <span className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 bg-[#2F6B4A]"></span>
            </h3>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#16241B] sm:text-4xl">
              One question, asked in Chicago in 1917
            </h2>
            <p className="mt-6 px-6 text-lg font-medium leading-relaxed text-[#3A4A40] sm:px-12">
              Melvin Jones asked a business club what it would be if it looked beyond its own
              members. The association that answered became Lions Clubs International. The Leo
              programme grew out of it in 1957.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl grid gap-6 md:grid-cols-2 text-center">
            <a
              href="https://www.leomd306.org/about-us/history/lions"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex aspect-square flex-col items-center justify-between rounded-[2.5rem] bg-gradient-to-b from-[#0D4495] to-[#082F6A] p-10 transition-all duration-300 sm:p-12 md:p-16"
            >
              <div>
                <h3 className="text-3xl font-bold text-white sm:text-4xl">Lions International</h3>
                <p className="mt-4 text-base text-white/80">
                  Since 1917. The largest service organization in the world.
                </p>
              </div>
              <div className="relative my-auto h-36 w-36 transition-transform duration-500 group-hover:scale-110 sm:h-40 sm:w-40 md:h-48 md:w-48">
                <Image
                  src="/images/lion-logo.png"
                  alt="Lions International Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/40 bg-transparent px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 group-hover:bg-white group-hover:text-[#082F6A]">
                Read the history <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </div>
            </a>

            <a
              href="https://www.leomd306.org/about-us/history/leos"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex aspect-square flex-col items-center justify-between rounded-[2.5rem] bg-gradient-to-b from-[#F2F2F2] to-[#E8E8E8] p-10 transition-all duration-300 sm:p-12 md:p-16"
            >
              <div>
                <h3 className="text-3xl font-bold text-[#111827] sm:text-4xl">Leo</h3>
                <p className="mt-4 text-base text-[#4B5563]">
                  Leadership. Experience. Opportunity. Since 1957.
                </p>
              </div>
              <div className="relative my-auto h-36 w-36 transition-transform duration-500 group-hover:scale-110 sm:h-40 sm:w-40 md:h-48 md:w-48">
                <Image
                  src="/images/leo-logo.png"
                  alt="Leo Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#111827]/10 bg-transparent px-6 py-2.5 text-sm font-bold text-[#111827] transition-all duration-300 group-hover:border-[#16241B] group-hover:bg-[#16241B] group-hover:text-white">
                Read the story <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </div>
            </a>
          </div>
        </div>
      </section>

      {milestones.length > 0 && (
        <section id="journey" className="scroll-mt-32 bg-white py-20 lg:py-28">
          <div className={wrap}>
            <JourneyTimeline 
              title="The journey of our club"
              intro={HISTORY_INTRO || undefined}
              milestones={milestones} 
            />
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className={wrap}>
            <h2 className={`${h2} max-w-3xl`}>Achievements and recognition</h2>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-4 lg:grid-cols-6 auto-rows-fr">
              {achievements.map((a, i) => {
                const isDesktopCenter = achievements.length === 5 && i === 3;
                const isTabletCenter = achievements.length === 5 && i === 4;

                return (
                  <article
                    key={`${a.year}-${a.title}`}
                    className={`group flex flex-col overflow-hidden rounded-3xl border border-[#16241B]/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2F6B4A]/20 hover:shadow-xl hover:shadow-[#2F6B4A]/5 col-span-1 sm:col-span-2 lg:col-span-2 ${
                      isDesktopCenter ? "lg:col-start-2" : ""
                    } ${
                      isTabletCenter ? "sm:col-start-2 lg:col-start-auto" : ""
                    }`}
                  >
                    <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden bg-[#16241B]/5">
                      {a.image && (
                        <Image
                          src={a.image}
                          alt={`${a.title} photograph`}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-8">
                      {filled(a.year) && (
                        <span className="mb-4 inline-block w-fit rounded-full bg-[#2F6B4A]/10 px-3 py-1 text-xs font-bold text-[#2F6B4A]">
                          {a.year}
                        </span>
                      )}
                      <h3 className="text-xl font-bold leading-snug tracking-tight text-[#16241B]">
                        {a.title}
                      </h3>
                      {filled(a.detail) && (
                        <p className="mt-3 text-base leading-relaxed text-[#5F6F65]">
                          {a.detail}
                        </p>
                      )}
                      <div className="mt-auto pt-6">
                        {filled(a.organisation) && (
                          <p className="text-xs font-bold uppercase tracking-wider text-[#16241B]/50">
                            {a.organisation}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-[90rem] overflow-hidden rounded-[3rem] border border-[#2F6B4A]/10 bg-white p-10 shadow-xl shadow-[#16241B]/[0.02] sm:p-16 lg:p-20">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            
            <div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-[#16241B] sm:text-5xl">
                Ready to make an impact?
              </h2>
              <p className="mt-6 max-w-md text-xl leading-relaxed text-[#5F6F65]">
                New faces are always welcome. Whether you want to join our ranks or collaborate on a cause, let's get started.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/join"
                className="group flex items-center justify-between rounded-3xl bg-[#2F6B4A] p-6 text-white transition-colors hover:bg-[#25573C] sm:p-8"
              >
                <div>
                  <span className="block text-2xl font-bold tracking-tight">Become a member</span>
                  <span className="mt-1 block text-white/80 text-sm sm:text-base">Join the club and start serving.</span>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} />
                </div>
              </Link>

              <a
                href={`mailto:${siteConfig.email}?subject=Partnering with the club`}
                className="group flex items-center justify-between rounded-3xl border-2 border-[#16241B]/5 bg-[#FBFBF8] p-6 transition-colors hover:border-[#2F6B4A]/20 hover:bg-[#E8F0EB] sm:p-8"
              >
                <div>
                  <span className="block text-2xl font-bold tracking-tight text-[#16241B]">Partner with us</span>
                  <span className="mt-1 block text-[#5F6F65] text-sm sm:text-base">Bring an idea or community in need.</span>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#16241B]/5 text-[#16241B] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#2F6B4A] group-hover:text-white">
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={24} />
                </div>
              </a>
            </div>
          </div>

          <div className="mt-16 border-t border-[#16241B]/10 pt-10 sm:mt-20 sm:flex sm:items-center sm:justify-between">
            <p className="text-lg font-bold text-[#16241B]/60">Follow our work online</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-0">
              {[
                { icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: Facebook01Icon, href: siteConfig.social.facebook, label: "Facebook" },
                { icon: TiktokIcon, href: siteConfig.social.tiktok, label: "TikTok" }, 
                { icon: YoutubeIcon, href: siteConfig.social.youtube, label: "YouTube" },
                { icon: Linkedin01Icon, href: siteConfig.social.linkedin, label: "LinkedIn" },
              ].map((social) => (
                social.href && (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid h-12 w-12 place-items-center rounded-full bg-[#16241B]/5 text-[#16241B]/70 transition-all hover:scale-110 hover:bg-[#2F6B4A] hover:text-white"
                  >
                    <HugeiconsIcon icon={social.icon} size={22} />
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}