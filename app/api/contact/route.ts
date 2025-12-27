import { NextRequest, NextResponse } from "next/server";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, subject, message } = body;

    // Validate required fields
    if (!email || !subject || !message) {
      return NextResponse.json(
        {
          status: "error",
          message: "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // Check if BREVO is configured
    if (!env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not configured");
      return NextResponse.json(
        {
          status: "error",
          message: "Email service is not configured. Please try again later.",
        },
        { status: 500 }
      );
    }

    const senderEmail = env.BREVO_SENDER_EMAIL;
    const senderName = env.BREVO_SENDER_NAME || "EduPeak";

    if (!senderEmail) {
      console.error("BREVO_SENDER_EMAIL is required");
      return NextResponse.json(
        {
          status: "error",
          message: "Email service configuration error. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Subject mapping for email categorization
    const subjectMap: Record<string, string> = {
      "Sales Inquiry": "Sales / Pricing Question",
      "Technical Support": "Technical Support",
      "Account Issue": "Account Issue",
      "Partnership": "Partnership Opportunity",
      "Feature Request": "Feature Request",
      "Bug Report": "Bug Report",
      "Other": "General Inquiry",
    };

    const subjectLabel = subjectMap[subject] || subject;

    // Send email to admin/support using BREVO
    const brevoClient = getBrevoClient();
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = `Contact Form: ${subjectLabel}`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>From:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Subject:</strong> ${subjectLabel}</p>
        </div>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="color: #666; white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>This email was sent from the EduPeak contact form.</p>
        </div>
      </div>
    `;
    sendSmtpEmail.sender = {
      name: senderName,
      email: senderEmail,
    };
    sendSmtpEmail.to = [{ email: senderEmail }]; // Send to admin email
    sendSmtpEmail.replyTo = {
      email: email,
      name: email.split("@")[0],
    };

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (emailError) {
      console.error("Brevo email error:", emailError);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to send email. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Send confirmation email to the user
    const confirmationEmail = new SendSmtpEmail();
    confirmationEmail.subject = "Thank you for contacting EduPeak";
    confirmationEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Thank you for contacting us!
        </h2>
        <p style="color: #666; line-height: 1.6;">
          We've received your message and our team will get back to you as soon as possible.
        </p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subjectLabel}</p>
          <p style="margin: 5px 0;"><strong>Your message:</strong></p>
          <p style="margin: 10px 0; color: #666; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #666; line-height: 1.6;">
          If you have any urgent questions, please don't hesitate to reach out to us directly.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>Best regards,<br>The EduPeak Team</p>
        </div>
      </div>
    `;
    confirmationEmail.sender = {
      name: senderName,
      email: senderEmail,
    };
    confirmationEmail.to = [{ email: email.toLowerCase().trim() }];

    try {
      await brevoClient.sendTransacEmail(confirmationEmail);
    } catch (confirmationError) {
      // Log but don't fail the request if confirmation email fails
      console.error("Failed to send confirmation email:", confirmationError);
    }

    return NextResponse.json({
      status: "success",
      message: "Your message has been sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}