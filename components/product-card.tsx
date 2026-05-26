"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { ProductCardData } from "@/lib/serialize";

export function ProductCard({ product }: { product: ProductCardData }) {
  const avg =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length
      : null;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}>
      <Card className="group h-full overflow-hidden border-border/80">
        <CardHeader className="p-0">
          <Link href={`/products/${product.slug}`} className="block">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image
                src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          <Link href={`/products/${product.slug}`} className="line-clamp-1 font-medium text-foreground hover:text-primary">
            {product.name}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-center justify-between pt-1">
            <p className="text-lg font-semibold text-foreground">{formatCurrency(product.price)}</p>
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {avg ? avg.toFixed(1) : "New"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full">
            <Link href={`/products/${product.slug}`}>View details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
