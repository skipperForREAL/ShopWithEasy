import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCartItemCount } from "@/lib/cart-queries";
import { syncAndGetUser } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopWithEasy",
  description: "Modern e-commerce marketplace",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await syncAndGetUser();
  const cartCount = await getCartItemCount();
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader cartCount={cartCount} isAdmin={isAdmin} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
