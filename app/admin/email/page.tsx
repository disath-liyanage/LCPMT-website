"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

type SentMessage = {
  id: string;
  to: string;
  subject: string;
  date: string;
  status: "Sent" | "Failed";
};

export default function EmailSenderPage() {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [history, setHistory] = useState<SentMessage[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipient,
          subject: subject,
          markdownBody: body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      const newMessage: SentMessage = {
        id: data.id || Math.random().toString(36).substr(2, 9),
        to: recipient,
        subject,
        date: new Date().toLocaleString(),
        status: "Sent"
      };

      setHistory([newMessage, ...history]);
      
      setRecipient("");
      setSubject("");
      setBody("");
      setShowPreview(false);
      
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Email Sender
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Compose and send markdown formatted emails directly to members or custom addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSend} className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-sm">
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

            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Message Body (Markdown)</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit Content" : "Preview Markdown"}
                </Button>
              </div>
              
              {showPreview ? (
                <div className="min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm max-w-none dark:prose-invert">
                  {body ? (
                    <ReactMarkdown>{body}</ReactMarkdown>
                  ) : (
                    <span className="text-muted-foreground italic">Nothing to preview...</span>
                  )}
                </div>
              ) : (
                <Textarea 
                  placeholder="Type your message here using markdown..." 
                  className="min-h-[300px] resize-y"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSending}>
              {isSending ? "Sending..." : "Send Email"}
            </Button>
          </form>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-4">Sent Messages</h2>
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
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No emails sent yet.
                    </td>
                  </tr>
                ) : (
                  history.map((msg) => (
                    <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{msg.to}</td>
                      <td className="px-4 py-3 truncate max-w-[150px]">{msg.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">{msg.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          msg.status === "Sent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700"
                        }`}>
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
      </div>
    </div>
  );
}