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
      <style>
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; border-radius: 0 !important; }
          .header-img-container { padding: 25px 15px 0px 15px !important; }
          .body-content { padding: 15px 20px !important; font-size: 15px !important; }
          .body-content h1 { font-size: 22px !important; margin-top: 0 !important; margin-bottom: 15px !important; }
          .footer-content { padding: 10px 20px 30px 20px !important; }
        }
        
        .body-content h1 {
          margin-top: 0;
          font-size: 26px;
          color: #1a1a1a;
        }
        
        @keyframes wa-pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .wa-btn {
          animation: wa-pulse 2s infinite;
        }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; -webkit-font-smoothing: antialiased;">
          <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
          <div class="header-img-container" style="text-align: center; padding: 35px 20px 0px 20px; background-color: #ffffff;">
            <img src="${SITE_URL}/email.png" alt="Titan Leos Header" style="max-width: 280px; height: auto; display: inline-block;" />
          </div>
  
          <div class="body-content" style="padding: 20px 40px 30px 40px; font-size: 16px; line-height: 1.6; color: #1a1a1a; background-color: #ffffff;">
            ${contentHtml}
          </div>
  
          <div class="footer-content" style="background-color: #ffffff; padding: 10px 40px 40px 40px; text-align: center; font-size: 13px; line-height: 1.5;">
          <div style="margin-bottom: 24px;">
            <!-- TODO: Update these URLs with the new social links -->
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
        
          <div style="margin-bottom: 12px; font-weight: bold; font-size: 14px;">
            <a href="mailto:info@titanleos.org" style="color: #2563eb; text-decoration: none;">info@titanleos.org</a>&nbsp;
              <span style="margin: 0 8px; color: #2563eb; font-weight: bold;">&bull;</span>&nbsp;
             <a href="https://www.titanleos.org" style="color: #2563eb; text-decoration: none;">www.titanleos.org</a>
          </div>
        
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