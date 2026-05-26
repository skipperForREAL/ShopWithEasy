import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { addToCartFormAction } from "@/app/actions/cart";

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, reviews: { include: { user: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted shadow-[var(--shadow-material-md)]">
          <Image
            src={product.images[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">{product.category.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{product.name}</h1>
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <p className="text-3xl font-bold text-foreground">{formatCurrency(Number(product.price))}</p>
            <p className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">{product.quantity} in stock</p>
          </div>

          <Card className="border-border/80">
            <CardContent className="space-y-4 p-5">
              <form action={addToCartFormAction} className="space-y-4">
                <input type="hidden" name="productId" value={product.id} />
                <div className="space-y-2">
                  <label htmlFor="size" className="text-sm font-medium text-foreground">
                    Size
                  </label>
                  <Select id="size" name="size" required defaultValue={product.sizes[0]}>
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Add to cart
                </Button>
              </form>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart">View cart</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4 border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">Customer reviews</h2>
            {product.reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share feedback.</p>}
            {product.reviews.slice(0, 5).map((review) => (
              <Card key={review.id} className="border-border/80">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-foreground">{review.user.name || review.user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.rating}/5 · {formatDate(review.createdAt)}
                  </p>
                  {review.comment && <p className="mt-2 text-sm leading-relaxed text-foreground/90">{review.comment}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
