"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { buttonVariants, Button } from "@/components/ui/button"
import { Pencil, Trash2, X } from "lucide-react"
import * as tus from 'tus-js-client'
import { useRouter } from 'next/navigation'

const BUCKET_NAME = 'pdfs'

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState("")
  const [name, setName] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    const { data, error } = await supabase.from('newsletters').select('*').order('created_at', { ascending: false })
    if (data) setNewsletters(data)
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    
    const { error } = await supabase.from('newsletters').delete().eq('id', id)
    if (error) {
      alert("Error deleting: " + error.message)
    } else {
      setNewsletters(newsletters.filter(n => n.id !== id))
    }
  }

  const handleEdit = (id: string) => {
    alert("Edit functionality coming soon for newsletter: " + id)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !coverImage || !pdfFile) {
      alert("Please fill all fields and upload files.")
      return
    }

    setIsSubmitting(true)
    setProgress("Initializing...")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const folderName = `${Date.now()}_${name.replace(/\s+/g, '-').toLowerCase()}`

      setProgress("Uploading cover image...")
      const coverExt = coverImage.name.split('.').pop()
      const coverPath = `covers/${folderName}.${coverExt}`
      const { data: coverData, error: coverError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(coverPath, coverImage)
      if (coverError) throw coverError

      const { data: { publicUrl: coverUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(coverPath)

      setProgress("Uploading PDF (this might take a while)...")
      const pdfPath = `documents/${folderName}.pdf`
      
      await new Promise<void>((resolve, reject) => {
        if (!session?.access_token) {
          reject(new Error("You must be logged in to upload files."))
          return
        }

        var upload = new tus.Upload(pdfFile, {
          endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${session.access_token}`,
            'x-upsert': 'true',
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: BUCKET_NAME,
            objectName: pdfPath,
            contentType: 'application/pdf',
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024,
          onError: function (error) {
            reject(error)
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
            setProgress(`Uploading PDF... ${percentage}%`)
          },
          onSuccess: function () {
            resolve()
          },
        })
        upload.start()
      })

      const { data: { publicUrl: pdfUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(pdfPath)

      setProgress("Processing PDF pages (this may take a moment)...")
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const numPages = pdf.numPages
      const imageUrls: string[] = []

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error("Could not create canvas context")

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Rendering page ${i} of ${numPages}...`)
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        canvas.height = viewport.height
        canvas.width = viewport.width

        // @ts-ignore
        await page.render({ canvasContext: ctx, viewport }).promise

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Canvas toBlob failed")), 'image/jpeg', 0.8)
        })

        const pagePath = `pages/${folderName}/page_${i}.jpg`
        setProgress(`Uploading page ${i} of ${numPages}...`)
        const { error: pageError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(pagePath, blob)
        if (pageError) throw pageError

        const { data: { publicUrl: pageUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(pagePath)
        imageUrls.push(pageUrl)
      }

      setProgress("Saving newsletter details...")
      const { error: dbError } = await supabase
        .from('newsletters')
        .insert({
          name,
          year: parseInt(year),
          month: parseInt(month),
          cover_image_url: coverUrl,
          pdf_url: pdfUrl,
          page_images: imageUrls
        })

      if (dbError) throw dbError

      setProgress("Done!")
      alert("Newsletter uploaded successfully!")
      setIsDialogOpen(false)
      fetchNewsletters() // Refresh
      // Reset form
      setName("")
      setCoverImage(null)
      setPdfFile(null)

    } catch (error: any) {
      console.error("Error creating newsletter:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
      setProgress("")
    }
  }

  if (loading) return <div className="p-8">Loading newsletters...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Newsletters</h1>
        <Button onClick={() => setIsDialogOpen(true)} variant="default">
          Upload New Newsletter
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {newsletters.map((newsletter) => (
          <div key={newsletter.id} className="group relative flex flex-col gap-3">
            <div className="absolute top-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 rounded-full shadow-md hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  handleEdit(newsletter.id);
                }}
                title="Edit"
              >
                <Pencil className="h-4 w-4 text-blue-600" />
              </Button>
              <Button 
                size="icon" 
                variant="destructive" 
                className="h-8 w-8 rounded-full shadow-md"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(newsletter.id, newsletter.name);
                }}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Link href={`/newsletters/${newsletter.id}`}>
              <div className="aspect-[3/4] relative overflow-hidden border border-border group-hover:border-primary transition-colors duration-200">
                <img
                  src={newsletter.cover_image_url}
                  alt={`Cover for ${newsletter.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-1 text-center mt-2">
                <h3 className="font-serif font-bold text-foreground leading-tight group-hover:underline decoration-primary underline-offset-4">
                  {newsletter.name}
                </h3>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mt-1">
                  {new Date(0, newsletter.month - 1).toLocaleString('default', { month: 'long' })} {newsletter.year}
                </p>
              </div>
            </Link>
          </div>
        ))}

        {newsletters.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-md">
            No newsletters found.
          </div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Create New Newsletter</h2>
              <Button variant="ghost" size="icon" onClick={() => !isSubmitting && setIsDialogOpen(false)} disabled={isSubmitting}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    placeholder="e.g. Spring Edition 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <select 
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      {[...Array(10)].map((_, i) => {
                        const y = new Date().getFullYear() - 5 + i
                        return <option key={y} value={y}>{y}</option>
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Month</label>
                    <select 
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <option key={m} value={m}>
                          {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    required
                    onChange={e => setCoverImage(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">PDF Document</label>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    required
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Uploading & Processing...' : 'Upload Newsletter'}
                </Button>

                {progress && (
                  <div className="mt-4 p-4 bg-muted text-center rounded-md font-medium text-sm">
                    {progress}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
