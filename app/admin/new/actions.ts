'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const avenue = formData.get('avenue') as string
  const collaborative_club = formData.get('collaborative_club') as string

  const { error } = await supabase
    .from('projects')
    .insert([
      {
        title,
        description,
        date,
        location,
        avenue,
        collaborative_club,
      }
    ])

  if (error) {
    console.error("Failed to insert project:", error.message)
    throw new Error("Failed to create project")
  }

  revalidatePath('/admin')
  revalidatePath('/projects')
  
  redirect('/admin')
}