import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

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
            We need doers aged 12-30 from Pannipitiya and beyond. Zero experience required - just the guts to step up and serve your community.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/join"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-[#2D3F2B] px-8 py-4 text-sm sm:text-base font-bold text-[#F5F0E8] transition-all duration-300 hover:bg-[#1C2B1E] hover:scale-105 hover:shadow-[0_8px_30px_rgba(45,63,43,0.3)] active:scale-95"
          >
            <span>Join the Club</span>
            <HugeiconsIcon 
              icon={ArrowRight01Icon} 
              size={20} 
              className="transition-transform duration-300 group-hover:translate-x-1.5" 
            />
          </Link>
        </div>

      </div>
    </section>
  );
}