import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ShinyButton } from "@/components/ui/shiny-button";
import { LiquidButton } from "@/components/ui/liquid-button";

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#F7F2E7] pt-24 pb-12">
      
      <div className="pointer-events-none absolute -left-[20vw] top-1/2 z-0 h-[calc(100dvh-8px)] w-[calc(100dvh-8px)] -translate-y-1/2 opacity-5 lg:-left-[10vw]">
        <Image
          src="/images/titan.svg" 
          alt="Titan Helmet Background Pattern"
          fill
          priority
          className="object-contain"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          
          <div className="max-w-3xl">
            <h1 className="text-[3.5rem] font-extrabold leading-[1.05] tracking-tight text-[#07120D] sm:text-6xl lg:text-[5rem] xl:text-[5.5rem]">
              <span className="block whitespace-nowrap">Purpose Through</span>
              <span className="block text-[#2F5D46]">Service</span>
            </h1>
            
            <p className="mt-8 text-xl leading-relaxed text-[#173D2A] sm:text-2xl">
              We are the <span className="font-bold">Leo Club of Pannipitiya Metro Titans</span>  
              <br className="mt-2 block" /> 
              A group of young people coming together to turn good ideas into meaningful action. Through service, leadership, teamwork and new experiences, we work to create an impact both within our community and beyond.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Link href="/join" className="w-full sm:w-auto">
                <ShinyButton className="h-16 w-full px-10 text-lg">
                  Join the Titans
                  <HugeiconsIcon icon={ArrowRight01Icon} size={24} className="ml-2" />
                </ShinyButton>
              </Link>
              
              <Link href="/projects" className="w-full sm:w-auto">
                <LiquidButton 
                  variant="outline" 
                  className="h-16 w-full rounded-full border-2 border-[#0F2A1D]/20 px-10 text-[1.125rem] font-bold text-[#0F2A1D]"
                >
                  See Our Impact
                </LiquidButton>
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-col gap-5">
            <div className="relative w-full overflow-hidden rounded-3xl bg-[#E8D8B8] aspect-[4/3] lg:aspect-[16/11]">
              <Image
                src="/images/hero-1.jpeg"
                alt="Leo Club community service project"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="relative w-full overflow-hidden rounded-2xl bg-[#C8A45D]/20 aspect-[4/3] lg:aspect-[16/9]">
                <Image
                  src="/images/hero-2.jpeg"
                  alt="Leo Club youth leadership"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="relative w-full overflow-hidden rounded-2xl bg-[#C8A45D]/20 aspect-[4/3] lg:aspect-[16/9]">
                <Image
                  src="/images/hero-3.jpeg"
                  alt="Leo Club environmental project"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}