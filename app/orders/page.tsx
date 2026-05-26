import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncAndGetUser } from "@/lib/auth-helpers";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

export default async function OrdersPage() {
  const user = await syncAndGetUser();
  if (!user) redirect("/sign-in");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your orders</h1>
        <p className="mt-2 text-muted-foreground">Track status and review past purchases.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">No orders yet. Start shopping in the marketplace.</CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Card className="border-border/80">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{o.status}</span>
                  </div>
                  <p className="mt-3 text-xl font-semibold text-foreground">{formatCurrency(Number(o.total))}</p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.product.name} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
