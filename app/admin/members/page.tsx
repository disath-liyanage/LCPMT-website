"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";

export default function MembersAdminPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setMembers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("members")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status.");
      console.error(error);
    } else {
      fetchMembers();
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this application? This cannot be undone.")) return;
    
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      alert("Failed to delete record.");
    } else {
      fetchMembers();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
          <p className="text-muted-foreground mt-1">Review and approve new member applications.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-sm font-medium">
          Total Applications: {members.length}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Applicant Name</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Contact Info</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Committee</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No applications found in the database.
                  </td>
                </tr>
              )}
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.full_name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{member.preferred_name} • {member.dob}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{member.whatsapp}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-gray-700">{member.member_type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {member.committee_preference}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      member.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {member.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(member.id, 'approved')} 
                        className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                    {member.status !== 'rejected' && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => updateStatus(member.id, 'rejected')}
                        className="h-8 px-3 text-rose-600 hover:bg-rose-50"
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => deleteMember(member.id)}
                      className="h-8 px-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}