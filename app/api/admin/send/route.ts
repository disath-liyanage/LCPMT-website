import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { marked } from "marked";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { to, subject, markdownBody } = body;

  if (!to?.trim() || !subject?.trim() || !markdownBody?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!resend) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 503 });
  }

  try {
    const htmlContent = await marked.parse(markdownBody);

    const data = await resend.emails.send({
      from: "Titan Leos Admin <noreply@titanleos.org>",
      to: to,
      subject: subject,
      html: htmlContent,
      text: markdownBody, 
    });

    if (data.error) throw new Error(data.error.message);

    const { error: dbError } = await supabase
      .from('sent_emails')
      .insert([
        { recipient: to, subject: subject, body: markdownBody, status: "Sent" }
      ]);

    if (dbError) console.error("Failed to save email to db:", dbError);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}