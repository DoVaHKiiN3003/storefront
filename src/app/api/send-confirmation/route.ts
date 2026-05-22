import { Resend } from "resend";
import { render } from "@react-email/render";
import ConfirmationEmail from "../../../emails/ConfirmationEmail";
import type { OrderData } from "../../lib/types";

export async function POST(request: Request) {
  try {
    const { order, orderNumber, email }: { order: OrderData; orderNumber: string; email: string } =
      await request.json();

    // Validate required fields
    if (!order || !orderNumber) {
      return Response.json(
        { error: "Missing required fields: order, orderNumber" },
        { status: 400 }
      );
    }

    const recipientEmail = email || order.email;
    if (!recipientEmail) {
      return Response.json(
        { error: "No recipient email provided" },
        { status: 400 }
      );
    }

    // Check if RESEND_API_KEY is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn(
        "[send-confirmation] RESEND_API_KEY not set. Skipping email send."
      );
      return Response.json(
        {
          message: "Email not sent: RESEND_API_KEY not configured",
          skipped: true,
        },
        { status: 200 }
      );
    }

    const resend = new Resend(apiKey);

    const from =
      process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const emailHtml = await render(
      ConfirmationEmail({ order, orderNumber })
    );

    const { data, error } = await resend.emails.send({
      from: `Storefront <${from}>`,
      to: [recipientEmail],
      subject: `Order Confirmed — #${orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[send-confirmation] Resend error:", error);
      return Response.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return Response.json({
      message: "Confirmation email sent",
      id: data?.id,
    });
  } catch (err) {
    console.error("[send-confirmation] Unexpected error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
