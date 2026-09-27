"use client"

import { useState, useRef } from "react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { buttonVariants } from "@/components/ui/button"

import * as tus from 'tus-js-client'

const BUCKET_NAME = 'pdfs'

export default function CreateNewsletter() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState("")

  const [name, setName] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !coverImage || !pdfFile) {
      alert("Please fill all fields and upload files.")
      return
    }

    setIsSubmitting(true)
    setProgress("Initializing...")

    try {
      const supabase = createClient()
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
          chunkSize: 6 * 1024 * 1024, // 6MB chunks
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

      // 4. Save to Database
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
      router.push('/admin')

    } catch (error: any) {
      console.error("Error creating newsletter:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSubmitting(false)
      setProgress("")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New Newsletter</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
            placeholder="e.g. Spring Edition 2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select 
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
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
              className="w-full p-2 border rounded-md bg-background"
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
            className="w-full p-2 border rounded-md bg-background"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">PDF Document</label>
          <input 
            type="file" 
            accept="application/pdf"
            required
            onChange={e => setPdfFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-md bg-background"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={buttonVariants({ variant: "default", className: "w-full" })}
        >
          {isSubmitting ? 'Uploading & Processing...' : 'Upload Newsletter'}
        </button>

        {progress && (
          <div className="mt-4 p-4 bg-muted text-center rounded-md font-medium text-sm">
            {progress}
          </div>
        )}
      </form>
    </div>
  )
}
