"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

type SentMessage = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  created_at: string;
  status: string;
};

export default function EmailSenderClient({ initialHistory }: { initialHistory: SentMessage[] }) {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [viewingEmail, setViewingEmail] = useState<SentMessage | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject, markdownBody: body }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send email');

      setRecipient("");
      setSubject("");
      setBody("");
      setShowPreview(false);
      router.refresh();
      
    } catch (error: any) {
      alert(error.message || "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="bg-card border border-border p-6 md:p-8 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold mb-6">Compose New Email</h2>
        <form onSubmit={handleSend} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <Input 
                type="email" 
                placeholder="member@example.com" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input 
                type="text" 
                placeholder="Important Update..." 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-3 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Message Body</label>
                <p className="text-xs text-muted-foreground font-mono">
                  Markdown: # H1 | ## H2 | **bold** | *italic* | [link](url) | - list
                </p>
              </div>
              <Button 
                type="button" 
                variant={showPreview ? "default" : "outline"}
                size="sm" 
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Keep Editing" : "Toggle Full Preview"}
              </Button>
            </div>
            
            {showPreview ? (
              <div className="min-h-[400px] border rounded-md bg-muted/20 p-4 sm:p-8 flex justify-center overflow-y-auto">
                
                <div className="w-full max-w-[600px] bg-white text-black rounded-lg overflow-hidden shadow-md border border-gray-200 h-fit">
                  
                  <div className="text-center pt-8 pb-4 bg-white">
                    <img 
                      src="/images/email.png" 
                      alt="Template Header Preview" 
                      className="max-w-[200px] h-auto inline-block" 
                    />
                  </div>

                  <div className="px-10 py-6 prose prose-sm max-w-none">
                    {body ? (
                      <ReactMarkdown>{body}</ReactMarkdown>
                    ) : (
                      <span className="text-gray-400 italic">No content provided...</span>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 border-t border-gray-200 px-10 py-8 text-center text-sm text-gray-500 flex flex-col gap-4">
                    
                    <div className="flex justify-center gap-5">
                      <img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook" className="w-8 h-8" />
                      <img src="https://img.icons8.com/color/48/000000/instagram-new.png" alt="Instagram" className="w-8 h-8" />
                      <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" className="w-8 h-8" />
                    </div>
                    
                    <div>
                      info@titanleos.org | <span className="text-blue-600">https://titanleos.org</span>
                    </div>
                    <div className="text-xs">
                      &copy; Leo Club of Pannipitiya Metro Titans 2026. All rights reserved.
                    </div>
                    <div className="text-xs text-blue-600 underline cursor-not-allowed">
                      Unsubscribe from marketing emails
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <Textarea 
                placeholder="Type your message here using markdown..." 
                className="min-h-[300px] resize-y p-4 text-base font-mono"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full md:w-auto md:px-10" disabled={isSending}>
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Email History</h2>
          <span className="text-sm text-muted-foreground">Click a row to read the email</span>
        </div>
        
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">To</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No emails sent yet.
                  </td>
                </tr>
              ) : (
                initialHistory.map((msg) => (
                  <tr 
                    key={msg.id} 
                    onClick={() => setViewingEmail(msg)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">
                      {msg.recipient}
                    </td>
                    <td className="px-6 py-4 truncate max-w-[250px]">{msg.subject}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-border flex justify-between items-start bg-muted/20">
              <div>
                <h3 className="text-xl font-bold">{viewingEmail.subject}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Sent to: <span className="text-foreground font-medium">{viewingEmail.recipient}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(viewingEmail.created_at).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewingEmail(null)}>
                Close
              </Button>
            </div>
            
            <div className="p-8 overflow-y-auto prose prose-sm md:prose-base max-w-none dark:prose-invert">
              <ReactMarkdown>{viewingEmail.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}