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
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          markdownBody: body,
        }),
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
      <form onSubmit={handleSend} className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Recipient Address</label>
            <Input 
              type="email" 
              placeholder="member@example.com" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Input 
              type="text" 
              placeholder="Important Update..." 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Message Body (Markdown)</label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "Edit Content" : "Preview Markdown"}
            </Button>
          </div>
          
          {showPreview ? (
            <div className="min-h-[250px] p-4 border rounded-md bg-muted/30 prose prose-sm max-w-none dark:prose-invert">
              {body ? (
                <ReactMarkdown>{body}</ReactMarkdown>
              ) : (
                <span className="text-muted-foreground italic">Nothing to preview...</span>
              )}
            </div>
          ) : (
            <Textarea 
              placeholder="Type your message here using markdown..." 
              className="min-h-[250px] resize-y"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          )}
        </div>

        <Button type="submit" className="w-full md:w-auto md:px-8" disabled={isSending}>
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </form>

      <div className="flex flex-col">
        <h2 className="text-xl font-bold mb-4">Email History</h2>
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No emails sent yet.
                  </td>
                </tr>
              ) : (
                initialHistory.map((msg) => (
                  <tr 
                    key={msg.id} 
                    onClick={() => setViewingEmail(msg)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium">{msg.recipient}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{msg.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
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
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{viewingEmail.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sent to: <span className="text-foreground">{viewingEmail.recipient}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(viewingEmail.created_at).toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewingEmail(null)}>
                Close
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{viewingEmail.body}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}