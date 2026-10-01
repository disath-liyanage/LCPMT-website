import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { ABOUT_IMAGES, LEO_MEANING } from "@/lib/about-data";

export default function AboutPreview() {
  const [photoA] = ABOUT_IMAGES;

  return (
    <section id="about" className="scroll-mt-16 bg-[#FBFBF8] py-16 lg:py-24">
      <div className="mx-auto grid max-w-[90rem] items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:gap-20 lg:px-8">
        
        <div className="relative pb-10 lg:col-span-6">
          <div className="group relative aspect-[4/5] w-[80%] overflow-hidden rounded-[2.5rem] bg-[#16241B]/5">
            <Image
              src="/images/about/small1.jpeg"
              alt="Our club in action"
              fill
              sizes="(min-width: 1024px) 32vw, 80vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="group absolute bottom-0 right-0 aspect-square w-[55%] overflow-hidden rounded-[2.5rem] border-8 border-[#FBFBF8] bg-[#16241B]/5 shadow-2xl shadow-[#16241B]/10">
              <Image
                src="/images/about/about-large.jpeg"
                alt={photoA.alt || "Club highlight"}
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
          </div>
        </div>

        <div className="lg:col-span-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-[#16241B] sm:text-5xl lg:text-6xl">
            Young people serving their community.
          </h2>

         <p className="mt-6 max-w-xl text-xl font-semibold leading-relaxed text-[#07120D] sm:text-xl">
            The Leo Club of Pannipitiya Metro Titans is a youth service
            organization under Leo District 306 D7, bringing together young
            people with a shared passion for service, leadership and fellowship.
            Since our founding in 2006, we have kept growing while staying
            committed to making a positive and lasting difference.
          </p>

          <ul className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-[#16241B]/10 overflow-hidden rounded-3xl border border-[#16241B]/10 bg-white shadow-sm">
            {LEO_MEANING.map(({ letter, word }) => (
              <li key={letter} className="group px-3 py-6 text-center transition-colors hover:bg-[#FBFBF8] sm:px-4">
                <span className="block text-4xl font-black leading-none tracking-tight text-[#2F6B4A] transition-transform duration-300 group-hover:scale-110">
                  {letter}
                </span>
                <span className="mt-3 block text-sm font-bold uppercase tracking-wider text-[#16241B]/60">
                  {word}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full bg-[#2F6B4A] px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-[#25573C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFBF8]"
            >
              Learn more about us
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={20}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/about#journey"
              className="text-sm font-bold text-[#16241B] underline decoration-[#2F6B4A] decoration-2 underline-offset-8 transition-colors hover:text-[#2F6B4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16241B]"
            >
              See our journey
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}