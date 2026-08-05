"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Trash2, Edit, Save, ArrowLeft, Loader2, MailCheck, Eye } from "lucide-react";

const DISTRICTS = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

const FIELD_LABELS: Record<string, string> = {
  member_type: "Member Type", previous_club: "Previous Club", lci_number: "LCI Number", is_inducted: "Inducted Before",
  full_name: "Full Name", name_initials: "Name with Initials", preferred_name: "Preferred Name", dob: "Date of Birth", gender: "Gender",
  nic: "NIC Number", whatsapp: "WhatsApp Number", email: "Email Address", address: "Address", street: "Street", city: "City",
  district: "District", zip_code: "Zip Code", current_status: "Current Status", travel_availability: "Travel Availability",
  after_6_availability: "After 6 PM Availability", weekend_availability: "Weekend Availability", committee_interest: "Committee Interest",
  committee_preference: "Committee Preference", contribution_level: "Contribution Level", parent_support: "Parent Support", limitations: "Limitations",
  emergency_name: "Emergency Name", emergency_relation: "Emergency Relation", emergency_contact: "Emergency Contact"
};

export default function MemberRequestsPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [approvalModal, setApprovalModal] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lciInput, setLciInput] = useState("");
  const [automatedNotes, setAutomatedNotes] = useState("");
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setApprovalModal(null);
      setShowPreview(false);
      if (!isEditing) setSelectedMember(null);
    }
  }, [isEditing]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openApprovalFlow = (member: any, notes: string = "") => {
    setApprovalModal(member);
    setLciInput(member.lci_number || "");
    setAutomatedNotes(notes);
  };

  const handleSaveAndApprove = async () => {
    const changes: string[] = [];
    Object.keys(FIELD_LABELS).forEach(key => {
      if (selectedMember[key] !== editData[key]) {
        changes.push(`- **${FIELD_LABELS[key]}**: updated to *${editData[key] || "N/A"}*`);
      }
    });

    const generatedNotes = changes.length > 0 
      ? `### Important Updates to Your Application\nOur team has made the following adjustments to your registration details:\n${changes.join("\n")}`
      : "";

    const { error } = await supabase.from("members").update(editData).eq("id", editData.id);
    if (error) {
      alert("Failed to save edits to database.");
      return;
    }
    setIsEditing(false);
    openApprovalFlow(editData, generatedNotes);
  };

  const confirmApproval = async () => {
    if (approvalModal.member_type === 'new' && !lciInput.trim()) {
      alert("Please provide an LCI number for this new member.");
      return;
    }

    setIsProcessing(true);

    const { error } = await supabase.from("members").update({ status: 'approved', lci_number: lciInput }).eq("id", approvalModal.id);
    if (error) {
      alert("Database Update Failed: " + error.message);
      setIsProcessing(false); return;
    }

    const lciSection = approvalModal.member_type === 'new'
      ? `<br><div style="text-align: center; border: 2px dashed #2D3F2B; padding: 20px; margin: 20px auto; border-radius: 12px; max-width: 320px; background-color: #F8FAFC;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #556B52; margin-bottom: 5px;">Your Official LCI Number</div>
            <div style="font-size: 32px; font-weight: 800; color: #2D3F2B; letter-spacing: 2px;">${lciInput}</div>
          </div>`
      : "";

    const waSection = `<div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
        <a href="https://chat.whatsapp.com/CNh61Xrknu2DnWoLUaFgY3" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: sans-serif; font-size: 16px; border: 2px solid #25D366; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="22" style="vertical-align: middle; margin-right: 10px;"/> 
          Join the Member WhatsApp Group
        </a>
      </div>`;

    const emailBody = `# Congratulations, ${approvalModal.preferred_name}! 🎉\n\nWelcome to the Leo Club of Pannipitiya Metro Titans!\n\nYour membership application for the Leoistic Year 2026/27 has been officially **approved**. We are thrilled to have you on board as an active Titan.\n\n${lciSection}\n\n${automatedNotes}\n\n${waSection}\n\nKeep an eye on the WhatsApp group and this email for updates regarding upcoming projects and meetings.\n\nBest regards,<br>Board of Directors<br>**Leo Club of Pannipitiya Metro Titans**`;

    try {
      const res = await fetch("/api/admin/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: approvalModal.email, subject: "Welcome to Titan Leos! 🎉", markdownBody: emailBody }),
      });
      if (!res.ok) alert("Email API Failed. Check logs.");
    } catch (err) { alert("Failed to reach email API."); }

    setApprovalModal(null);
    setSelectedMember(null);
    setIsProcessing(false);
    fetchPending();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;
    const { error } = await supabase.from("members").update({ status: 'rejected' }).eq("id", id);
    if (!error) { setSelectedMember(null); fetchPending(); }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this application?")) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) { setSelectedMember(null); fetchPending(); }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const generatePreviewHtml = () => {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://titanleos.org";
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; border-radius: 0 !important; }
          .header-img-container { padding: 25px 15px 0px 15px !important; }
          .body-content { padding: 15px 20px !important; font-size: 15px !important; }
          .body-content h1 { font-size: 22px !important; margin-top: 0 !important; margin-bottom: 15px !important; }
          .footer-content { padding: 10px 20px 30px 20px !important; }
        }
        .body-content h1 { margin-top: 0; font-size: 26px; color: #1a1a1a; }
        @keyframes wa-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .wa-btn { animation: wa-pulse 2s infinite; }
      </style>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; -webkit-font-smoothing: antialiased;">
      <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div class="header-img-container" style="text-align: center; padding: 35px 20px 0px 20px; background-color: #ffffff;">
          <img src="${SITE_URL}/images/email.png" alt="Titan Leos Header" style="max-width: 280px; height: auto; display: inline-block;" />
        </div>
        <div class="body-content" style="padding: 20px 40px 30px 40px; font-size: 16px; line-height: 1.6; color: #1a1a1a; background-color: #ffffff;">
          <h1 style="margin-top: 0; font-size: 26px; color: #1a1a1a;">Congratulations, John Doe! 🎉</h1>
          <p>Welcome to the Leo Club of Pannipitiya Metro Titans!</p>
          <p>Your membership application for the Leoistic Year 2026/27 has been officially <strong>approved</strong>. We are thrilled to have you on board as an active Titan.</p>
          <br>
          <div style="text-align: center; border: 2px dashed #2D3F2B; padding: 20px; margin: 20px auto; border-radius: 12px; max-width: 320px; background-color: #F8FAFC;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #556B52; margin-bottom: 5px;">Your Official LCI Number</div>
            <div style="font-size: 32px; font-weight: 800; color: #2D3F2B; letter-spacing: 2px;">9876543</div>
          </div>
          <br>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">Important Updates to Your Application</h4>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">Our team has made the following adjustments to your registration details:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e293b;">
              <li><strong>Name with Initials</strong>: updated to <em>J. Doe</em></li>
              <li><strong>WhatsApp Number</strong>: updated to <em>0771234567</em></li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="#" class="wa-btn" style="display: inline-block; background-color: #25D366; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: sans-serif; font-size: 16px; border: 2px solid #25D366;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="22" style="vertical-align: middle; margin-right: 10px;"/> 
              Join the Member WhatsApp Group
            </a>
          </div>
          <p>Keep an eye on the WhatsApp group and this email for updates regarding upcoming projects and meetings.</p>
          <p>Best regards,<br>Board of Directors<br><strong>Leo Club of Pannipitiya Metro Titans</strong></p>
        </div>
        <div class="footer-content" style="background-color: #ffffff; padding: 10px 40px 40px 40px; text-align: center; font-size: 13px; line-height: 1.5;">
          <!-- Prettier Social Icons -->
          <div style="margin-bottom: 24px;">
            <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://img.icons8.com/fluency/48/facebook-new.png" width="36" height="36" alt="Facebook" style="display: block; border: none;" />
            </a>
            <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://img.icons8.com/fluency/48/instagram-new.png" width="36" height="36" alt="Instagram" style="display: block; border: none;" />
            </a>
            <a href="#" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://img.icons8.com/fluency/48/linkedin.png" width="36" height="36" alt="LinkedIn" style="display: block; border: none;" />
            </a>
          </div>
          <div style="margin-bottom: 12px; font-weight: bold; font-size: 14px;">
            <a href="#" style="color: #2563eb; text-decoration: none;">info@titanleos.org</a>&nbsp;
            <span style="margin: 0 8px; color: #2563eb; font-weight: bold;">&bull;</span>&nbsp;
            <a href="#" style="color: #2563eb; text-decoration: none;">www.titanleos.org</a>
          </div>
          <div style="font-weight: bold; color: #4b5563;">&copy; Leo Club of Pannipitiya Metro Titans 2026. All rights reserved.</div>
        </div>
      </div>
      </body>
      </html>
    `;
  };

  if (loading) return <div className="p-8 text-muted-foreground animate-pulse">Loading requests...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/members"><Button variant="outline" size="icon" className="h-8 w-8 rounded-full"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <h1 className="text-3xl font-bold tracking-tight">Member Requests</h1>
          </div>
          <p className="text-muted-foreground mt-1">Review new applications waiting for approval.</p>
        </div>
        <Button variant="outline" className="bg-white" onClick={() => setShowPreview(true)}>
          <Eye className="w-4 h-4 mr-2" />
          Preview Email
        </Button>
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
                onClick={() => { setSelectedMember(member); setEditData(member); setIsEditing(false); }}
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
                  <button onClick={(e) => { e.stopPropagation(); openApprovalFlow(member); }} className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"><Check className="h-3.5 w-3.5 mr-1" /> Approve</button>
                  <button onClick={(e) => { e.stopPropagation(); handleReject(member.id); }} className="inline-flex items-center justify-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"><X className="h-3.5 w-3.5 mr-1" /> Reject</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteMember(member.id); }} className="inline-flex items-center justify-center rounded-full bg-gray-50 px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-200 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" /> Email Template Preview
              </h2>
              <button onClick={() => setShowPreview(false)} className="text-white/80 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-6">
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
                <iframe 
                  srcDoc={generatePreviewHtml()} 
                  className="w-full h-[650px] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {approvalModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setApprovalModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center">
                <MailCheck className="w-5 h-5 mr-2" /> Finalize Approval
              </h2>
              <button onClick={() => setApprovalModal(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <p className="text-sm text-gray-600">
                You are approving <strong>{approvalModal.full_name}</strong>. An automated welcome email will be sent to <strong>{approvalModal.email}</strong>.
              </p>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assign LCI Number {approvalModal.member_type === 'new' && <span className="text-red-500">*</span>}
                </label>
                <Input 
                  value={lciInput} 
                  onChange={(e) => setLciInput(e.target.value)} 
                  placeholder="e.g. 1234567" 
                  className="w-full"
                />
                {approvalModal.member_type === 'new' && (
                  <p className="text-xs text-amber-600 mt-1">Required for new members. Will be embedded in their welcome email.</p>
                )}
              </div>

              {automatedNotes && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Automated Notice</h4>
                  <p className="text-xs text-blue-700 font-medium">The following changes were detected and will be appended to the email:</p>
                  <div className="text-xs text-gray-700 mt-2 whitespace-pre-wrap font-mono bg-white/50 p-2 rounded border border-blue-50">{automatedNotes.replace(/### Important Updates to Your Application\nOur team has made the following adjustments to your registration details:\n/g, '')}</div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 shrink-0">
                <Button variant="outline" className="flex-1" onClick={() => setApprovalModal(null)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={confirmApproval} disabled={isProcessing}>
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
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative" onClick={e => e.stopPropagation()}>
            <div className="bg-white/95 backdrop-blur-sm border-b px-6 py-4 flex justify-between items-center z-10 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Registration Details" : "Review Full Application"}
                </h2>
                {!isEditing && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">Pending</span>}
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm" onClick={() => openApprovalFlow(selectedMember)}><Check className="w-4 h-4 mr-2" /> Approve</Button>
                    <Button variant="secondary" className="text-rose-600 bg-rose-50 hover:bg-rose-100" size="sm" onClick={() => handleReject(selectedMember.id)}><X className="w-4 h-4 mr-2" /> Reject</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" /> Edit & Approve</Button>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedMember(null)}><X className="w-5 h-5 text-gray-500" /></Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button className="bg-[#2D3F2B]" size="sm" onClick={handleSaveAndApprove}><Save className="w-4 h-4 mr-2" /> Save & Approve</Button>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50/50 overflow-y-auto">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailGroup title="Basics & Induction">
                    <InfoRow label="Member Type" value={selectedMember.member_type} />
                    {selectedMember.member_type === 'existing' && (
                      <><InfoRow label="Previous Club" value={selectedMember.previous_club} /><InfoRow label="LCI Number" value={selectedMember.lci_number} /></>
                    )}
                    <InfoRow label="Inducted Before?" value={selectedMember.is_inducted} />
                  </DetailGroup>
                  <DetailGroup title="Personal Information">
                    <InfoRow label="Full Name" value={selectedMember.full_name} /><InfoRow label="Name with Initials" value={selectedMember.name_initials} />
                    <InfoRow label="Preferred Name" value={selectedMember.preferred_name} /><InfoRow label="Date of Birth" value={selectedMember.dob} />
                    <InfoRow label="Gender" value={selectedMember.gender} /><InfoRow label="NIC Number" value={selectedMember.nic} />
                    <InfoRow label="Current Status" value={selectedMember.current_status} />
                  </DetailGroup>
                  <DetailGroup title="Contact & Location">
                    <InfoRow label="WhatsApp Number" value={selectedMember.whatsapp} /><InfoRow label="Email Address" value={selectedMember.email} />
                    <InfoRow label="Address" value={selectedMember.address} /><InfoRow label="Street" value={selectedMember.street} />
                    <InfoRow label="City" value={selectedMember.city} /><InfoRow label="District" value={selectedMember.district} />
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
                      <><InfoRow label="Committee Preference" value={selectedMember.committee_preference} /><InfoRow label="Expected Contribution" value={selectedMember.contribution_level} /></>
                    )}
                    <InfoRow label="Parents/Guardians Supportive?" value={selectedMember.parent_support} />
                    <InfoRow label="Limitations" value={selectedMember.limitations} />
                  </DetailGroup>
                  <DetailGroup title="Emergency Contact">
                    <InfoRow label="Contact Name" value={selectedMember.emergency_name} /><InfoRow label="Relationship" value={selectedMember.emergency_relation} />
                    <InfoRow label="Phone Number" value={selectedMember.emergency_contact} />
                  </DetailGroup>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">1. Basics</h3>
                    <EditField label="Member Type" name="member_type" type="select" options={["new", "existing"]} value={editData.member_type} onChange={handleEditChange} />
                    <EditField label="Previous Club" name="previous_club" value={editData.previous_club} onChange={handleEditChange} />
                    <EditField label="LCI Number" name="lci_number" value={editData.lci_number} onChange={handleEditChange} />
                    <EditField label="Inducted Before" name="is_inducted" type="select" options={["yes", "no"]} value={editData.is_inducted} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">2. Personal</h3>
                    <EditField label="Full Name" name="full_name" value={editData.full_name} onChange={handleEditChange} />
                    <EditField label="Name w/ Initials" name="name_initials" value={editData.name_initials} onChange={handleEditChange} />
                    <EditField label="Preferred Name" name="preferred_name" value={editData.preferred_name} onChange={handleEditChange} />
                    <EditField label="Date of Birth" name="dob" type="date" value={editData.dob} onChange={handleEditChange} />
                    <EditField label="Gender" name="gender" type="select" options={["Male", "Female", "Other"]} value={editData.gender} onChange={handleEditChange} />
                    <EditField label="NIC Number" name="nic" value={editData.nic} onChange={handleEditChange} />
                    <EditField label="Current Status" name="current_status" type="select" options={["Student (School)", "Undergraduate", "Employed", "Other"]} value={editData.current_status} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">3. Contact</h3>
                    <EditField label="WhatsApp" name="whatsapp" value={editData.whatsapp} onChange={handleEditChange} />
                    <EditField label="Email" name="email" type="email" value={editData.email} onChange={handleEditChange} />
                    <EditField label="Address" name="address" value={editData.address} onChange={handleEditChange} />
                    <EditField label="Street" name="street" value={editData.street} onChange={handleEditChange} />
                    <EditField label="City" name="city" value={editData.city} onChange={handleEditChange} />
                    <EditField label="District" name="district" type="select" options={DISTRICTS} value={editData.district} onChange={handleEditChange} />
                    <EditField label="Zip Code" name="zip_code" value={editData.zip_code} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">4. Availability</h3>
                    <EditField label="Travel (Kottawa/Raj)" name="travel_availability" type="select" options={["Yes", "No", "Maybe"]} value={editData.travel_availability} onChange={handleEditChange} />
                    <EditField label="After 6 PM" name="after_6_availability" type="select" options={["Yes", "No", "Sometimes"]} value={editData.after_6_availability} onChange={handleEditChange} />
                    <EditField label="Weekends" name="weekend_availability" type="select" options={["Yes", "No", "Sometimes"]} value={editData.weekend_availability} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">5. Committee</h3>
                    <EditField label="Interested?" name="committee_interest" type="select" options={["Yes", "No", "Maybe later"]} value={editData.committee_interest} onChange={handleEditChange} />
                    <EditField label="Preference" name="committee_preference" type="select" options={["Community Service", "Public Relations", "Finance/Fundraising", "Sports & Entertainment", "Membership & Leadership", "Other"]} value={editData.committee_preference} onChange={handleEditChange} />
                    <EditField label="Contribution" name="contribution_level" type="select" options={["Highly Active", "Active", "Moderate"]} value={editData.contribution_level} onChange={handleEditChange} />
                    <EditField label="Parent Support" name="parent_support" type="select" options={["Yes", "No", "Not Applicable"]} value={editData.parent_support} onChange={handleEditChange} />
                    <EditField label="Limitations" name="limitations" type="textarea" value={editData.limitations} onChange={handleEditChange} />
                  </div>
                  <div className="space-y-4 bg-white p-5 rounded-xl border">
                    <h3 className="font-bold border-b pb-2 text-gray-800">6. Emergency</h3>
                    <EditField label="Contact Name" name="emergency_name" value={editData.emergency_name} onChange={handleEditChange} />
                    <EditField label="Relationship" name="emergency_relation" value={editData.emergency_relation} onChange={handleEditChange} />
                    <EditField label="Phone Number" name="emergency_contact" value={editData.emergency_contact} onChange={handleEditChange} />
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

function EditField({ label, name, type = "text", value, onChange, options = [] }: any) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
      {type === "textarea" ? (
        <textarea name={name} value={value || ""} onChange={onChange} className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#2D3F2B] outline-none" rows={2} />
      ) : type === "select" ? (
        <select name={name} value={value || ""} onChange={onChange} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-[#2D3F2B] outline-none">
          <option value="">Select...</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={value || ""} onChange={onChange} className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:ring-1 focus:ring-[#2D3F2B] outline-none" />
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
      <h3 className="font-bold text-[#2D3F2B] mb-4 text-xs uppercase tracking-widest border-b border-gray-100 pb-2">{title}</h3>
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