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
  
  return (
    <>
      <style>{`
        @keyframes animatedgradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-border {
          animation: animatedgradient 3s ease alternate infinite;
        }
        .mask-hollow-border {
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 sm:px-6 lg:px-8">

        <div className="relative w-full aspect-[21/9] md:aspect-[4/1] rounded-3xl overflow-hidden mb-16 shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2560&auto=format&fit=crop" 
            alt="The Panorama Newsletter Banner" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 font-serif drop-shadow-md">
              The Panorama Newsletter
            </h1>
            <p className="max-w-3xl text-sm md:text-lg text-white/90 font-medium leading-relaxed drop-shadow">
              Explore stories of creativity, leadership, and service - projects driven by passion, teamwork, and a shared mission to create lasting change in our community.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">Meet Our Editorial Team</h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
            {[
              { name: "Sarah Jenkins", role: "Chief Editor", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
              { name: "David Chen", role: "Co-Editor", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop" },
              { name: "Maya Patel", role: "Design Lead", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" }
            ].map((person, i) => (
              <div 
                key={i} 
                className="group relative rounded-full hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-xl cursor-default"
              >
                <div 
                  className="absolute -inset-[2px] p-[2px] rounded-full bg-[length:300%_300%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-border mask-hollow-border pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(60deg, #0F2A1D, #2F5D46, #6EB892, #A3D9B8, #4A8B6A, #173D2A, #0F2A1D)'
                  }} 
                />

                <div className="relative flex items-center p-3 pr-10 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-2xl backdrop-saturate-200 border border-white/60 dark:border-white/20 transition-colors duration-300 w-full h-full text-foreground">
                  <img 
                    src={person.img} 
                    alt={person.name} 
                    className="size-20 md:size-24 rounded-full object-cover mr-5 ring-2 ring-primary/20 group-hover:ring-[#2F5D46] transition-all duration-300" 
                  />
                  <div className="flex flex-col">
                    <h3 className="font-bold text-lg md:text-xl leading-tight">{person.name}</h3>
                    <p className="text-primary text-sm font-bold uppercase tracking-wider mt-1">{person.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b pb-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Past Issues</h2>
            <p className="text-muted-foreground mt-2">Browse our previous releases.</p>
          </div>
          
          <NewsletterFilters 
            years={years} 
            currentYear={resolvedSearchParams?.year} 
            currentMonth={resolvedSearchParams?.month} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {newsletters?.map((newsletter) => (
            <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id} className="group flex flex-col gap-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-2xl border bg-muted/20 shadow-sm group-hover:shadow-xl transition-all duration-300">
                <img 
                  src={newsletter.cover_image_url} 
                  alt={`Cover for ${newsletter.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </div>
              <div className="space-y-1 px-1 text-center">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  {newsletter.name}
                </h3>
                <p className="text-muted-foreground text-sm font-medium">
                  {new Date(0, newsletter.month - 1).toLocaleString('default', { month: 'long' })} {newsletter.year}
                </p>
              </div>
            </Link>
          ))}
          
          {newsletters?.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl border-muted">
              <p className="text-xl font-semibold text-foreground">No newsletters found.</p>
              <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
