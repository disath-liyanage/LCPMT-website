"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Trash2, Edit, Save, ArrowLeft, Loader2, MailCheck } from "lucide-react";

export default function MemberRequestsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  const [approvalModal, setApprovalModal] = useState<any | null>(null);
  const [lciInput, setLciInput] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const supabase = createClient();

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data && !error) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openApprovalFlow = (member: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setApprovalModal(member);
    setLciInput(member.lci_number || "");
    setAdminNotes("");
  };

  const confirmApproval = async () => {
    if (approvalModal.member_type === 'new' && !lciInput.trim()) {
      alert("Please provide an LCI number for this new member.");
      return;
    }

    setIsProcessing(true);

    const { error } = await supabase
      .from("members")
      .update({ 
        status: 'approved',
        lci_number: lciInput 
      })
      .eq("id", approvalModal.id);
    
    if (error) {
      alert("Database Update Failed: " + error.message);
      setIsProcessing(false);
      return;
    }

    const notesSection = adminNotes.trim() 
      ? `\n\n### Admin Notice Regarding Your Application:\n*${adminNotes}*` 
      : "";

    const lciSection = approvalModal.member_type === 'new'
      ? `\n\n**Your Official LCI Number:** \`${lciInput}\``
      : "";

    const emailBody = `# Congratulations, ${approvalModal.preferred_name}! 🎉\n\nWelcome to the Leo Club of Pannipitiya Metro Titans!\n\nYour membership application for the Leoistic Year 2026/27 has been officially **approved**. We are thrilled to have you on board as an active Titan.${lciSection}${notesSection}\n\n### Your Finalized Details\n- **Full Name:** ${approvalModal.full_name}\n- **Assigned Committee:** ${approvalModal.committee_preference}\n- **WhatsApp:** ${approvalModal.whatsapp}\n\nKeep an eye on your WhatsApp and this email for updates regarding upcoming projects and meetings.\n\nBest regards,\nBoard of Directors\n**Leo Club of Pannipitiya Metro Titans**`;

    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: approvalModal.email,
          subject: "Welcome to Titan Leos! 🎉",
          markdownBody: emailBody
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Email API Failed: " + (errorData.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to reach email API.");
    }

    setApprovalModal(null);
    setIsProcessing(false);
    fetchPending();
  };

  const handleReject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to reject this application?")) return;

    const { error } = await supabase.from("members").update({ status: 'rejected' }).eq("id", id);
    if (error) {
      alert("Reject Failed: " + error.message);
    } else {
      fetchPending();
    }
  };

  const deleteMember = async (id: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      alert("Delete Failed: " + error.message);
    } else {
      setSelectedMember(null);
      fetchPending();
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    const { error } = await supabase.from("members").update(editData).eq("id", editData.id);
    if (!error) {
      setIsEditing(false);
      setSelectedMember(editData);
      fetchPending();
    } else {
      alert("Failed to save edits: " + error.message);
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
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/80 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Applicant Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Contact Info</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No pending requests right now.</td></tr>
            )}
            {members.map((member) => (
              <tr 
                key={member.id} 
                onClick={() => {
                  setSelectedMember(member); 
                  setEditData(member); 
                  setIsEditing(false);
                }}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
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
                  <span className="capitalize text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">{member.member_type}</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={(e) => openApprovalFlow(member, e)} 
                    className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" /> Approve
                  </button>
                  <button 
                    onClick={(e) => handleReject(member.id, e)} 
                    className="inline-flex items-center justify-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Reject
                  </button>
                  <button 
                    onClick={(e) => deleteMember(member.id, e)} 
                    className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {approvalModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center">
                <MailCheck className="w-5 h-5 mr-2" /> Finalize Approval
              </h2>
              <button onClick={() => setApprovalModal(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-600">
                You are approving <strong>{approvalModal.full_name}</strong>. An automated welcome email will be sent to <strong>{approvalModal.email}</strong>.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Assign LCI Number {approvalModal.member_type === 'new' && <span className="text-red-500">*</span>}
                </label>
                <Input 
                  value={lciInput} 
                  onChange={(e) => setLciInput(e.target.value)} 
                  placeholder="e.g. 1234567" 
                  className="w-full"
                />
                {approvalModal.member_type === 'new' && (
                  <p className="text-xs text-amber-600 mt-1">Required for new members. This will be included in their email.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notice of Changes (Optional)</label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. We updated your committee preference from PR to Finance based on current club requirements."
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">If you edited their application, mention it here so they know.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="w-full" onClick={() => setApprovalModal(null)}>Cancel</Button>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={confirmApproval} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Approve & Send Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMember && !approvalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => !isEditing && setSelectedMember(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Request" : "Review Full Application"}
                </h2>
                {!isEditing && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>}
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" /> Edit Details</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button className="bg-[#2D3F2B]" size="sm" onClick={saveEdit}><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-gray-500" /></Button>
              </div>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailGroup title="Basics & Induction">
                    <InfoRow label="Member Type" value={selectedMember.member_type} />
                    {selectedMember.member_type === 'existing' && (
                      <>
                        <InfoRow label="Previous Club" value={selectedMember.previous_club} />
                        <InfoRow label="LCI Number" value={selectedMember.lci_number} />
                      </>
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
                    <InfoRow label="Interested in Committee?" value={selectedMember.committee_interest} />
                    {selectedMember.committee_interest !== "No" && (
                      <>
                        <InfoRow label="Committee Preference" value={selectedMember.committee_preference} />
                        <InfoRow label="Expected Contribution" value={selectedMember.contribution_level} />
                      </>
                    )}
                    <InfoRow label="Parents/Guardians Supportive?" value={selectedMember.parent_support} />
                    <InfoRow label="Limitations" value={selectedMember.limitations} />
                  </DetailGroup>

                  <DetailGroup title="Emergency Contact">
                    <InfoRow label="Contact Name" value={selectedMember.emergency_name} />
                    <InfoRow label="Relationship" value={selectedMember.emergency_relation} />
                    <InfoRow label="Phone Number" value={selectedMember.emergency_contact} />
                  </DetailGroup>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Personal Info</h3>
                    <div><label className="text-xs font-bold text-gray-500">Full Name</label><input name="full_name" value={editData.full_name} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">Preferred Name</label><input name="preferred_name" value={editData.preferred_name} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">WhatsApp</label><input name="whatsapp" value={editData.whatsapp} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">Email</label><input name="email" value={editData.email} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">District</label><input name="district" value={editData.district} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">Club Settings</h3>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Member Type</label>
                      <select name="member_type" value={editData.member_type} onChange={handleEditChange} className="w-full border rounded p-2 text-sm">
                        <option value="new">New Member</option>
                        <option value="existing">Existing Leo</option>
                      </select>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500">Committee Preference</label><input name="committee_preference" value={editData.committee_preference} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" /></div>
                    <div><label className="text-xs font-bold text-gray-500">Limitations</label><textarea name="limitations" value={editData.limitations} onChange={handleEditChange} className="w-full border rounded p-2 text-sm" rows={3}></textarea></div>
                  </div>
                </div>
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