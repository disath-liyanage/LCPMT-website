import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

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
        
        <Button>Add New Project</Button>
      </div>

      <div className="mt-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">
            The project list will go here. Time to build the insert form.
          </p>
        </div>
      </div>
    </div>
  )
}