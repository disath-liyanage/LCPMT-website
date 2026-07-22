"use client"

import { useState } from "react"

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void;
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      
      const fakeUploadedUrl = `https://your-supabase-project.supabase.co/storage/v1/object/public/images/${file.name}`
      
      if (onUploadComplete) {
        onUploadComplete(fakeUploadedUrl)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="block text-sm font-medium mb-1">Project Image</label>
      
      <div className="flex items-center gap-4">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        {isUploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>

      {preview && (
        <div className="mt-2 relative w-40 h-40 rounded-lg overflow-hidden border border-border">
          <img src={preview} alt="Preview" className="object-cover w-full h-full" />
        </div>
      )}
    </div>
  )
}