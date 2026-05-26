import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { syncAndGetUser } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await syncAndGetUser();
  if (!user) redirect("/sign-in");
  if (user.role === Role.ADMIN) redirect("/admin");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your dashboard</h1>
        <p className="mt-2 text-muted-foreground">Signed in as {user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/80">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium text-foreground">Orders</p>
            <p className="text-sm text-muted-foreground">Track delivery status and order history.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardContent className="space-y-3 p-5">
            <p className="font-medium text-foreground">Profile</p>
            <p className="text-sm text-muted-foreground">Update your account details and preferences.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">Open profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
