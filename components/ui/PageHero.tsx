import Image from "next/image";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85">
          {description}
        </p>
      </div>
    </section>
  );
}
