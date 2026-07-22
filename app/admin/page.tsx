import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { buttonVariants } from "@/components/ui/button"
import AdminProjectsGrid from './AdminProjectsGrid'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('date', { ascending: false })

  if (projectsError) {
    console.error("Error fetching projects:", projectsError.message)
  }

  const formattedProjects = projects?.map(p => ({
    ...p,
    category: p.avenue 
  })) || []

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Project Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Logged in as {user.email}
          </p>
        </div>
        
        <Link href="/admin/new" className={buttonVariants({ variant: "default" })}>
          Add New Project
        </Link>
      </div>

      <AdminProjectsGrid projects={formattedProjects} />
    </div>
  )
}