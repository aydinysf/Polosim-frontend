import { NextResponse } from "next/server";

function renderHtml(payload: {
  orderId?: number;
  name?: string;
  surname?: string;
  items?: Array<{ name: string; quantity: number; amount?: number }>;
  total?: number;
  currency?: string;
}) {
  const itemsHtml = (payload.items || [])
    .map(
      (i) =>
        `<li>${i.name} × ${i.quantity}${
          typeof i.amount === "number" ? ` — €${i.amount.toFixed(2)}` : ""
        }</li>`
    )
    .join("");
  return `
    <div>
      <h2>Payment Successful</h2>
      <p>Dear ${[payload.name, payload.surname].filter(Boolean).join(" ") || "Customer"},</p>
      <p>Your payment was successful. We will deliver your eSIM QR code shortly.</p>
      ${
        payload.orderId
          ? `<p><strong>Order ID:</strong> ${payload.orderId}</p>`
          : ""
      }
      <p><strong>Order Details:</strong></p>
      <ul>${itemsHtml}</ul>
      ${
        typeof payload.total === "number"
          ? `<p><strong>Total:</strong> €${payload.total.toFixed(2)}</p>`
          : ""
      }
      <p>Thank you for choosing POLO SIM.</p>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = String(body?.email || "").trim();
    const name = String(body?.name || "");
    const surname = String(body?.surname || "");
    const orderId = typeof body?.orderId === "number" ? body.orderId : undefined;
    const items = Array.isArray(body?.items) ? body.items : [];
    const total =
      typeof body?.total === "number" ? body.total : undefined;
    const currency = String(body?.currency || "EUR");

    if (!to) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.MAIL_FROM || "orders@polosim.com";
    const subject =
      process.env.MAIL_SUBJECT || "Your POLO SIM order confirmation";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Email provider not configured. Set RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const html = renderHtml({
      orderId,
      name,
      surname,
      items,
      total,
      currency,
    });

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
