"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, X, Plus, Upload, FileText, ImageIcon, CheckCircle2 } from "lucide-react"
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

  const [isDraggingCover, setIsDraggingCover] = useState(false)
  const [isDraggingPdf, setIsDraggingPdf] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

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

  const handleDragOver = (e: React.DragEvent, type: 'cover' | 'pdf') => {
    e.preventDefault()
    if (type === 'cover') setIsDraggingCover(true)
    else setIsDraggingPdf(true)
  }

  const handleDragLeave = (e: React.DragEvent, type: 'cover' | 'pdf') => {
    e.preventDefault()
    if (type === 'cover') setIsDraggingCover(false)
    else setIsDraggingPdf(false)
  }

  const handleDrop = (e: React.DragEvent, type: 'cover' | 'pdf') => {
    e.preventDefault()
    if (type === 'cover') setIsDraggingCover(false)
    else setIsDraggingPdf(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (type === 'cover') {
      if (!file.type.startsWith('image/')) {
        alert("Please drop an image file for the cover.")
        return
      }
      setCoverImage(file)
    } else {
      if (file.type !== 'application/pdf') {
        alert("Please drop a PDF file.")
        return
      }
      setPdfFile(file)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
      fetchNewsletters()
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
        <Button onClick={() => setIsDialogOpen(true)} variant="default" className="gap-2 rounded-full">
          <Plus className="h-4 w-4" />
          Upload New Newsletter
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {newsletters.map((newsletter) => (
          <div key={newsletter.id} className="group relative flex flex-col gap-3">
            <Link href={`/newsletters/${newsletter.id}`}>
              <div className="aspect-[3/4] relative overflow-hidden border border-border group-hover:border-primary transition-colors duration-200 rounded-lg">
                <img
                  src={newsletter.cover_image_url}
                  alt={`Cover for ${newsletter.name}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 p-2 bg-gradient-to-t from-black/70 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleEdit(newsletter.id)
                    }}
                    title="Edit"
                    className="h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(newsletter.id, newsletter.name)
                    }}
                    title="Delete"
                    className="h-8 w-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-destructive hover:[&_svg]:text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-2xl font-bold">Create New Newsletter</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => !isSubmitting && setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-full px-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    placeholder="e.g. Spring Edition 2026"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Year</label>
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-full px-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                    >
                      {[...Array(10)].map((_, i) => {
                        const y = new Date().getFullYear() - 5 + i
                        return <option key={y} value={y}>{y}</option>
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Month</label>
                    <select
                      value={month}
                      onChange={e => setMonth(e.target.value)}
                      className="w-full p-2.5 border border-border rounded-full px-4 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
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
                  <label className="block text-sm font-medium mb-1.5">Cover Image</label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => setCoverImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'cover')}
                    onDragLeave={(e) => handleDragLeave(e, 'cover')}
                    onDrop={(e) => handleDrop(e, 'cover')}
                    className={`relative rounded-2xl border-2 border-dashed p-5 cursor-pointer transition-colors ${
                      isDraggingCover
                        ? "border-primary bg-primary/5"
                        : coverImage
                        ? "border-primary/40 bg-primary/[0.03]"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {coverImage ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="Cover preview"
                          className="h-14 w-14 rounded-lg object-cover shrink-0 border border-border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            {coverImage.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatBytes(coverImage.size)} - click or drop to replace</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCoverImage(null) }}
                          className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          <span className="text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG or JPG</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">PDF Document</label>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    onDragOver={(e) => handleDragOver(e, 'pdf')}
                    onDragLeave={(e) => handleDragLeave(e, 'pdf')}
                    onDrop={(e) => handleDrop(e, 'pdf')}
                    className={`relative rounded-2xl border-2 border-dashed p-5 cursor-pointer transition-colors ${
                      isDraggingPdf
                        ? "border-primary bg-primary/5"
                        : pdfFile
                        ? "border-primary/40 bg-primary/[0.03]"
                        : "border-border hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    {pdfFile ? (
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatBytes(pdfFile.size)} - click or drop to replace</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null) }}
                          className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          <span className="text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF only</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full gap-2"
                >
                  {isSubmitting ? 'Uploading & Processing...' : 'Upload Newsletter'}
                </Button>

                {progress && (
                  <div className="mt-4 p-4 bg-muted text-center rounded-xl font-medium text-sm">
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