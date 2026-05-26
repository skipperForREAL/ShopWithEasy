import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { checkoutCODAction, checkoutStripeAction } from "@/app/actions/checkout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCartWithProducts, cartLineTotals } from "@/lib/cart-queries";
import { formatCurrency } from "@/lib/format";
import { computeTotals } from "@/lib/utils";

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { items } = await getCartWithProducts();
  if (!items.length) redirect("/cart");

  const totals = computeTotals(cartLineTotals(items));
  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Checkout</h1>
        <p className="mt-2 text-muted-foreground">Complete your order with secure payment options.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-lg">Shipping details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={checkoutCODAction} className="grid gap-3">
                <Input name="shippingName" required placeholder="Full name" autoComplete="name" />
                <Input name="shippingEmail" type="email" required placeholder="Email" autoComplete="email" />
                <Input name="shippingPhone" placeholder="Phone" autoComplete="tel" />
                <Textarea name="shippingAddress" required placeholder="Delivery address" className="min-h-28" autoComplete="street-address" />
                <Button type="submit" className="mt-2 w-full sm:w-auto">
                  Place order — Cash on delivery
                </Button>
              </form>
            </CardContent>
          </Card>

          {hasStripe && (
            <Card className="border-border/80">
              <CardHeader>
                <CardTitle className="text-lg">Card payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={checkoutStripeAction} className="grid gap-3">
                  <Input name="shippingName" required placeholder="Full name" autoComplete="name" />
                  <Input name="shippingEmail" type="email" required placeholder="Email" autoComplete="email" />
                  <Input name="shippingPhone" placeholder="Phone" autoComplete="tel" />
                  <Textarea name="shippingAddress" required placeholder="Delivery address" className="min-h-28" autoComplete="street-address" />
                  <Button type="submit" variant="secondary" className="mt-2 w-full sm:w-auto">
                    Pay with Stripe
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="h-fit border-border/80 lg:col-span-2 lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="text-lg">Payment summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 text-muted-foreground">
                  <span className="line-clamp-1">
                    {item.product.name}
                    {item.size ? ` (${item.size})` : ""} × {item.quantity}
                  </span>
                  <span className="shrink-0">{formatCurrency(Number(item.product.price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee (5%)</span>
                <span>{formatCurrency(totals.deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
                <span>Total due</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/cart" className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground">
        ← Back to cart
      </Link>
    </div>
  );
}
