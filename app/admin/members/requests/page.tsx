"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2, Edit, Save, ArrowLeft } from "lucide-react";

export default function MemberRequestsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  const supabase = createClient();

  const fetchPending = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("members").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setSelectedMember(null);
      fetchPending();
    } else {
      alert("Failed to update status.");
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this request?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      setSelectedMember(null);
      fetchPending();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("members").update(editData).eq("id", editData.id);
    if (!error) {
      setIsEditing(false);
      setSelectedMember(editData);
      fetchPending();
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading requests...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/members">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Member Requests</h1>
          </div>
          <p className="text-muted-foreground mt-1">Review new applications waiting for approval.</p>
        </div>
      </div>
      
      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/80 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Applicant Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending requests.</td></tr>
            )}
            {members.map((member) => (
              <tr 
                key={member.id} 
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  setSelectedMember(member); 
                  setEditData(member); 
                  setIsEditing(false);
                }}
                className="hover:bg-amber-50/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{member.full_name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{member.district}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{member.whatsapp}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold">{member.member_type}</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button size="sm" onClick={() => updateStatus(member.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(member.id, 'rejected')} className="h-8 px-3 text-rose-600 hover:bg-rose-50">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Request" : "Review Request"}
                </h2>
                {!isEditing && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>}
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => updateStatus(selectedMember.id, 'approved')}><Check className="w-4 h-4 mr-2" /> Approve</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteMember(selectedMember.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button className="bg-[#2D3F2B]" size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-2" /> Save</Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-gray-500" /></Button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {!isEditing ? (
                <>
                  <DetailGroup title="Personal Info">
                    <InfoRow label="Full Name" value={selectedMember.full_name} />
                    <InfoRow label="Preferred Name" value={selectedMember.preferred_name} />
                    <InfoRow label="DOB" value={selectedMember.dob} />
                    <InfoRow label="Gender" value={selectedMember.gender} />
                    <InfoRow label="NIC" value={selectedMember.nic} />
                  </DetailGroup>
                  <DetailGroup title="Contact & Location">
                    <InfoRow label="WhatsApp" value={selectedMember.whatsapp} />
                    <InfoRow label="Email" value={selectedMember.email} />
                    <InfoRow label="District" value={selectedMember.district} />
                    <InfoRow label="Address" value={`${selectedMember.street}, ${selectedMember.city}`} />
                  </DetailGroup>
                  <DetailGroup title="Club Details">
                    <InfoRow label="Type" value={selectedMember.member_type} />
                    {selectedMember.member_type === 'existing' && (
                      <InfoRow label="Previous Club" value={selectedMember.previous_club} />
                    )}
                    <InfoRow label="Committee Pref" value={selectedMember.committee_preference} />
                    <InfoRow label="Contribution" value={selectedMember.contribution_level} />
                  </DetailGroup>
                  <DetailGroup title="Emergency Contact">
                    <InfoRow label="Name" value={selectedMember.emergency_name} />
                    <InfoRow label="Relation" value={selectedMember.emergency_relation} />
                    <InfoRow label="Contact" value={selectedMember.emergency_contact} />
                  </DetailGroup>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Personal Info</h3>
                    <div><label className="text-xs font-bold text-gray-500">Full Name</label><input name="full_name" value={editData.full_name} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">WhatsApp</label><input name="whatsapp" value={editData.whatsapp} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">District</label><input name="district" value={editData.district} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Club Settings</h3>
                    <div><label className="text-xs font-bold text-gray-500">Committee Pref</label><input name="committee_preference" value={editData.committee_preference} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">Limitations</label><input name="limitations" value={editData.limitations} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <h3 className="font-bold text-[#2D3F2B] mb-3 text-sm uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "N/A"}</span>
    </div>
  );
}