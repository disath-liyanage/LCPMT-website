"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Trash2, Bell } from "lucide-react";

export default function MembersAdminPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (data) setMembers(data);

    const { count } = await supabase
      .from("members")
      .select('*', { count: 'exact', head: true })
      .eq("status", "pending");
      
    if (count !== null) setPendingCount(count);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelectedMember(null);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this member?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      setSelectedMember(null);
      fetchData();
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading approved members...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approved Members</h1>
          <p className="text-muted-foreground mt-1">Manage your active club members here.</p>
        </div>
        
        <Link href="/admin/members/requests">
          <Button className="relative bg-amber-500 hover:bg-amber-600 text-white">
            <Bell className="w-4 h-4 mr-2" />
            Member Requests
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                {pendingCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/80 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Committee</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No approved members yet.</td></tr>
            )}
            {members.map((member) => (
              <tr 
                key={member.id} 
                onClick={() => setSelectedMember(member)}
                className="hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{member.full_name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{member.member_type === 'existing' ? `LCI: ${member.lci_number}` : 'New Member (LCI: ' + (member.lci_number || 'N/A') + ')'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{member.whatsapp}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{member.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">{member.committee_preference}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(member.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                Member Details <span className="ml-3 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Approved</span>
              </h2>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => deleteMember(selectedMember.id)}><Trash2 className="w-4 h-4 mr-2" /> Revoke Membership</Button>
                <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-gray-500" /></Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailGroup title="Basics & Induction">
                  <InfoRow label="Member Type" value={selectedMember.member_type} />
                  <InfoRow label="Official LCI Number" value={selectedMember.lci_number} />
                  {selectedMember.member_type === 'existing' && (
                    <InfoRow label="Previous Club" value={selectedMember.previous_club} />
                  )}
                  <InfoRow label="Inducted Before?" value={selectedMember.is_inducted} />
                </DetailGroup>
                
                <DetailGroup title="Personal Information">
                  <InfoRow label="Full Name" value={selectedMember.full_name} />
                  <InfoRow label="Name with Initials" value={selectedMember.name_initials} />
                  <InfoRow label="Preferred Name" value={selectedMember.preferred_name} />
                  <InfoRow label="Date of Birth" value={selectedMember.dob} />
                  <InfoRow label="Gender" value={selectedMember.gender} />
                  <InfoRow label="NIC Number" value={selectedMember.nic} />
                  <InfoRow label="Current Status" value={selectedMember.current_status} />
                </DetailGroup>

                <DetailGroup title="Contact & Location">
                  <InfoRow label="WhatsApp Number" value={selectedMember.whatsapp} />
                  <InfoRow label="Email Address" value={selectedMember.email} />
                  <InfoRow label="Address" value={selectedMember.address} />
                  <InfoRow label="Street" value={selectedMember.street} />
                  <InfoRow label="City" value={selectedMember.city} />
                  <InfoRow label="District" value={selectedMember.district} />
                  <InfoRow label="Zip Code" value={selectedMember.zip_code} />
                </DetailGroup>

                <DetailGroup title="Availability & Logistics">
                  <InfoRow label="Can travel to Kottawa/Rajagiriya?" value={selectedMember.travel_availability} />
                  <InfoRow label="Available after 6 PM?" value={selectedMember.after_6_availability} />
                  <InfoRow label="Available on weekends?" value={selectedMember.weekend_availability} />
                </DetailGroup>

                <DetailGroup title="Committee & Contribution">
                  <InfoRow label="Committee Assigned" value={selectedMember.committee_preference} />
                  <InfoRow label="Expected Contribution" value={selectedMember.contribution_level} />
                  <InfoRow label="Parents/Guardians Supportive?" value={selectedMember.parent_support} />
                  <InfoRow label="Limitations" value={selectedMember.limitations} />
                </DetailGroup>

                <DetailGroup title="Emergency Contact">
                  <InfoRow label="Contact Name" value={selectedMember.emergency_name} />
                  <InfoRow label="Relationship" value={selectedMember.emergency_relation} />
                  <InfoRow label="Phone Number" value={selectedMember.emergency_contact} />
                </DetailGroup>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm h-full">
      <h3 className="font-bold text-[#2D3F2B] mb-4 text-xs uppercase tracking-widest border-b border-gray-200 pb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-900 mt-0.5">{value || "N/A"}</span>
    </div>
  );
}