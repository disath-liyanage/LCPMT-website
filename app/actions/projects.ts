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
  
  const mainImageIndex = parseInt(formData.get('main_image_index') as string || '0')
  const imageFiles = formData.getAll('images') as File[]
  const imageUrls: string[] = []

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop()
      
      const filePath = `projects/${slug}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      
      const buffer = await file.arrayBuffer()
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error("Storage upload error:", uploadError.message)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      imageUrls.push(publicUrl)
    }
  }

  const main_image = imageUrls.length > 0 ? imageUrls[mainImageIndex] : null

  const { error: dbError } = await supabase
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
        images: imageUrls,
        main_image
      }
    ])

  if (dbError) {
    console.error("Supabase DB Error:", dbError.message)
    throw new Error(`Failed to save project to database: ${dbError.message}`)
  }

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
  redirect('/admin/projects')
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

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const location = formData.get('location') as string
  const avenue = formData.get('avenue') as string
  const collaborative_club = formData.get('collaborative_club') as string || null
  const collaborative_club_link = formData.get('collaborative_club_link') as string || null
  
  const { error: dbError } = await supabase
    .from('projects')
    .update({
      title,
      description,
      date,
      location,
      avenue,
      collaborative_club,
      collaborative_club_link,
    })
    .eq('id', id)

  if (dbError) {
    console.error("Supabase DB Error:", dbError.message)
    throw new Error(`Failed to update project: ${dbError.message}`)
  }

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
  
  redirect('/admin/projects')
}

export async function deleteProject(id: string) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('images, image_url')
    .eq('id', id)
    .single()

  const allImagesToDelete = [...(project?.images || [])];
  if (project?.image_url) allImagesToDelete.push(project.image_url);

  if (allImagesToDelete.length > 0) {
    const imagePaths = allImagesToDelete
      .map((url: string) => url.split(`/public/${BUCKET_NAME}/`)[1])
      .filter(Boolean)
    
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

  revalidatePath('/admin/projects')
  revalidatePath('/projects')
  revalidatePath('/')
}