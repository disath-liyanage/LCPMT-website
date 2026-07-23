"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type SentMessage = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  created_at: string;
  status: string;
};

const EmailPreviewShell = ({ markdownContent }: { markdownContent: string }) => (
  <div className="w-full max-w-[600px] mx-auto bg-white text-black rounded-lg overflow-hidden shadow-lg border border-gray-200">
    <div className="text-center pt-8 pb-4 bg-white">
      <img 
        src="/images/email.png" 
        alt="Template Header" 
        className="max-w-[200px] h-auto inline-block" 
      />
    </div>
    <div className="px-10 py-6 text-left">
      {markdownContent ? (
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '16px 0', color: '#000' }} {...props} />,
            h2: ({node, ...props}) => <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '14px 0', color: '#000' }} {...props} />,
            h3: ({node, ...props}) => <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '12px 0', color: '#000' }} {...props} />,
            p:  ({node, ...props}) => <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '12px 0', color: '#1a1a1a' }} {...props} />,
            ul: ({node, ...props}) => <ul style={{ margin: '12px 0', paddingLeft: '24px', listStyleType: 'disc' }} {...props} />,
            ol: ({node, ...props}) => <ol style={{ margin: '12px 0', paddingLeft: '24px', listStyleType: 'decimal' }} {...props} />,
            li: ({node, ...props}) => <li style={{ marginBottom: '8px' }} {...props} />,
            a:  ({node, ...props}) => <a style={{ color: '#2563eb', textDecoration: 'underline' }} {...props} />,
            strong: ({node, ...props}) => <strong style={{ fontWeight: 'bold' }} {...props} />,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      ) : (
        <span className="text-gray-400 italic">No content provided...</span>
      )}
    </div>
    <div className="bg-gray-50 border-t border-gray-200 px-10 py-8 text-center text-sm text-gray-500 flex flex-col gap-4">
      <div className="flex justify-center gap-6">
        <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" className="w-7 h-7" />
        <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" className="w-7 h-7" />
        <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" className="w-7 h-7" />
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
);

export default function EmailSenderClient({ initialHistory }: { initialHistory: SentMessage[] }) {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [viewingEmail, setViewingEmail] = useState<SentMessage | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingEmail(null);
    };
    if (viewingEmail) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingEmail]);

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
              <div className="min-h-[400px] border rounded-md bg-muted/20 p-4 sm:p-8 flex justify-center">
                <EmailPreviewShell markdownContent={body} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6">
          
          <button 
            onClick={() => setViewingEmail(null)}
            className="fixed top-6 right-6 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md border border-black/20 dark:border-white/20 text-foreground hover:bg-black/20 dark:hover:bg-white/20 transition-all shadow-lg"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl">
            <EmailPreviewShell markdownContent={viewingEmail.body} />
          </div>
        </div>
      )}
    </div>
  );
}