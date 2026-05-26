import Image from "next/image";
import { cn } from "@/lib/utils";

const FALLBACK =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80";

function isSupabasePublicUrl(url: string) {
  return /\.supabase\.co\/storage\/v1\/object\/public\//i.test(url);
}

function isOptimizableUrl(url: string) {
  if (isSupabasePublicUrl(url)) return true;
  try {
    const host = new URL(url).hostname;
    return host === "images.unsplash.com" || host.endsWith(".unsplash.com");
  } catch {
    return false;
  }
}

type Props = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({ src, alt, fill = true, className, sizes, priority }: Props) {
  const resolved = src?.trim() || FALLBACK;

  if (isOptimizableUrl(resolved)) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved} alt={alt} className={cn(fill && "h-full w-full object-cover", className)} />
  );
}
