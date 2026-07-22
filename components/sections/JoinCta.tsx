import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export default function JoinCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" id="join">
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-secondary px-6 py-12 sm:px-12 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-secondary-foreground sm:text-3xl">
            Ready to make an impact?
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary-foreground/80 sm:text-base">
            We welcome young people aged 12-30 from Pannipitiya and beyond.
            No experience needed - just a willingness to serve.
          </p>
        </div>
        <Button
          size="lg"
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          render={
            <Link href="/join">
              Join the Club
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </Link>
          }
        />
      </div>
    </section>
  );
}
