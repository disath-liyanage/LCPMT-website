"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createProject } from "@/app/actions/projects";

export default function AdminProjectCreatePage() {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
      setMainImageIndex(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    formData.append("main_image_index", mainImageIndex.toString());
    formData.append("description", description);

    try {
      await createProject(formData);
    } catch (error: any) {
      if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
        throw error; 
      }
      
      console.error(error);
      alert("Failed to save project. Check console for details.");
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-xl border border-border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Project Title</label>
            <input required type="text" name="title" className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Avenue / Category</label>
            <select required name="avenue" className="w-full p-2 border rounded-md bg-background">
              <option value="Community Service">Community Service</option>
              <option value="Environment">Environment</option>
              <option value="Health">Health</option>
              <option value="Youth Development">Youth Development</option>
              <option value="Fundraising">Fundraising</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input required type="date" name="date" className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input required type="text" name="location" className="w-full p-2 border rounded-md bg-background" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-muted/30 rounded-lg border border-border">
          <div>
            <label className="block text-sm font-medium mb-2">Collaborative Club Name (Optional)</label>
            <input type="text" name="collaborative_club" className="w-full p-2 border rounded-md bg-background" placeholder="e.g. Leo Club of Colombo" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Club Website/Social Link (Optional)</label>
            <input type="url" name="collaborative_club_link" className="w-full p-2 border rounded-md bg-background" placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Project Images</label>
          <input 
            type="file" 
            name="images"
            multiple 
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full border p-2 rounded-md bg-background"
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {images.map((file, index) => (
                <div 
                  key={index} 
                  onClick={() => setMainImageIndex(index)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                    mainImageIndex === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Upload preview ${index}`} 
                    className="w-full h-32 object-cover"
                  />
                  {mainImageIndex === index && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-bold">
                      Main Photo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Description</label>
            <span className="text-xs text-muted-foreground">Markdown supported</span>
          </div>
          <textarea 
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-64 p-4 border rounded-md font-mono text-sm leading-relaxed bg-background"
            placeholder="Use **bold**, *italics*, ### Headings, and - Lists here..."
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving Project..." : "Save Project"}
        </Button>
      </form>
    </div>
  );
}