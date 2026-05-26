import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, getProducts } from "@/lib/store";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts({ search: params.q, category: params.category }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Marketplace</h1>
        <p className="max-w-2xl text-muted-foreground">Search, filter by category, and discover products built for a premium shopping flow.</p>
      </div>

      <Card className="border-border/80 bg-card/90 backdrop-blur-sm">
        <CardContent className="p-5">
          <form method="get" className="grid gap-3 md:grid-cols-[1fr_220px_auto] md:items-center">
            <Input name="q" defaultValue={params.q} placeholder="Search products…" aria-label="Search products" />
            <Select name="category" defaultValue={params.category ?? ""} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button type="submit" className="md:px-8">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-20 text-center">
            <p className="text-lg font-medium text-foreground">No products found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search term or category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
