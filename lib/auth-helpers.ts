import { auth, currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function syncAndGetUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const adminIds =
    process.env.ADMIN_CLERK_IDS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const role: Role = adminIds.includes(userId) ? Role.ADMIN : Role.CUSTOMER;

  return prisma.user.upsert({
    where: { clerkId: userId },
    create: {
      clerkId: userId,
      email,
      name: clerkUser.fullName ?? clerkUser.firstName ?? null,
      image: clerkUser.imageUrl ?? null,
      role,
    },
    update: {
      email,
      name: clerkUser.fullName ?? clerkUser.firstName ?? null,
      image: clerkUser.imageUrl ?? null,
      ...(adminIds.includes(userId) ? { role: Role.ADMIN } : { role: Role.CUSTOMER }),
    },
  });
}

export async function requireUser() {
  const user = await syncAndGetUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export function isAdminClerkId(clerkId: string) {
  const adminIds =
    process.env.ADMIN_CLERK_IDS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  return adminIds.includes(clerkId);
}
