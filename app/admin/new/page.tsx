"use client"

import { useState } from "react"
import { createProject } from './actions'
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import ImageUploader from "@/components/ui/imageuploader"

export default function NewProjectPage() {
  const [imageUrl, setImageUrl] = useState<string>("")

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>

      <form action={createProject} className="space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium mb-1">Project Title</label>
            <input id="title" name="title" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
            <input type="date" id="date" name="date" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
            <input id="location" name="location" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label htmlFor="avenue" className="block text-sm font-medium mb-1">Avenue</label>
            <select id="avenue" name="avenue" required className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="Community Service">Community Service</option>
              <option value="International Service">International Service</option>
              <option value="Digital Transformation">Digital Transformation</option>
              <option value="Public Relations">Public Relations</option>
              <option value="Sports & Recreation">Sports & Recreation</option>
              <option value="Membership Development">Membership Development</option>
            </select>
          </div>

          <div>
            <label htmlFor="collaborative_club" className="block text-sm font-medium mb-1">Collaborative Club (Optional)</label>
            <input id="collaborative_club" name="collaborative_club" className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea id="description" name="description" rows={5} required className="w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

        </div>

        <div className="pt-4 border-t border-border mt-6">
          <ImageUploader onUploadComplete={(url: string) => setImageUrl(url)} />
          <input type="hidden" name="image_url" value={imageUrl} />
        </div>

        <div className="flex justify-end pt-6 border-t border-border mt-8">
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </div>
  )
}