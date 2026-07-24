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
        <div style="text-align: center; padding: 40px 20px 10px 20px; background-color: #ffffff;">
          <img src="${SITE_URL}/email.png" alt="Titan Leos Header" style="max-width: 280px; height: auto; display: inline-block;" />
        </div>
        
        <!-- Body Content -->
        <div style="padding: 30px 40px; font-size: 16px; line-height: 1.6; color: #1a1a1a; background-color: #ffffff;">
          ${contentHtml}
        </div>
        
        <!-- Footer (Seamless Unified Background) -->
        <div style="background-color: #ffffff; padding: 10px 40px 40px 40px; text-align: center; font-size: 13px; line-height: 1.5;">
          
          <!-- Social Icons (Larger & Cleaner) -->
          <div style="margin-bottom: 24px;">
            <a href="https://www.facebook.com/titanleos.sl" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384053.png" width="34" height="34" alt="Facebook" style="display: block; border: none; opacity: 0.85;" />
            </a>
            <a href="https://www.instagram.com/titan_leos" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" width="34" height="34" alt="Instagram" style="display: block; border: none; opacity: 0.85;" />
            </a>
            <a href="https://www.linkedin.com/in/titanleos/" style="text-decoration: none; margin: 0 12px; display: inline-block;">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384014.png" width="34" height="34" alt="LinkedIn" style="display: block; border: none; opacity: 0.85;" />
            </a>
          </div>
          
          <!-- Contact Info -->
          <div style="margin-bottom: 12px; font-weight: bold; font-size: 14px;">
            <a href="mailto:info@titanleos.org" style="color: #2563eb; text-decoration: none;">info@titanleos.org</a> 
            <span style="margin: 0 8px; color: #2563eb; font-weight: bold;">&bull;</span> 
            <a href="https://www.titanleos.org" style="color: #2563eb; text-decoration: none;">www.titanleos.org</a>
          </div>
          
          <!-- Copyright -->
          <div style="font-weight: bold; color: #4b5563;">
            &copy; Leo Club of Pannipitiya Metro Titans 2026. All rights reserved.
          </div>
          
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: Request) {
  const supabase = await createClient();
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
    const rawHtml = await marked.parse(markdownBody);
    const fullEmailHtml = buildEmailTemplate(rawHtml);

    const data = await resend.emails.send({
      from: "Titan Leos <hello@titanleos.org>",
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