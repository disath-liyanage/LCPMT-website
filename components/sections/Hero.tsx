import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { impactStats } from "@/lib/data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <Image
          src="/images/placeholders/hero-home.jpg"
          alt="Leo Club of Pannipitiya Metro Titans members at a community service project"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
          Leo Club of Pannipitiya Metro Titans
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
          Where there&apos;s a need, there&apos;s a Leo.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
          We are a youth-led community service club in Pannipitiya, Sri
          Lanka, sponsored by Lions Clubs International. We run projects in
          community welfare, environment, health and youth leadership -
          built and led entirely by young volunteers.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            render={
              <Link href="/join">
                Become a Leo
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            render={<Link href="/projects">See Our Projects</Link>}
          />
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-4">
          {impactStats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-2xl font-bold text-secondary sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-primary-foreground/70 sm:text-sm">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}