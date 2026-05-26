import { getAdminOverview } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Units sold</p>
          <p className="text-2xl font-bold">{overview.unitsSold}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">Revenue (non-cancelled)</p>
          <p className="text-2xl font-bold">{formatCurrency(overview.revenue)}</p>
        </div>
      </div>
    </div>
  );
}
