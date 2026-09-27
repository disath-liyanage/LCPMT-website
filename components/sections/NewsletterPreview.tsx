import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { HugeiconsIcon } from "@hugeicons/react";
import { OriginButton } from "@/components/ui/origin-button"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

export default async function NewsletterPreview() {
  const supabase = await createClient()

  const { data: newsletters, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !newsletters || newsletters.length === 0) {
    return null
  }

  return (
    <section id="newsletters" className="py-16 bg-[#FBF7ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-2">
            The Panorama
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0F2A1D] mb-4">
            Latest Newsletters
          </h2>
          <p className="max-w-2xl text-[#2F5D46]/80 text-sm sm:text-base">
            Read about our latest projects, stories of creativity, leadership, and service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {newsletters.map((newsletter) => (
            <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id} className="group flex flex-col gap-4">
              <div className="relative">
                <div className="aspect-[3/4] relative overflow-hidden border border-[#0F2A1D]/10 group-hover:border-[#C9A24B] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                  <img
                    src={newsletter.cover_image_url}
                    alt={`Cover for ${newsletter.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-serif text-xl font-bold text-[#0F2A1D] leading-tight group-hover:underline decoration-[#C9A24B] underline-offset-4">
                  {newsletter.name}
                </h3>
                <p className="text-[#2F5D46] text-xs font-bold uppercase tracking-wider mb-1">
                  {new Date(0, newsletter.month - 1).toLocaleString('default', { month: 'long' })} {newsletter.year}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/newsletters">
            <OriginButton className="group flex items-center gap-2">
              <span>View All Issues</span>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </OriginButton>
          </Link>
        </div>
      </div>
    </section>
  )
}