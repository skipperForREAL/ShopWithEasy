import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function computeTotals(lineTotals: number[]) {
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const deliveryFee = subtotal * 0.05;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
