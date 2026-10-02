import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FlipbookViewer from '@/components/sections/FlipbookViewer'

export default async function NewsletterFlipbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: newsletter, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !newsletter || !Array.isArray(newsletter.page_images) || newsletter.page_images.length === 0) {
    notFound()
  }

  return (
    <div className="fixed inset-0 z-[110] flex flex-col overflow-hidden bg-background pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)]">
      <FlipbookViewer 
        pages={newsletter.page_images}
        title={newsletter.name}
        month={newsletter.month}
        year={newsletter.year}
      />
    </div>
  )
}