import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:py-28">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="h-9 w-9" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Payment cancelled</h1>
      <p className="mt-3 text-muted-foreground">No charge was made. You can return to your cart and try again.</p>
      <Button asChild className="mt-8">
        <Link href="/cart">Back to cart</Link>
      </Button>
    </div>
  );
}
