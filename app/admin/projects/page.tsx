import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import AdminProjectsGrid from './AdminProjectsGrid'
import { getProjects } from '@/app/actions/projects'

export default async function AdminProjectsDashboard() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const formattedProjects = await getProjects()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Project Dashboard
          </h1>
        </div>
        
        <Link 
          href="/admin/create" 
          className={cn(buttonVariants({ variant: "default" }), "bg-[#2F6B4A] hover:bg-[#25573C] text-white font-semibold")}
        >
          Add New Project
        </Link>
      </div>

      <AdminProjectsGrid projects={formattedProjects} />
    </div>
  )
}