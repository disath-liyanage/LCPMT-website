import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
      <AdminProjectsGrid projects={formattedProjects} userEmail={user.email} />
    </div>
  )
}