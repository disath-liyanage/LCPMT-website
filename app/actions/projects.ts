'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server' 

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const newProject = {
    title,
    slug,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    avenue: formData.get('avenue') as string,
    collaborative_club: formData.get('collaborative_club') as string || null,
    description: formData.get('description') as string,
    image_url: formData.get('image_url') as string || null, 
  }

  const { error } = await supabase.from('projects').insert(newProject)

  if (error) {
    console.error("Failed to create project:", error.message)
  }

  revalidatePath('/')
  revalidatePath('/projects')
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
  }))
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Failed to delete project:", error.message)
    throw new Error("Failed to delete project")
  }

  revalidatePath('/admin')
  revalidatePath('/projects')
  revalidatePath('/')
}