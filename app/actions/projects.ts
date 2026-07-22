'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const BUCKET_NAME = 'project-images'

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

export async function getProjects() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('date', { ascending: false }) 

  if (error) {
    console.error("Failed to fetch projects:", error.message)
    return []
  }

  return data.map(project => ({
    ...project,
    category: project.avenue, 
    image: project.image_url, 
  }))
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('image_url')
    .eq('id', id)
    .single()

  if (project?.image_url) {
    const imagePath = project.image_url.split(`/public/${BUCKET_NAME}/`)[1]
    
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imagePath])

      if (storageError) {
        console.error("Failed to delete image from bucket:", storageError.message)
      }
    }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Failed to delete project row:", error.message)
    throw new Error("Failed to delete project")
  }

  revalidatePath('/admin')
  revalidatePath('/projects')
  revalidatePath('/')
}