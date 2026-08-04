"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateProject } from "@/app/actions/projects";

export default function AdminEditForm({ project }: { project: any }) {
  const [description, setDescription] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("description", description);

    try {
      await updateProject(project.id, formData);
    } catch (error: any) {
      if (error.message?.includes("NEXT_REDIRECT") || error.digest?.includes("NEXT_REDIRECT")) {
        throw error; 
      }
      console.error(error);
      alert("Failed to update project.");
      setIsSubmitting(false);
    } 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <input required type="text" name="title" defaultValue={project.title} className="w-full p-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Avenue / Category</label>
          <select required name="avenue" defaultValue={project.avenue} className="w-full p-2 border rounded-md bg-background">
            <option value="Community Service">Community Service</option>
            <option value="International Service">International Service</option>
            <option value="Digital Transformation">Digital Transformation</option>
            <option value="Public Relations">Public Relations</option>
            <option value="Sports & Recreation">Sports & Recreation</option>
            <option value="Membership Development">Membership Development</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input required type="date" name="date" defaultValue={project.date} className="w-full p-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input required type="text" name="location" defaultValue={project.location} className="w-full p-2 border rounded-md bg-background" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-muted/30 rounded-lg border border-border">
        <div>
          <label className="block text-sm font-medium mb-2">Collaborative Club Name</label>
          <input type="text" name="collaborative_club" defaultValue={project.collaborative_club || ""} className="w-full p-2 border rounded-md bg-background" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Club Link</label>
          <input type="url" name="collaborative_club_link" defaultValue={project.collaborative_club_link || ""} className="w-full p-2 border rounded-md bg-background" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-2">Description (Markdown)</label>
        <textarea 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-64 p-4 border rounded-md font-mono text-sm leading-relaxed bg-background"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Save Changes"}
      </Button>
    </form>
  );
}