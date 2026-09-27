"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { buttonVariants, Button } from "@/components/ui/button"

export default function AdminNewslettersPage() {
  const [newsletters, setNewsletters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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

  if (loading) return <div className="p-8">Loading newsletters...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Newsletters</h1>
        <Link href="/admin/newsletters/create" className={buttonVariants({ variant: "default" })}>
          Upload New Newsletter
        </Link>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Issue</th>
              <th className="p-4 font-medium">Date Uploaded</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {newsletters.map(n => (
              <tr key={n.id} className="hover:bg-muted/50">
                <td className="p-4">{n.name}</td>
                <td className="p-4">{n.month}/{n.year}</td>
                <td className="p-4">{new Date(n.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Link href={`/newsletters/${n.id}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    View
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(n.id, n.name)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {newsletters.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">No newsletters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
