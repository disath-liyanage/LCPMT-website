import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground mt-2">Browse our past issues and updates.</p>
        </div>
        
        <form className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select 
            name="year" 
            className="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" 
            defaultValue={resolvedSearchParams?.year || ""}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          
          <select 
            name="month" 
            className="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors" 
            defaultValue={resolvedSearchParams?.month || ""}
          >
            <option value="">All Months</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <Button type="submit" variant="default" size="lg" className="shadow-sm">
            Filter
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {newsletters?.map((newsletter) => (
          <Link href={`/newsletters/${newsletter.id}`} key={newsletter.id} className="group flex flex-col gap-4">
            <div className="aspect-[3/4] relative overflow-hidden rounded-xl border bg-muted/20 shadow-sm group-hover:shadow-xl transition-all duration-300">
              <img 
                src={newsletter.cover_image_url} 
                alt={`Cover for ${newsletter.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
            </div>
            <div className="space-y-1 px-1">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                {newsletter.name}
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                {new Date(0, newsletter.month - 1).toLocaleString('default', { month: 'long' })} {newsletter.year}
              </p>
            </div>
          </Link>
        ))}
        
        {newsletters?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl border-muted">
            <p className="text-lg font-medium text-foreground">No newsletters found.</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
