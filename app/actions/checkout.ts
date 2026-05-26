"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { getCartWithProducts, cartLineTotals } from "@/lib/cart-queries";
import { computeTotals } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { logActivity } from "@/lib/activity";

export async function checkoutCODAction(formData: FormData) {
  const user = await requireUser();
  const { items, ownerKey } = await getCartWithProducts();
  if (!items.length) throw new Error("Cart is empty");

  const shippingName = String(formData.get("shippingName") ?? "").trim();
  const shippingEmail = String(formData.get("shippingEmail") ?? "").trim();
  const shippingPhone = String(formData.get("shippingPhone") ?? "").trim();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  if (!shippingName || !shippingEmail || !shippingAddress) throw new Error("Missing shipping fields");

  const lineTotals = cartLineTotals(items);
  const { subtotal, deliveryFee, total } = computeTotals(lineTotals);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: OrderStatus.PAID,
      subtotal,
      deliveryFee,
      total,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.product.price,
          size: i.size || null,
        })),
      },
      payments: {
        create: {
          method: PaymentMethod.COD,
          status: PaymentStatus.PENDING,
          amount: total,
        },
      },
    },
  });

  if (ownerKey) await prisma.cartItem.deleteMany({ where: { ownerKey } });

  await logActivity("order", `COD order ${order.id}`);
  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect(`/checkout/success?orderId=${order.id}`);
}

export async function checkoutStripeAction(formData: FormData) {
  const user = await requireUser();
  const { items, ownerKey } = await getCartWithProducts();
  if (!items.length) throw new Error("Cart is empty");

  const shippingName = String(formData.get("shippingName") ?? "").trim();
  const shippingEmail = String(formData.get("shippingEmail") ?? "").trim();
  const shippingPhone = String(formData.get("shippingPhone") ?? "").trim();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();
  if (!shippingName || !shippingEmail || !shippingAddress) throw new Error("Missing shipping fields");

  const lineTotals = cartLineTotals(items);
  const { subtotal, deliveryFee, total } = computeTotals(lineTotals);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      total,
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.product.price,
          size: i.size || null,
        })),
      },
      payments: {
        create: {
          method: PaymentMethod.STRIPE,
          status: PaymentStatus.PENDING,
          amount: total,
        },
      },
    },
    include: { payments: true },
  });

  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const line_items = [
    ...items.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: "usd" as const,
        unit_amount: Math.round(Number(i.product.price) * 100),
        product_data: { name: i.product.name },
      },
    })),
    ...(deliveryFee > 0
      ? [
          {
            quantity: 1,
            price_data: {
              currency: "usd" as const,
              unit_amount: Math.round(deliveryFee * 100),
              product_data: { name: "Delivery (5%)" },
            },
          },
        ]
      : []),
  ];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: shippingEmail,
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    line_items,
    metadata: { orderId: order.id },
  });

  await prisma.payment.update({
    where: { id: order.payments[0].id },
    data: { stripeSessionId: session.id },
  });

  if (ownerKey) await prisma.cartItem.deleteMany({ where: { ownerKey } });

  if (session.url) redirect(session.url);
  throw new Error("Stripe session URL missing");
}
