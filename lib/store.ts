import { prisma } from "@/lib/prisma";
import { serializeProducts, type ProductCardData } from "@/lib/serialize";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

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
  return withMissingTableFallback(
    () =>
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    [],
  );
}

export async function getProducts(input?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string;
  take?: number;
}): Promise<{ items: ProductCardData[]; nextCursor: string | null }> {
  const take = Math.min(Math.max(input?.take ?? 12, 1), 30);
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
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          images: true,
          reviews: { select: { rating: true }, take: 20 },
        },
        orderBy: { createdAt: "desc" },
        take: take + 1,
        ...(input?.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
      });
      const hasMore = products.length > take;
      const page = hasMore ? products.slice(0, take) : products;
      return {
        items: serializeProducts(page),
        nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
      };
    },
    { items: [], nextCursor: null },
  );
}

export async function getFeaturedProducts(): Promise<ProductCardData[]> {
  const loadFeatured = unstable_cache(
    async () =>
      withMissingTableFallback(
        async () => {
          const products = await prisma.product.findMany({
            where: { featured: true },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              price: true,
              images: true,
              reviews: { select: { rating: true }, take: 20 },
            },
            take: 8,
            orderBy: { createdAt: "desc" },
          });
          return serializeProducts(products);
        },
        [],
      ),
    ["featured-products"],
    { revalidate: 60 },
  );

  return loadFeatured();
}
