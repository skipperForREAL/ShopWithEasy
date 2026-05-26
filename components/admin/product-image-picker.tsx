"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSupabasePublicUrl(url: string) {
  return /\.supabase\.co\/storage\/v1\/object\/public\//i.test(url);
}

type Props = { name?: string; defaultValue?: string };

export function ProductImagePicker({ name = "images", defaultValue = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(() =>
    defaultValue
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const [linkInput, setLinkInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addUrls = (next: string[]) => {
    const merged = [...urls];
    for (const url of next) {
      if (merged.length >= MAX_IMAGES) break;
      if (!merged.includes(url)) merged.push(url);
    }
    if (merged.length > MAX_IMAGES) {
      toast.error(`Up to ${MAX_IMAGES} images.`);
      setUrls(merged.slice(0, MAX_IMAGES));
      return;
    }
    setUrls(merged);
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      toast.error("Choose image files.");
      return;
    }
    setUploading(true);
    try {
      for (const file of list) {
        if (file.size > MAX_FILE_BYTES) {
          toast.error(`${file.name} is too large (max 5 MB).`);
          continue;
        }
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          toast.error(data.error ?? "Upload failed");
          continue;
        }
        addUrls([data.url]);
        toast.success("Image uploaded");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Product images</span>
        <span className="text-neutral-500">
          {urls.length}/{MAX_IMAGES}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center",
          dragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-neutral-300 dark:border-neutral-700",
          uploading && "pointer-events-none opacity-70",
        )}>
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-neutral-400" /> : <Upload className="h-8 w-8 text-neutral-400" />}
        <p className="text-sm font-medium">Upload from device</p>
        <Button type="button" variant="secondary" size="sm" className="rounded-full" disabled={uploading || urls.length >= MAX_IMAGES} onClick={() => inputRef.current?.click()}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Choose files
        </Button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
      </div>
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://…"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const t = linkInput.trim();
              if (isValidImageUrl(t)) {
                addUrls([t]);
                setLinkInput("");
              }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0 rounded-full"
          onClick={() => {
            const t = linkInput.trim();
            if (!isValidImageUrl(t)) {
              toast.error("Enter a valid image URL.");
              return;
            }
            addUrls([t]);
            setLinkInput("");
          }}>
          <Link2 className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
      {urls.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {urls.map((url) => (
            <li key={url} className="group relative aspect-square overflow-hidden rounded-lg border bg-neutral-100 dark:bg-neutral-900">
              {isSupabasePublicUrl(url) ? (
                <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="h-full w-full object-cover" />
              )}
              <button type="button" onClick={() => setUrls((p) => p.filter((u) => u !== url))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow dark:bg-neutral-950/90" aria-label="Remove">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name={name} value={urls.join("\n")} />
    </div>
  );
}
