"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ cartCount = 0, isAdmin = false }: { cartCount?: number; isAdmin?: boolean }) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (href: string) =>
    cn(
      "rounded-full px-3 py-2 text-sm font-medium transition-colors",
      pathname === href || pathname.startsWith(`${href}/`)
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-foreground">
          ShopWithEasy
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              aria-label="Admin dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>
          )}

          {!isSignedIn && (
            <SignInButton mode="modal">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </SignInButton>
          )}

          {isSignedIn && (
            <div className="hidden sm:block">
              <UserButton />
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background/95 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className={linkClass("/admin")} onClick={() => setMobileOpen(false)}>
                Admin
              </Link>
            )}
            {isSignedIn && (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/orders" className={linkClass("/orders")} onClick={() => setMobileOpen(false)}>
                  Orders
                </Link>
                <Link href="/profile" className={linkClass("/profile")} onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
              </>
            )}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <Button variant="outline" className="mt-2 w-full">
                  Sign in
                </Button>
              </SignInButton>
            )}
            {isSignedIn && (
              <div className="mt-3 flex justify-center border-t border-border pt-3">
                <UserButton />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
