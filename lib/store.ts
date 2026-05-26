import { prisma } from "@/lib/prisma";
import { serializeProducts, type ProductCardData } from "@/lib/serialize";
import { Prisma } from "@prisma/client";

async function withMissingTableFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return fallback;
    }
    throw error;
  }
}

export async function getCategories() {
  return withMissingTableFallback(() => prisma.category.findMany({ orderBy: { name: "asc" } }), []);
}

export async function getProducts(input?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ProductCardData[]> {
  return withMissingTableFallback(
    async () => {
      const products = await prisma.product.findMany({
        where: {
          ...(input?.search
            ? {
                OR: [
                  { name: { contains: input.search, mode: "insensitive" } },
                  { description: { contains: input.search, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(input?.category ? { category: { slug: input.category } } : {}),
          ...(input?.minPrice || input?.maxPrice
            ? {
                price: {
                  ...(typeof input.minPrice === "number" ? { gte: input.minPrice } : {}),
                  ...(typeof input.maxPrice === "number" ? { lte: input.maxPrice } : {}),
                },
              }
            : {}),
        },
        include: { category: true, reviews: true },
        orderBy: { createdAt: "desc" },
      });
      return serializeProducts(products);
    },
    [],
  );
}

export async function getFeaturedProducts(): Promise<ProductCardData[]> {
  return withMissingTableFallback(
    async () => {
      const products = await prisma.product.findMany({
        where: { featured: true },
        include: { category: true, reviews: true },
        take: 8,
        orderBy: { createdAt: "desc" },
      });
      return serializeProducts(products);
    },
    [],
  );
}
