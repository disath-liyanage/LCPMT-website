"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createProject } from "@/app/actions/projects";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Image01Icon, Calendar01Icon, PlusSignIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminProjectCreatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [locationType, setLocationType] = useState("Onsite");

  const [collabs, setCollabs] = useState<{name: string, link: string}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (mainImageIndex === indexToRemove) setMainImageIndex(0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date) return alert("Please select a date.");
    if (images.length === 0) return alert("Please upload at least one image.");
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("description", description);
    formData.append("date", date.toISOString().split("T")[0]);
    formData.append("collaborators", JSON.stringify(collabs));
    formData.append("main_image_index", mainImageIndex.toString());
    images.forEach(file => formData.append("images", file));

    try {
      await createProject(formData);
    } catch (error: any) {
      if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) throw error; 
      console.error(error);
      alert("Failed to save project.");
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/projects" className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border border-border hover:bg-accent transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Project Title</label>
            <input required type="text" name="title" className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Avenue / Category</label>
            <select required name="avenue" className="w-full p-2 border rounded-md bg-background">
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
            <button type="button" onClick={() => setShowCalendar(!showCalendar)} className="w-full flex items-center justify-between p-2.5 border rounded-md bg-background hover:bg-muted transition-colors text-left">
              {date ? format(date, "PPP") : "Pick a date"}
              <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-muted-foreground" />
            </button>
            {showCalendar && (
              <div className="absolute top-[70px] left-0 z-50 bg-card border border-border rounded-lg shadow-xl p-2">
                <DayPicker mode="single" selected={date} onSelect={(d) => { if(d) setDate(d); setShowCalendar(false); }} className="text-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Location Type</label>
              <select value={locationType} onChange={(e) => setLocationType(e.target.value)} name="location_type" className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none">
                <option value="Onsite">Onsite (Single Location)</option>
                <option value="Online">Online</option>
                <option value="Multiple">Multiple Locations</option>
              </select>
            </div>
            {locationType !== "Online" && (
              <div>
                <label className="block text-sm font-medium mb-2">Location Details</label>
                <input required type="text" name="location" placeholder="e.g. Viharamahadevi Park" className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none" />
              </div>
            )}
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
          <label className="block text-sm font-medium">Project Images</label>
          <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
            <HugeiconsIcon icon={Image01Icon} size={32} className="text-muted-foreground group-hover:text-primary transition-colors mb-3" />
            <p className="font-medium text-sm">Click to upload photos</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
            <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-muted/20 p-4 rounded-xl border border-border">
              {images.map((file, i) => (
                <div key={i} onClick={() => setMainImageIndex(i)} className={cn("relative group cursor-pointer rounded-lg overflow-hidden border-4 transition-all h-32", mainImageIndex === i ? "border-primary" : "border-transparent")}>
                  <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }} className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                  {mainImageIndex === i && <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-center text-[10px] font-bold py-1">MAIN PHOTO</div>}
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
          {isSubmitting ? "Saving Project..." : "Save Project"}
        </Button>
      </form>
    </div>
  );
}