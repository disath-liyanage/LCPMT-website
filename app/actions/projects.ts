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
  const collaborative_club = formData.get('collaborative_club') as string || null
  const collaborative_club_link = formData.get('collaborative_club_link') as string || null
  
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []
  const mainImageIndex = parseInt(formData.get('main_image_index') as string || '0')
  const main_image = images.length > 0 ? images[mainImageIndex] : null

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
        collaborative_club_link,
        images,
        main_image
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
    main_image: project.main_image || (project.images && project.images[0]) || project.image_url || null, 
    images: project.images || [],
  }))
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('images')
    .eq('id', id)
    .single()

  if (project?.images && project.images.length > 0) {
    const imagePaths = project.images.map((url: string) => url.split(`/public/${BUCKET_NAME}/`)[1]).filter(Boolean)
    
    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(imagePaths)

      if (storageError) {
        console.error("Failed to delete images from bucket:", storageError.message)
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