import { prisma } from "@/lib/prisma";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { OrderStatus } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, items: { include: { product: true } } },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{o.user.email}</p>
                <p className="text-xs text-neutral-500">{formatDate(o.createdAt)}</p>
              </div>
              <p className="font-semibold">{formatCurrency(Number(o.total))}</p>
            </div>
            <p className="mt-2 text-sm">Status: {o.status}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  OrderStatus.PENDING,
                  OrderStatus.PAID,
                  OrderStatus.PROCESSING,
                  OrderStatus.DELIVERED,
                  OrderStatus.CANCELLED,
                ] as const
              ).map((s) => (
                <form key={s} action={updateOrderStatusAction.bind(null, o.id, s)}>
                  <Button type="submit" size="sm" variant={o.status === s ? "default" : "outline"}>
                    {s}
                  </Button>
                </form>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
