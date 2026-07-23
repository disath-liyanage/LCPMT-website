import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  formType?: "contact" | "join";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, email, phone, subject, message, formType } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!resend) {
    console.error(
      "RESEND_API_KEY is not set - contact form submission was not sent."
    );
    return NextResponse.json(
      {
        error:
          "Email sending isn't configured yet. Set RESEND_API_KEY in your environment to enable this form.",
      },
      { status: 503 }
    );
  }

  try {
    await resend.emails.send({
      from: "Titan Leos <noreply@titanleos.org>",
      to: siteConfig.email,
      replyTo: email,
      subject:
        formType === "join"
          ? `New membership enquiry from ${name}`
          : `New contact form message: ${subject || "General enquiry"}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        formType === "join" ? "Type: Membership enquiry" : "Type: Contact form",
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return NextResponse.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }
}