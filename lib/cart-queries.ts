import { prisma } from "@/lib/prisma";
import { getCartOwnerKey } from "@/lib/cart-owner";
import { computeTotals } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { CART_COUNT_COOKIE } from "@/lib/constants";

export async function getCartWithProducts() {
  const ownerKey = await getCartOwnerKey();
  if (!ownerKey) return { ownerKey: null, items: [] };
  try {
    const items = await prisma.cartItem.findMany({
      where: { ownerKey },
      include: { product: true },
      orderBy: { updatedAt: "desc" },
    });
    return { ownerKey, items };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return { ownerKey, items: [] };
    }
    throw error;
  }
}

export async function getCartItemCount() {
  const ownerKey = await getCartOwnerKey();
  if (!ownerKey) return 0;

  if (ownerKey.startsWith("guest:")) {
    const cookieStore = await cookies();
    const cachedCount = cookieStore.get(CART_COUNT_COOKIE)?.value;
    if (cachedCount) {
      const parsed = Number(cachedCount);
      if (Number.isFinite(parsed) && parsed >= 0) return parsed;
    }
  }

  try {
    const agg = await prisma.cartItem.aggregate({
      where: { ownerKey },
      _sum: { quantity: true },
    });
    return agg._sum.quantity ?? 0;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return 0;
    }
    throw error;
  }
}

export function cartLineTotals(
  items: { quantity: number; product: { price: { toString: () => string } } }[],
) {
  return items.map((i) => i.quantity * parseFloat(i.product.price.toString()));
}

export async function getCartTotals() {
  const { items } = await getCartWithProducts();
  const lineTotals = cartLineTotals(items);
  return computeTotals(lineTotals);
}
