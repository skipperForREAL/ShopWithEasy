"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCartOwnerKey } from "@/lib/cart-owner";
import { requireUser } from "@/lib/auth-helpers";
import { GUEST_CART_COOKIE } from "@/lib/constants";

export async function addToCartAction(productId: string, quantity: number, size: string) {
  const ownerKey = await getCartOwnerKey();
  if (!ownerKey) throw new Error("Cart unavailable");

  await prisma.cartItem.upsert({
    where: { ownerKey_productId_size: { ownerKey, productId, size: size || "" } },
    create: { ownerKey, productId, quantity, size: size || "" },
    update: { quantity: { increment: quantity } },
  });
  revalidatePath("/cart");
  revalidatePath("/marketplace");
}

export async function updateCartQuantityAction(cartItemId: string, quantity: number) {
  const ownerKey = await getCartOwnerKey();
  if (!ownerKey) throw new Error("Cart unavailable");

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: cartItemId, ownerKey } });
  } else {
    await prisma.cartItem.updateMany({ where: { id: cartItemId, ownerKey }, data: { quantity } });
  }
  revalidatePath("/cart");
}

export async function mergeGuestCartAfterSignIn() {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return;

  const jar = await cookies();
  const guestId = jar.get(GUEST_CART_COOKIE)?.value;
  if (!guestId) return;

  const guestKey = `guest:${guestId}`;
  const guestItems = await prisma.cartItem.findMany({ where: { ownerKey: guestKey } });
  const userKey = `user:${user.id}`;

  for (const item of guestItems) {
    await prisma.cartItem.upsert({
      where: { ownerKey_productId_size: { ownerKey: userKey, productId: item.productId, size: item.size } },
      create: { ownerKey: userKey, productId: item.productId, quantity: item.quantity, size: item.size },
      update: { quantity: { increment: item.quantity } },
    });
  }
  await prisma.cartItem.deleteMany({ where: { ownerKey: guestKey } });
  jar.delete(GUEST_CART_COOKIE);
  revalidatePath("/cart");
}

export async function addReviewAction(productId: string, slug: string, rating: number, comment: string) {
  const user = await requireUser();
  await prisma.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    create: { productId, userId: user.id, rating, comment: comment || null },
    update: { rating, comment: comment || null },
  });
  revalidatePath(`/products/${slug}`);
}

export async function addToCartFormAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const size = String(formData.get("size") ?? "");
  if (!productId) throw new Error("Missing product");
  await addToCartAction(productId, 1, size);
}
