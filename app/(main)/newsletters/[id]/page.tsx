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

  if (error || !newsletter) {
    notFound()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col h-[100dvh] overflow-hidden">
      <FlipbookViewer 
        pages={newsletter.page_images} 
        title={newsletter.name}
        month={newsletter.month}
        year={newsletter.year}
      />
    </div>
  )
}