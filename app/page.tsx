import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFeaturedProducts } from "@/lib/store";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <HomeHero />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Secure checkout", copy: "Stripe and cash on delivery with encrypted sessions." },
          { icon: Truck, title: "Transparent delivery", copy: "Delivery fee is always 5% of your cart subtotal." },
          { icon: ArrowRight, title: "Track every order", copy: "Follow status updates from your account dashboard." },
        ].map(({ icon: Icon, title, copy }) => (
          <Card key={title} className="border-border/80 bg-card/80">
            <CardContent className="space-y-2 p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Featured products</h2>
            <p className="mt-1 text-muted-foreground">Hand-picked items from our marketplace.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/marketplace">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {featured.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              No featured products yet. Check back soon or browse the full marketplace.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
