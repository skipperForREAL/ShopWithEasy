import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Profile settings</h1>
      <p className="mt-2 text-muted-foreground">Your account information managed through Clerk.</p>

      <Card className="mt-8 border-border/80">
        <CardContent className="space-y-2 p-6">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium text-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          {user.fullName && (
            <>
              <p className="pt-4 text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{user.fullName}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
