import type { Product, Review } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

/** Prisma Decimal is not serializable across the server/client boundary. */
export function decimalToNumber(value: Decimal | number | string): number {
  return Number(value);
}

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  reviews?: { rating: number }[];
};

export function serializeProduct(
  product: Product & { reviews?: Pick<Review, "rating">[] },
): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: decimalToNumber(product.price),
    images: product.images,
    reviews: product.reviews?.map((review) => ({ rating: review.rating })),
  };
}

export function serializeProducts(
  products: (Product & { reviews?: Pick<Review, "rating">[] })[],
): ProductCardData[] {
  return products.map(serializeProduct);
}
