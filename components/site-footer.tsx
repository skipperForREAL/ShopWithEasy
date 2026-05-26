import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-2">
            <p className="text-lg font-semibold tracking-tight text-foreground">ShopWithEasy</p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              A premium e-commerce experience with secure checkout, order tracking, and a streamlined admin workflow.
            </p>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Shop</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace" className="transition-colors hover:text-foreground">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/cart" className="transition-colors hover:text-foreground">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition-colors hover:text-foreground">
                  Track orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Company</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ShopWithEasy. All rights reserved.</p>
          <p>Built with care for every device.</p>
        </div>
      </div>
    </footer>
  );
}
