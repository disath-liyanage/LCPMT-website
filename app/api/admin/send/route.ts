import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { marked } from "marked";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://titanleos.org";

function buildEmailTemplate(contentHtml: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; -webkit-font-smoothing: antialiased;">
      
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header Image -->
        <div style="text-align: center; padding: 30px 20px 10px 20px; background-color: #ffffff;">
          <img src="${SITE_URL}/images/email.png" alt="Titan Leos Header" style="max-width: 200px; height: auto; display: inline-block;" />
        </div>
        
        <!-- Body Content -->
        <div style="padding: 30px 40px; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
          ${contentHtml}
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 30px 20px; text-align: center; font-size: 13px; color: #6b7280; line-height: 1.5;">
          
          <div style="margin-bottom: 20px;">
            <a href="https://facebook.com" style="text-decoration: none; margin: 0 10px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="28" height="28" alt="Facebook" style="display: block; border: none;" />
            </a>
            <a href="https://instagram.com" style="text-decoration: none; margin: 0 10px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="28" height="28" alt="Instagram" style="display: block; border: none;" />
            </a>
            <a href="https://linkedin.com" style="text-decoration: none; margin: 0 10px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="28" height="28" alt="LinkedIn" style="display: block; border: none;" />
            </a>
          </div>
          
          <div style="margin-bottom: 15px;">
            <a href="mailto:info@titanleos.org" style="color: #2563eb; text-decoration: none;">info@titanleos.org</a> | 
            <a href="https://titanleos.org" style="color: #2563eb; text-decoration: none;">https://titanleos.org</a>
          </div>
          
          <div style="margin-bottom: 15px;">
            &copy; Leo Club of Pannipitiya Metro Titans 2026. All rights reserved.
          </div>
          
          <div>
            <a href="${SITE_URL}/unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe from marketing emails</a>
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

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
    return NextResponse.json({ error: "RESEND_API_KEY is missing." }, { status: 503 });
  }

  try {
    // The markdown body gets converted to HTML here, which inherently applies standard h1, h2 tags that email clients respect.
    const rawHtml = await marked.parse(markdownBody);
    const fullEmailHtml = buildEmailTemplate(rawHtml);

    const data = await resend.emails.send({
      from: "Titan Leos <info@titanleos.org>",
      to: to,
      subject: subject,
      html: fullEmailHtml,
      text: markdownBody, 
    });

    if (data.error) throw new Error(data.error.message);

    const { error: dbError } = await supabase
      .from('sent_emails')
      .insert([{ recipient: to, subject: subject, body: markdownBody, status: "Sent" }]);

    if (dbError) {
      console.error("Database save failed:", dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}