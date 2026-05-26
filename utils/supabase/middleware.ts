import { type NextRequest } from "next/server";

/** Clerk handles auth; Supabase Storage uses service role on server. No cookie refresh needed here. */
export async function updateSession(_request: NextRequest) {
  return [] as { name: string; value: string; options: Record<string, unknown> }[];
}
