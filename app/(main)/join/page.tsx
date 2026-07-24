"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasLimitations, setHasLimitations] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dbError, setDbError] = useState("");
  
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    member_type: "", previous_club: "", lci_number: "", is_inducted: "",
    full_name: "", name_initials: "", preferred_name: "", dob: "", gender: "", 
    nic: "", whatsapp: "", email: "", address: "", street: "", city: "", 
    district: "", zip_code: "", current_status: "", travel_availability: "", 
    after_6_availability: "", weekend_availability: "", committee_interest: "",
    committee_preference: "", contribution_level: "", parent_support: "", limitations: "",
    emergency_name: "", emergency_relation: "", emergency_contact: "",
    agreed_true: false, agreed_active: false, agreed_fee: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLimitationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setHasLimitations(val);
    if (val === "No") {
      setFormData(prev => ({ ...prev, limitations: "None" }));
    } else {
      setFormData(prev => ({ ...prev, limitations: "" }));
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setDbError("");
    
    if (step === 2 && formData.committee_interest === "No") {
      setStep(4);
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      submitForm();
    }
  };

  const handleBackStep = () => {
    setDbError("");
    if (step === 4 && formData.committee_interest === "No") {
      setStep(2);
    } else {
      setStep(step - 1);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setDbError("");

    const { error } = await supabase.from("members").insert([formData]);
    
    if (error) {
      console.error("Supabase Error:", error);
      setDbError(error.message || "Failed to connect to the database. Check your permissions.");
      setLoading(false);
    } else {
      setIsSubmitted(true);
      setLoading(false);
    }
  };

  const labelClass = "block text-sm font-medium mb-1.5 text-gray-800 drop-shadow-sm";
  
  const inputClass = "w-full bg-white/10 backdrop-blur-xl border border-white/20 focus:bg-white/20 focus:border-white/40 transition-all py-3 px-4 rounded-2xl text-sm shadow-[0_2px_10px_rgba(0,0,0,0.05)] outline-none placeholder:text-gray-500/80 text-gray-900";

  return (
    <div className="min-h-screen relative flex items-start justify-center pt-32 pb-20 px-4">
      <div className="w-full max-w-3xl p-6 md:p-8 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        
        {isSubmitted ? (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#2D3F2B] mb-4">Application Submitted!</h2>
            <p className="text-gray-700 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Thank you for registering. Your application has been sent to our admin team and is currently pending review. We will contact you soon!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-md bg-[#2D3F2B] px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-[#1C2B1E]"
            >
              Back to Main Site
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 border-b border-gray-300/50 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3F2B] mb-2 drop-shadow-sm">Leo Club of Pannipitiya Metro Titans</h1>
              <p className="text-gray-700 font-medium">Member Registration Form 2026/27</p>
            </div>

            {dbError && (
              <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-800 rounded-xl text-sm font-medium">
                <strong>Submission Failed:</strong> {dbError}
              </div>
            )}

            <form onSubmit={handleNextStep} className="space-y-6">
              
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <label className={labelClass}>Are you a new member or an existing Leo? *</label>
                    <select name="member_type" required onChange={handleChange} value={formData.member_type} className={inputClass}>
                      <option value="" className="text-gray-900">Select...</option>
                      <option value="new" className="text-gray-900">New Member</option>
                      <option value="existing" className="text-gray-900">Existing Leo</option>
                    </select>
                  </div>
                  
                  {formData.member_type === "existing" && (
                    <div className="space-y-5 p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
                      <div>
                        <label className={labelClass}>Previous club name *</label>
                        <Input name="previous_club" required onChange={handleChange} value={formData.previous_club} className={inputClass} placeholder="e.g. Leo Club of Colombo" />
                      </div>
                      <div>
                        <label className={labelClass}>Current LCI Number *</label>
                        <p className="text-xs text-gray-600 mb-2">Contact your previous president if you don't know this.</p>
                        <Input name="lci_number" required onChange={handleChange} value={formData.lci_number} className={inputClass} placeholder="Enter your LCI Number" />
                      </div>
                      <div>
                        <label className={labelClass}>Have you officially been inducted as a Leo before? *</label>
                        <select name="is_inducted" required onChange={handleChange} value={formData.is_inducted} className={inputClass}>
                          <option value="" className="text-gray-900">Select...</option>
                          <option value="yes" className="text-gray-900">Yes</option>
                          <option value="no" className="text-gray-900">No</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold text-[#2D3F2B] border-b border-gray-300/50 pb-2">Personal Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className={labelClass}>Full Name *</label><Input name="full_name" required onChange={handleChange} value={formData.full_name} className={inputClass} placeholder="e.g. John Doe Smith" /></div>
                    <div><label className={labelClass}>Name with Initials *</label><Input name="name_initials" required onChange={handleChange} value={formData.name_initials} className={inputClass} placeholder="e.g. J.D. Smith" /></div>
                    <div><label className={labelClass}>Preferred Name (Two names pair) *</label><Input name="preferred_name" required onChange={handleChange} value={formData.preferred_name} className={inputClass} placeholder="e.g. John Smith" /></div>
                    <div><label className={labelClass}>Date of Birth *</label><Input type="date" name="dob" required onChange={handleChange} value={formData.dob} className={inputClass} /></div>
                    
                    <div>
                      <label className={labelClass}>Gender *</label>
                      <select name="gender" required onChange={handleChange} value={formData.gender} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Male" className="text-gray-900">Male</option>
                        <option value="Female" className="text-gray-900">Female</option>
                        <option value="Other" className="text-gray-900">Other</option>
                      </select>
                    </div>
                    
                    <div><label className={labelClass}>NIC Number *</label><Input name="nic" required onChange={handleChange} value={formData.nic} className={inputClass} placeholder="e.g. 200012345678" /></div>
                    <div><label className={labelClass}>Contact Number (WhatsApp) *</label><Input name="whatsapp" required onChange={handleChange} value={formData.whatsapp} className={inputClass} placeholder="e.g. 077 123 4567" /></div>
                    <div><label className={labelClass}>Email Address *</label><Input type="email" name="email" required onChange={handleChange} value={formData.email} className={inputClass} placeholder="e.g. john@example.com" /></div>
                    
                    <div className="md:col-span-2"><label className={labelClass}>Residential Address *</label><Input name="address" required onChange={handleChange} value={formData.address} className={inputClass} placeholder="e.g. 123, Main Street, Town" /></div>
                    <div><label className={labelClass}>Street Name *</label><Input name="street" required onChange={handleChange} value={formData.street} className={inputClass} placeholder="e.g. Main Street" /></div>
                    <div><label className={labelClass}>City *</label><Input name="city" required onChange={handleChange} value={formData.city} className={inputClass} placeholder="e.g. Pannipitiya" /></div>
                    
                    <div>
                      <label className={labelClass}>District *</label>
                      <select name="district" required onChange={handleChange} value={formData.district} className={inputClass}>
                        <option value="" className="text-gray-900">Select District...</option>
                        {["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"].map(d => (
                          <option key={d} value={d} className="text-gray-900">{d}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div><label className={labelClass}>Zip/Postal Code</label><Input name="zip_code" onChange={handleChange} value={formData.zip_code} className={inputClass} placeholder="e.g. 10230" /></div>
                    
                    <div>
                      <label className={labelClass}>Current status *</label>
                      <select name="current_status" required onChange={handleChange} value={formData.current_status} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Student (School)" className="text-gray-900">Student (School)</option>
                        <option value="Undergraduate" className="text-gray-900">Undergraduate</option>
                        <option value="Employed" className="text-gray-900">Employed</option>
                        <option value="Other" className="text-gray-900">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-300/50">
                    <div>
                      <label className={labelClass}>Are you able to travel to Kottawa/Rajagiriya nearby areas for physical projects and meetings? *</label>
                      <select name="travel_availability" required onChange={handleChange} value={formData.travel_availability} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Yes" className="text-gray-900">Yes</option>
                        <option value="No" className="text-gray-900">No</option>
                        <option value="Maybe" className="text-gray-900">Maybe</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={labelClass}>Are you usually available after 6.00 PM for meetings or project discussions? *</label>
                      <select name="after_6_availability" required onChange={handleChange} value={formData.after_6_availability} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Yes" className="text-gray-900">Yes</option>
                        <option value="No" className="text-gray-900">No</option>
                        <option value="Sometimes" className="text-gray-900">Sometimes</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Are you usually available during weekends for projects? *</label>
                      <select name="weekend_availability" required onChange={handleChange} value={formData.weekend_availability} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Yes" className="text-gray-900">Yes</option>
                        <option value="No" className="text-gray-900">No</option>
                        <option value="Sometimes" className="text-gray-900">Sometimes</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Are you interested in taking responsibilities in a committee? *</label>
                      <select name="committee_interest" required onChange={handleChange} value={formData.committee_interest} className={inputClass}>
                        <option value="" className="text-gray-900">Select...</option>
                        <option value="Yes" className="text-gray-900">Yes</option>
                        <option value="No" className="text-gray-900">No</option>
                        <option value="Maybe later" className="text-gray-900">Maybe later</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold text-[#2D3F2B] border-b border-gray-300/50 pb-2">Committee Member</h2>
                  
                  <div>
                    <label className={labelClass}>Which committee would you prefer to be part of? *</label>
                    <select name="committee_preference" required onChange={handleChange} value={formData.committee_preference} className={inputClass}>
                      <option value="" className="text-gray-900">Select...</option>
                      <option value="Community Service" className="text-gray-900">Community Service</option>
                      <option value="Public Relations" className="text-gray-900">Public Relations</option>
                      <option value="Finance/Fundraising" className="text-gray-900">Finance / Fundraising</option>
                      <option value="Sports & Entertainment" className="text-gray-900">Sports & Entertainment</option>
                      <option value="Membership & Leadership" className="text-gray-900">Membership & Leadership</option>
                      <option value="Other" className="text-gray-900">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>How actively can you contribute to club activities? *</label>
                    <select name="contribution_level" required onChange={handleChange} value={formData.contribution_level} className={inputClass}>
                      <option value="" className="text-gray-900">Select...</option>
                      <option value="Highly Active" className="text-gray-900">Highly Active (Can take lead roles)</option>
                      <option value="Active" className="text-gray-900">Active (Can participate regularly)</option>
                      <option value="Moderate" className="text-gray-900">Moderate (Depends on schedule)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Are your parents/guardians aware and supportive of your involvement in Leo activities? *</label>
                    <select name="parent_support" required onChange={handleChange} value={formData.parent_support} className={inputClass}>
                      <option value="" className="text-gray-900">Select...</option>
                      <option value="Yes" className="text-gray-900">Yes</option>
                      <option value="No" className="text-gray-900">No</option>
                      <option value="Not Applicable" className="text-gray-900">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Do you have any limitations we should know about? (e.g. transport issues, exams) *</label>
                    <select required onChange={handleLimitationsChange} value={hasLimitations} className={inputClass}>
                      <option value="" className="text-gray-900">Select...</option>
                      <option value="Yes" className="text-gray-900">Yes</option>
                      <option value="No" className="text-gray-900">No</option>
                    </select>
                  </div>

                  {hasLimitations === "Yes" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className={labelClass}>Please specify your limitations: *</label>
                      <textarea name="limitations" required onChange={handleChange} value={formData.limitations} className={`${inputClass} min-h-[100px] resize-y`} placeholder="e.g. I have university exams coming up in November..."></textarea>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold text-[#2D3F2B] border-b border-gray-300/50 pb-2">Emergency Contact</h2>
                  <div><label className={labelClass}>Emergency Contact Person’s Name *</label><Input name="emergency_name" required onChange={handleChange} value={formData.emergency_name} className={inputClass} placeholder="e.g. Jane Smith" /></div>
                  <div><label className={labelClass}>Relationship to You *</label><Input name="emergency_relation" required onChange={handleChange} value={formData.emergency_relation} className={inputClass} placeholder="e.g. Mother" /></div>
                  <div><label className={labelClass}>Emergency Contact Number *</label><Input name="emergency_contact" required onChange={handleChange} value={formData.emergency_contact} className={inputClass} placeholder="e.g. 077 987 6543" /></div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-semibold text-[#2D3F2B] border-b border-gray-300/50 pb-2">Declaration</h2>
                  
                  <label className="flex items-start gap-3 p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/30 cursor-pointer transition-colors shadow-sm">
                    <input type="checkbox" name="agreed_true" required onChange={handleChange} checked={formData.agreed_true} className="mt-1 h-5 w-5 rounded text-[#2D3F2B] border-gray-300 focus:ring-[#2D3F2B]" />
                    <span className="text-sm font-semibold text-gray-800 leading-relaxed drop-shadow-sm">I confirm that the details provided above are true and accurate. *</span>
                  </label>
                  
                  <label className="flex items-start gap-3 p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/30 cursor-pointer transition-colors shadow-sm">
                    <input type="checkbox" name="agreed_active" required onChange={handleChange} checked={formData.agreed_active} className="mt-1 h-5 w-5 rounded text-[#2D3F2B] border-gray-300 focus:ring-[#2D3F2B]" />
                    <span className="text-sm font-semibold text-gray-800 leading-relaxed drop-shadow-sm">I understand that being a Leo member requires active participation, responsibility, teamwork, and commitment towards service. *</span>
                  </label>
                  
                  <label className="flex items-start gap-3 p-5 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:bg-white/30 cursor-pointer transition-colors shadow-sm">
                    <input type="checkbox" name="agreed_fee" required onChange={handleChange} checked={formData.agreed_fee} className="mt-1 h-5 w-5 rounded text-[#2D3F2B] border-gray-300 focus:ring-[#2D3F2B]" />
                    <span className="text-sm font-semibold text-gray-800 leading-relaxed drop-shadow-sm">I understand that an annual membership fee / club dues must be paid to continue as an active member of the Leo Club of Pannipitiya Metro Titans for the Leoistic Year 2026/27. *</span>
                  </label>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-gray-300/50 mt-8">
                {step > 1 ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBackStep}
                    className="bg-white/50 backdrop-blur-md border-white/60 hover:bg-white/80 text-gray-800 font-semibold shadow-sm px-6"
                  >
                    Back
                  </Button>
                ) : <div></div>}
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-[#2D3F2B] hover:bg-[#1C2B1E] text-white px-8 font-semibold shadow-md transition-all active:scale-95"
                >
                  {step === 5 ? (loading ? "Submitting..." : "Submit Application") : "Next Section"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}