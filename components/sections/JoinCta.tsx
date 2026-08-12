import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function JoinCta() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 py-32 sm:px-6 lg:px-8 overflow-hidden" id="join">
      <div className="flex flex-col items-center text-center gap-8">
        
        <div className="space-y-6 max-w-3xl">
          <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-[#1C2B1E] leading-[1.05]">
            Stop watching. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D3F2B] to-[#556B52]">
              Start impacting.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-base sm:text-lg text-[#556B52] leading-relaxed font-medium">
            We need doers aged 18-30 from Pannipitiya and beyond. Zero experience required - just the guts to step up and serve your community.
          </p>
        </div>

        <div className="pt-4 w-full sm:w-auto">
          <Link href="/join" className="block w-full sm:w-auto">

            <ShinyButton className="group h-14 w-full px-8 text-base sm:text-lg">
              Join the Titans
              <HugeiconsIcon 
                icon={ArrowRight01Icon} 
                size={22} 
                className="ml-2 transition-transform duration-300 group-hover:translate-x-1.5" 
              />
            </ShinyButton>
          </Link>
        </div>

      </div>
    </section>
  );
}