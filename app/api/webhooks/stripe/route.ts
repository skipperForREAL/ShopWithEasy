import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "Missing webhook config" }, { status: 500 });

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string }; payment_intent?: string | null };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
      await prisma.payment.updateMany({
        where: { orderId },
        data: {
          status: PaymentStatus.COMPLETED,
          stripePaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
