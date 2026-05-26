import { auth } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { GUEST_CART_COOKIE, GUEST_CART_OWNER_HEADER } from "@/lib/constants";

export async function getCartOwnerKey(): Promise<string | null> {
  const { userId } = await auth();
  if (userId) {
    const u = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (u) return `user:${u.id}`;
  }
  const jar = await cookies();
  const cookieGuest = jar.get(GUEST_CART_COOKIE)?.value;
  const headerGuest = (await headers()).get(GUEST_CART_OWNER_HEADER);
  const guest = cookieGuest ?? headerGuest;
  if (!guest) return null;
  return `guest:${guest}`;
}
