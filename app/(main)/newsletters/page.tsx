import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewsletterFilters from '@/components/sections/NewsletterFilters'

export default async function NewslettersPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  let query = supabase.from('newsletters').select('*').order('created_at', { ascending: false })

  if (resolvedSearchParams?.year) {
    query = query.eq('year', parseInt(resolvedSearchParams.year))
  }
  if (resolvedSearchParams?.month) {
    query = query.eq('month', parseInt(resolvedSearchParams.month))
  }

  const { data: newsletters, error } = await query

  if (error) {
    console.error(error)
    return <div className="pt-32 text-center text-destructive">Error loading newsletters.</div>
  }

  const { data: allNewsletters } = await supabase.from('newsletters').select('year, month')
  const years = Array.from(new Set(allNewsletters?.map(n => n.year) || [])).sort((a, b) => b - a)

  const latest = newsletters?.[0]
  const rest = newsletters?.slice(1) ?? []

  return (
    <div className="min-h-screen bg-[#FBF7ED]">
      <div className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <img
          src="/images/newsletter/banner.png"
          alt="Newsletter Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F2A1D]/90 via-[#0F2A1D]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A1D]/50 to-transparent sm:hidden"></div>

        <div className="relative max-w-7xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-6 text-[#FBF7ED] drop-shadow-lg">
            The Panorama
          </h1>
          <p className="max-w-2xl text-[#FBF7ED]/95 text-base md:text-lg leading-relaxed drop-shadow-md font-medium">
            Stories of creativity, leadership, and service - projects driven by passion, teamwork,
            and a shared mission to create lasting change in our community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {latest && (
          <div className="mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-6">
              Latest Issue
            </p>
            <Link
              href={`/newsletters/${latest.id}`}
              className="group grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center"
            >
              <div className="aspect-[3/4] relative overflow-hidden border-2 border-[#0F2A1D]/10 shadow-sm group-hover:border-[#0F2A1D]/30 transition-colors">
                <img
                  src={latest.cover_image_url}
                  alt={`Cover for ${latest.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[#2F5D46] font-bold text-sm uppercase tracking-wider mb-3">
                  {new Date(0, latest.month - 1).toLocaleString('default', { month: 'long' })} {latest.year}
                </p>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0F2A1D] leading-tight mb-4 group-hover:underline decoration-[#C9A24B] decoration-2 underline-offset-4">
                  {latest.name}
                </h2>
                <span className="inline-flex items-center gap-2 text-[#0F2A1D] font-semibold text-sm">
                  Read the issue
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          </div>
        )}

        <div className="mb-24 border-y border-[#0F2A1D]/10 py-16 md:py-20 text-center px-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-12">
            Meet our Editorial Team
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 md:gap-x-16 gap-y-14">
            {[
              { name: "Leo Sinadi Sithumya", role: "Secretary", img: "/images/team/sinadi.png" },
              { name: "Leo F. R. Jamaldeen", role: "Bulletin Editor", img: "/images/team/rashida.png" },
              { name: "Leo Thulya Hasindi", role: "Asst. Secretary", img: "/images/team/thulya.png" },
              { name: "Leo Chesmi Maleena", role: "Digital Transformation", img: "/images/team/chesmi.png" }
            ].map((person, i) => (
              <div key={i} className="flex flex-col items-center w-44 sm:w-48 md:w-52">
                <div className="w-full aspect-square rounded-full overflow-hidden mb-6 shadow-sm border border-[#0F2A1D]/5">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 hover:scale-105 transition-all duration-500"
                  />
                </div>
                <p className="font-serif font-bold text-[#0F2A1D] text-lg leading-tight text-center px-2">
                  {person.name}
                </p>
                <p className="text-[#2F5D46] text-xs font-bold uppercase tracking-wider mt-2.5 text-center">
                  {person.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2F5D46] mb-2">
              Archive
            </p>
            <h2 className="font-serif text-3xl font-bold text-[#0F2A1D]">Past Issues</h2>
          </div>

          <NewsletterFilters
            years={years}
            currentYear={resolvedSearchParams?.year}
            currentMonth={resolvedSearchParams?.month}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
          {rest.map((newsletter) => (
            <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id} className="group flex flex-col gap-3">
              <div className="aspect-[3/4] relative overflow-hidden border border-[#0F2A1D]/10 group-hover:border-[#C9A24B] transition-colors duration-200 shadow-sm">
                <img
                  src={newsletter.cover_image_url}
                  alt={`Cover for ${newsletter.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1 text-center">
                <h3 className="font-serif font-bold text-[#0F2A1D] leading-tight group-hover:underline decoration-[#C9A24B] underline-offset-4">
                  {newsletter.name}
                </h3>
                <p className="text-[#2F5D46] text-xs font-bold uppercase tracking-wider mt-1">
                  {new Date(0, newsletter.month - 1).toLocaleString('default', { month: 'long' })} {newsletter.year}
                </p>
              </div>
            </Link>
          ))}

          {rest.length === 0 && !latest && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#0F2A1D]/20 rounded-2xl bg-white/30">
              <p className="text-xl font-serif font-bold text-[#0F2A1D]">No newsletters found.</p>
              <p className="text-[#2F5D46]/70 mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}