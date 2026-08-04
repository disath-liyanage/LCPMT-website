"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { updateProject } from "@/app/actions/projects";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Image01Icon, Calendar01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

export default function AdminEditForm({ project }: { project: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(project.description || "");
  
  const [date, setDate] = useState<Date | undefined>(project.date ? new Date(project.date) : new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const initialCollabs = project.collaborators?.length > 0 
    ? project.collaborators 
    : project.collaborative_club 
      ? [{ name: project.collaborative_club, link: project.collaborative_club_link || "" }] 
      : [];
  const [collabs, setCollabs] = useState<{name: string, link: string}[]>(initialCollabs);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingImages, setExistingImages] = useState<string[]>(project.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [mainImageTarget, setMainImageTarget] = useState<string>(project.main_image || ""); // Can be URL or new index "0", "1"

  const handleRemoveExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setImagesToDelete((prev) => [...prev, url]);
    if (mainImageTarget === url) setMainImageTarget(existingImages[0] || "");
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (mainImageTarget === indexToRemove.toString()) setMainImageTarget(existingImages[0] || "0");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date) return alert("Please select a date.");
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("description", description);
    formData.append("date", date.toISOString().split("T")[0]);
    formData.append("collaborators", JSON.stringify(collabs));
    
    formData.append("existing_images", JSON.stringify(existingImages));
    formData.append("images_to_delete", JSON.stringify(imagesToDelete));
    formData.append("main_image_target", mainImageTarget);
    newImages.forEach(file => formData.append("new_images", file));

    try {
      await updateProject(project.id, formData);
    } catch (error: any) {
      if (error.message?.includes("NEXT_REDIRECT") || error.digest?.includes("NEXT_REDIRECT")) throw error; 
      console.error(error);
      alert("Failed to update project.");
      setIsSubmitting(false);
    } 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Project Title</label>
          <input required type="text" name="title" defaultValue={project.title} className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
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
        <div className="relative">
          <label className="block text-sm font-medium mb-2">Date</label>
          <button 
            type="button" 
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted transition-colors text-left"
          >
            {date ? format(date, "PPP") : "Pick a date"}
            <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-muted-foreground" />
          </button>
          
          {showCalendar && (
            <div className="absolute top-[70px] left-0 z-50 bg-card border border-border rounded-lg shadow-xl p-2">
              <DayPicker 
                mode="single" 
                selected={date} 
                onSelect={(d) => { if(d) setDate(d); setShowCalendar(false); }} 
                className="text-foreground"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input required type="text" name="location" defaultValue={project.location} className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
        </div>
      </div>

      <div className="p-5 bg-muted/30 rounded-lg border border-border space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Collaborators & Partners</label>
          <Button type="button" variant="outline" size="sm" onClick={() => setCollabs([...collabs, {name:"", link:""}])} className="gap-2">
            <HugeiconsIcon icon={PlusSignIcon} size={16} /> Add Partner
          </Button>
        </div>
        {collabs.length === 0 && <p className="text-xs text-muted-foreground">No collaborators added.</p>}
        {collabs.map((c, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="w-full">
              <label className="text-xs text-muted-foreground">Name</label>
              <input value={c.name} onChange={(e) => { const n = [...collabs]; n[i].name = e.target.value; setCollabs(n); }} placeholder="e.g. Leo Club of Colombo" className="w-full p-2 border rounded-md bg-background text-sm" />
            </div>
            <div className="w-full">
              <label className="text-xs text-muted-foreground">Website / Social Link</label>
              <input value={c.link} onChange={(e) => { const n = [...collabs]; n[i].link = e.target.value; setCollabs(n); }} placeholder="https://..." className="w-full p-2 border rounded-md bg-background text-sm" />
            </div>
            <Button type="button" variant="destructive" size="icon" onClick={() => setCollabs(collabs.filter((_, idx) => idx !== i))} className="mb-0.5 shrink-0">
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Manage Photos</label>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <HugeiconsIcon icon={Image01Icon} size={32} className="text-muted-foreground group-hover:text-primary transition-colors mb-3" />
          <p className="font-medium text-sm">Click to upload new photos</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
          <input 
            type="file" 
            multiple 
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
              }
            }}
          />
        </div>

        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-muted/20 p-4 rounded-xl border border-border">
            
            {existingImages.map((url) => (
              <div key={url} onClick={() => setMainImageTarget(url)} className={cn("relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all h-32", mainImageTarget === url ? "border-primary" : "border-transparent")}>
                <img src={url} alt="Existing" className="w-full h-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(url); }} className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
                {mainImageTarget === url && <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-center text-[10px] font-bold py-1">MAIN PHOTO</div>}
              </div>
            ))}

            {newImages.map((file, i) => (
              <div key={i} onClick={() => setMainImageTarget(i.toString())} className={cn("relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all h-32", mainImageTarget === i.toString() ? "border-primary" : "border-transparent")}>
                <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(i); }} className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
                <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold">NEW</div>
                {mainImageTarget === i.toString() && <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-center text-[10px] font-bold py-1">MAIN PHOTO</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-2">Description (Markdown)</label>
        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-64 p-4 border rounded-md font-mono text-sm leading-relaxed bg-background focus:ring-2 focus:ring-primary outline-none" />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving Changes..." : "Save Changes"}
      </Button>
    </form>
  );
}