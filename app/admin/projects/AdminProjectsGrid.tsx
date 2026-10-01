"use client";

import { useMemo, useState, useTransition, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteProject, toggleFeatureProject, createProject, updateProject } from "@/app/actions/projects";
import ProjectCard from "@/components/ui/ProjectCard";
import type { Project } from "@/lib/data";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Image01Icon, Calendar01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const categories = [
  "All",
  "Community Service",
  "International Service",
  "Digital Transformation",
  "Public Relations",
  "Sports & Recreation",
  "Membership Development",
];

export default function AdminProjectsGrid({ projects, userEmail }: { projects: Project[], userEmail: string | undefined }) {
  const [active, setActive] = useState("All");
  const [isPending, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filtered = useMemo(
    () =>
      active === "All"
        ? projects
        : projects.filter((p) => p.category === active),
    [active, projects]
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      startTransition(() => { deleteProject(id); });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Project Dashboard
          </h1>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#2F6B4A] hover:bg-[#3A8B5E] text-white font-semibold shadow-sm px-6 !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50 focus:!ring-offset-2"
        >
          Add New Project
        </Button>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50",
                active === category
                  ? "bg-[#2F6B4A] text-white border-[#2F6B4A] hover:bg-[#3A8B5E] hover:border-[#3A8B5E]"
                  : "bg-background border-border/80 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div key={project.id} className="group relative h-full rounded-3xl overflow-hidden">
                
                <div className="h-full w-full [&_.absolute.top-3.left-3]:group-hover:opacity-0 [&_.absolute.top-4.left-4]:group-hover:opacity-0 [&_.absolute.top-3.left-3]:transition-opacity [&_.absolute.top-4.left-4]:transition-opacity">
                  <ProjectCard project={project} />
                </div>

                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-t-3xl" />

                <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col xl:flex-row gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setEditingProject(project)}
                    className="h-8 px-4 font-bold shadow-md bg-white text-black hover:bg-gray-200 rounded-full !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="secondary"
                    size="sm" 
                    className={cn("h-8 px-4 font-bold shadow-md rounded-full !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50", project.featured_on_main ? "bg-[#2F6B4A] hover:bg-[#3A8B5E] text-white" : "bg-white text-black hover:bg-gray-200")} 
                    onClick={async () => { await toggleFeatureProject(project.id, project.featured_on_main || false); }}
                  >
                    {project.featured_on_main ? "★ Featured" : "Add to Main"}
                  </Button>
                </div>

                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 px-4 font-bold shadow-xl border border-red-800 bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white transition-all rounded-full !outline-none focus:!ring-2 focus:!ring-red-500/50" 
                    onClick={() => handleDelete(project.id)} 
                    disabled={isPending}
                  >
                    {isPending ? "..." : "Delete"}
                  </Button>
                </div>

                {project.featured_on_main && (
                  <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                    <span className="bg-[#2F6B4A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#2F6B4A]/50">
                      ★ Main Page
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        )}
      </div>

      {isCreateOpen && <CreateProjectModal onClose={() => setIsCreateOpen(false)} />}
      {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} />}
    </>
  );
}

const inputClasses = "w-full p-2.5 border border-border rounded-xl bg-background text-sm text-foreground transition-all !outline-none !ring-offset-0 focus:!ring-2 focus:!ring-[#2F6B4A]/40 focus:!border-[#2F6B4A]";

function CreateProjectModal({ onClose }: { onClose: () => void }) {
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
      onClose(); 
    } catch (error: any) {
      if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
        onClose();
        return;
      }
      console.error(error);
      alert("Failed to save project.");
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 lg:p-10">
      <div className="bg-card w-full max-w-4xl max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-border">
        
        <div className="flex-shrink-0 bg-card border-b border-border flex items-center justify-between p-6 z-10">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50">
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input required type="text" name="title" className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avenue / Category</label>
                <select required name="avenue" className={inputClasses}>
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
                <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={cn(inputClasses, "flex items-center justify-between hover:bg-muted text-left")}>
                  {date ? format(date, "PPP") : "Pick a date"}
                  <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-muted-foreground" />
                </button>
                {showCalendar && (
                  <div className="absolute top-[75px] left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-3" 
                       style={{ '--rdp-accent-color': '#2F6B4A', '--rdp-background-color': '#2F6B4A' } as React.CSSProperties}>
                    <DayPicker mode="single" selected={date} onSelect={(d) => { if(d) setDate(d); setShowCalendar(false); }} className="text-foreground [&_.rdp-day_selected]:!bg-[#2F6B4A] [&_.rdp-day_selected]:!text-white [&_.rdp-day:focus]:!outline-none [&_.rdp-day:focus]:!ring-2 [&_.rdp-day:focus]:!ring-[#2F6B4A]/50" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Location Type</label>
                  <select value={locationType} onChange={(e) => setLocationType(e.target.value)} name="location_type" className={inputClasses}>
                    <option value="Onsite">Onsite (Single Location)</option>
                    <option value="Online">Online</option>
                    <option value="Multiple">Multiple Locations</option>
                  </select>
                </div>
                {locationType !== "Online" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Location Details</label>
                    <input required type="text" name="location" placeholder="e.g. Viharamahadevi Park" className={inputClasses} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Collaborators & Partners</label>
                <Button type="button" variant="outline" size="sm" onClick={() => setCollabs([...collabs, {name:"", link:""}])} className="gap-2 rounded-full border-border/80 !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50">
                  <HugeiconsIcon icon={PlusSignIcon} size={16} /> Add Partner
                </Button>
              </div>
              {collabs.length === 0 && <p className="text-xs text-muted-foreground">No collaborators added.</p>}
              {collabs.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input value={c.name} onChange={(e) => { const n = [...collabs]; n[i].name = e.target.value; setCollabs(n); }} placeholder="e.g. Leo Club" className={inputClasses} />
                  </div>
                  <div className="w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Website / Social Link</label>
                    <input value={c.link} onChange={(e) => { const n = [...collabs]; n[i].link = e.target.value; setCollabs(n); }} placeholder="https://..." className={inputClasses} />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => setCollabs(collabs.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl h-10 w-10 !outline-none focus:!ring-2 focus:!ring-red-500/50">
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">Project Images</label>
              <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:!border-[#2F6B4A] hover:bg-[#2F6B4A]/5 transition-all group !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50" tabIndex={0}>
                <HugeiconsIcon icon={Image01Icon} size={36} className="text-muted-foreground group-hover:text-[#2F6B4A] transition-colors mb-3" />
                <p className="font-semibold text-sm group-hover:text-[#2F6B4A] transition-colors">Click to upload photos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files) setImages((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-muted/20 p-4 rounded-2xl border border-border">
                  {images.map((file, i) => (
                    <div key={i} onClick={() => setMainImageIndex(i)} className={cn("relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all h-32", mainImageIndex === i ? "border-[#2F6B4A]" : "border-transparent")}>
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(i); }} className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                      </button>
                      
                      {mainImageIndex === i && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2F6B4A] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg">
                          MAIN PHOTO
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Description (Markdown)</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className={cn(inputClasses, "min-h-[160px] font-mono leading-relaxed")} />
            </div>

            <button type="submit" className="w-full rounded-full bg-[#2F6B4A] hover:bg-[#3A8B5E] !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50 focus:!ring-offset-2 text-white py-2.5 text-sm font-semibold shadow-md transition-all disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving Project..." : "Save Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onClose }: { project: any; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState(project.description || "");
  const [date, setDate] = useState<Date | undefined>(project.date ? new Date(project.date) : new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [locationType, setLocationType] = useState(project.location_type || "Onsite");

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
  const [mainImageTarget, setMainImageTarget] = useState<string>(project.main_image || "");

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
      onClose(); 
    } catch (error: any) {
      if (error.message?.includes("NEXT_REDIRECT") || error.digest?.includes("NEXT_REDIRECT")) {
        onClose();
        return;
      }
      console.error(error);
      alert("Failed to update project.");
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 lg:p-10">
      <div className="bg-card w-full max-w-4xl max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-border">
        
        <div className="flex-shrink-0 bg-card border-b border-border flex items-center justify-between p-6 z-10">
          <h2 className="text-2xl font-bold">Edit Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50">
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title</label>
                <input required type="text" name="title" defaultValue={project.title} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Avenue / Category</label>
                <select required name="avenue" defaultValue={project.avenue} className={inputClasses}>
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
                <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={cn(inputClasses, "flex items-center justify-between hover:bg-muted text-left")}>
                  {date ? format(date, "PPP") : "Pick a date"}
                  <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-muted-foreground" />
                </button>
                {showCalendar && (
                  <div className="absolute top-[75px] left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-3"
                       style={{ '--rdp-accent-color': '#2F6B4A', '--rdp-background-color': '#2F6B4A' } as React.CSSProperties}>
                    <DayPicker mode="single" selected={date} onSelect={(d) => { if(d) setDate(d); setShowCalendar(false); }} className="text-foreground [&_.rdp-day_selected]:!bg-[#2F6B4A] [&_.rdp-day_selected]:!text-white [&_.rdp-day:focus]:!outline-none [&_.rdp-day:focus]:!ring-2 [&_.rdp-day:focus]:!ring-[#2F6B4A]/50" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Location Type</label>
                  <select value={locationType} onChange={(e) => setLocationType(e.target.value)} name="location_type" className={inputClasses}>
                    <option value="Onsite">Onsite (Single Location)</option>
                    <option value="Online">Online</option>
                    <option value="Multiple">Multiple Locations</option>
                  </select>
                </div>
                {locationType !== "Online" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Location Details</label>
                    <input required type="text" name="location" defaultValue={project.location} className={inputClasses} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Collaborators & Partners</label>
                <Button type="button" variant="outline" size="sm" onClick={() => setCollabs([...collabs, {name:"", link:""}])} className="gap-2 rounded-full border-border/80 !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50">
                  <HugeiconsIcon icon={PlusSignIcon} size={16} /> Add Partner
                </Button>
              </div>
              {collabs.length === 0 && <p className="text-xs text-muted-foreground">No collaborators added.</p>}
              {collabs.map((c, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                    <input value={c.name} onChange={(e) => { const n = [...collabs]; n[i].name = e.target.value; setCollabs(n); }} placeholder="e.g. Leo Club" className={inputClasses} />
                  </div>
                  <div className="w-full">
                    <label className="text-xs text-muted-foreground mb-1 block">Website / Social Link</label>
                    <input value={c.link} onChange={(e) => { const n = [...collabs]; n[i].link = e.target.value; setCollabs(n); }} placeholder="https://..." className={inputClasses} />
                  </div>
                  <Button type="button" variant="destructive" size="icon" onClick={() => setCollabs(collabs.filter((_, idx) => idx !== i))} className="shrink-0 rounded-xl h-10 w-10 !outline-none focus:!ring-2 focus:!ring-red-500/50">
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">Manage Photos</label>
              <div onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border/80 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:!border-[#2F6B4A] hover:bg-[#2F6B4A]/5 transition-all group !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50" tabIndex={0}>
                <HugeiconsIcon icon={Image01Icon} size={36} className="text-muted-foreground group-hover:text-[#2F6B4A] transition-colors mb-3" />
                <p className="font-semibold text-sm group-hover:text-[#2F6B4A] transition-colors">Click to upload new photos</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files) setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
              </div>

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 bg-muted/20 p-4 rounded-2xl border border-border">
                  {existingImages.map((url) => (
                    <div key={url} onClick={() => setMainImageTarget(url)} className={cn("relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all h-32", mainImageTarget === url ? "border-[#2F6B4A]" : "border-transparent")}>
                      <img src={url} alt="Existing" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(url); }} className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                      </button>
                      
                      {mainImageTarget === url && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2F6B4A] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                          MAIN PHOTO
                        </div>
                      )}
                    </div>
                  ))}
                  {newImages.map((file, i) => (
                    <div key={i} onClick={() => setMainImageTarget(i.toString())} className={cn("relative group cursor-pointer rounded-xl overflow-hidden border-4 transition-all h-32", mainImageTarget === i.toString() ? "border-[#2F6B4A]" : "border-transparent")}>
                      <img src={URL.createObjectURL(file)} alt="New" className="w-full h-full object-cover" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveNewImage(i); }} className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <HugeiconsIcon icon={Cancel01Icon} size={16} />
                      </button>
                      
                      <div className="absolute top-2 left-2 bg-[#3A8B5E] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold">NEW</div>
                      {mainImageTarget === i.toString() && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2F6B4A] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                          MAIN PHOTO
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Description (Markdown)</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className={cn(inputClasses, "min-h-[160px] font-mono leading-relaxed")} />
            </div>

            <button type="submit" className="w-full rounded-full bg-[#2F6B4A] hover:bg-[#3A8B5E] !outline-none focus:!ring-2 focus:!ring-[#2F6B4A]/50 focus:!ring-offset-2 text-white py-2.5 text-sm font-semibold shadow-md transition-all disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}