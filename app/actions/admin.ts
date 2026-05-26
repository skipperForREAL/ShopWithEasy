"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/utils";

function parseProductImages(raw: string) {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(4),
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  sizes: z.string().min(1),
  images: z.string().optional(),
  featured: z.coerce.boolean().optional(),
});

export async function createProductAction(formData: FormData) {
  await requireAdmin();
  const sizesRaw = String(formData.get("sizes") ?? "");
  const imagesRaw = String(formData.get("images") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    categoryId: formData.get("categoryId"),
    sizes: sizesRaw,
    images: imagesRaw,
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) throw new Error("Invalid product data");

  const sizes = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const images = parseProductImages(imagesRaw);

  const base = slugify(parsed.data.name);
  let slug = base;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      categoryId: parsed.data.categoryId,
      sizes,
      images,
      featured: parsed.data.featured ?? false,
    },
  });

  await logActivity("admin", `Product created: ${parsed.data.name}`);
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
}

export async function updateProductAction(productId: string, formData: FormData) {
  await requireAdmin();
  const sizesRaw = String(formData.get("sizes") ?? "");
  const imagesRaw = String(formData.get("images") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    categoryId: formData.get("categoryId"),
    sizes: sizesRaw,
    images: imagesRaw,
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) throw new Error("Invalid product data");

  const sizes = sizesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const images = parseProductImages(imagesRaw);

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      categoryId: parsed.data.categoryId,
      sizes,
      images,
      featured: parsed.data.featured ?? false,
    },
  });

  await logActivity("admin", `Product updated: ${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  await logActivity("admin", `Product deleted: ${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
}

const statusSchema = z.nativeEnum(OrderStatus);

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!statusSchema.safeParse(status).success) throw new Error("Invalid status");
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  await logActivity("admin", `Order ${orderId} → ${status}`);
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const slug = slugify(name);
  await prisma.category.create({
    data: { name, slug, description: String(formData.get("description") ?? "").trim() || null },
  });
  revalidatePath("/admin/products");
  revalidatePath("/marketplace");
}

export async function getAdminOverview() {
  await requireAdmin();
  const [ordersCount, customersCount, productsCount, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.product.count(),
    prisma.order.aggregate({
      where: { status: { not: OrderStatus.CANCELLED } },
      _sum: { total: true },
    }),
  ]);

  const units = await prisma.orderItem.aggregate({
    _sum: { quantity: true },
    where: { order: { status: { not: OrderStatus.CANCELLED } } },
  });

  return {
    ordersCount,
    customersCount,
    productsCount,
    revenue: revenue._sum.total ? parseFloat(revenue._sum.total.toString()) : 0,
    unitsSold: units._sum.quantity ?? 0,
  };
}
