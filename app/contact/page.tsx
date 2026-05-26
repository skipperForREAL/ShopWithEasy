import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Contact us</h1>
      <p className="mt-4 text-muted-foreground">Questions about an order or our marketplace? Send us a message.</p>

      <Card className="mt-10 border-border/80">
        <CardContent className="grid gap-4 p-6">
          <Input placeholder="Your name" autoComplete="name" />
          <Input type="email" placeholder="Email address" autoComplete="email" />
          <Textarea placeholder="How can we help?" className="min-h-32" />
          <Button type="button" className="w-full sm:w-auto">
            Send message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
