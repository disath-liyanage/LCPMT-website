import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EmailSenderClient from "./EmailSenderClient";

export default async function EmailSenderPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: history, error } = await supabase
    .from("sent_emails")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching email history:", error);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col gap-12">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Email Sender
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Compose and send markdown formatted emails directly to members or custom addresses.
        </p>
      </div>

      <EmailSenderClient initialHistory={history || []} />
    </div>
  );
}