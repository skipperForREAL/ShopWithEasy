import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:py-28">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-9 w-9" aria-hidden />
      </div>
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Thank you for your order!</h1>
      <p className="mt-3 text-muted-foreground">Your payment was received and your order is being processed.</p>
      {params.orderId && (
        <Card className="mx-auto mt-6 max-w-sm border-border/80 text-left">
          <CardContent className="p-4 text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <p className="mt-1 font-mono text-foreground">{params.orderId}</p>
          </CardContent>
        </Card>
      )}
      <Button asChild className="mt-8">
        <Link href="/orders">View orders</Link>
      </Button>
    </div>
  );
}
