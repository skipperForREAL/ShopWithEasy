import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartWithProducts, cartLineTotals } from "@/lib/cart-queries";
import { computeTotals } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCartQuantityAction } from "@/app/actions/cart";

export default async function CartPage() {
  const { items } = await getCartWithProducts();
  const totals = computeTotals(cartLineTotals(items));

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:py-28">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Explore products and add items to begin checkout.</p>
        <Button asChild className="mt-8">
          <Link href="/marketplace">Go to marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-foreground">Shopping cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-border/80">
              <CardContent className="flex gap-4 p-4 sm:gap-5 sm:p-5">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                  <Image
                    src={item.product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.size ? `Size ${item.size} · ` : ""}
                      {formatCurrency(Number(item.product.price))} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={updateCartQuantityAction.bind(null, item.id, item.quantity - 1)}>
                      <Button type="submit" size="sm" variant="outline" className="h-9 w-9 rounded-full p-0">
                        −
                      </Button>
                    </form>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <form action={updateCartQuantityAction.bind(null, item.id, item.quantity + 1)}>
                      <Button type="submit" size="sm" variant="outline" className="h-9 w-9 rounded-full p-0">
                        +
                      </Button>
                    </form>
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground sm:text-base">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit border-border/80 lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="text-xl">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery (5%)</span>
              <span>{formatCurrency(totals.deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
            <Button asChild className="mt-2 w-full">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
