import Link from "next/link";
import { getAdminOverview } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminHomePage() {
  const overview = await getAdminOverview();

  const stats = [
    { label: "Total orders", value: overview.ordersCount.toString() },
    { label: "Customers", value: overview.customersCount.toString() },
    { label: "Products", value: overview.productsCount.toString() },
    { label: "Revenue", value: formatCurrency(overview.revenue) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sales, inventory, and customer activity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/80">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Link href="/admin/products" className="inline-flex text-sm font-medium text-primary transition-colors hover:underline">
        Manage products →
      </Link>
    </div>
  );
}
