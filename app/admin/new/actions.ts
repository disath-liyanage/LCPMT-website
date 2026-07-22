'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const uniqueId = Math.random().toString(36).substring(2, 8)
  const slug = `${baseSlug}-${uniqueId}`
  
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const avenue = formData.get('avenue') as string
  const collaborative_club = formData.get('collaborative_club') as string
  
  const image_url = formData.get('image_url') as string || null

  const { error } = await supabase
    .from('projects')
    .insert([
      {
        title,
        slug, 
        description,
        date,
        location,
        avenue,
        collaborative_club,
        image_url 
      }
    ])

  if (error) {
    console.error("Supabase Error:", error.message)
    throw new Error(`Failed to create project: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/projects')
  revalidatePath('/')
  redirect('/admin')
}