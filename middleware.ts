import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GUEST_CART_COOKIE, GUEST_CART_OWNER_HEADER } from "@/lib/constants";
import { updateSession } from "@/utils/supabase/middleware";

const GUEST_CART_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function applyGuestCartToNextResponse(
  request: NextRequest,
  response: NextResponse,
  userId: string | null | undefined,
): NextResponse {
  if (userId || request.cookies.get(GUEST_CART_COOKIE)?.value) {
    return response;
  }

  const id = crypto.randomUUID();

  if (response.headers.has("location")) {
    response.cookies.set(GUEST_CART_COOKIE, id, GUEST_CART_COOKIE_OPTIONS);
    return response;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(GUEST_CART_OWNER_HEADER);
  requestHeaders.set(GUEST_CART_OWNER_HEADER, id);

  const next = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.cookies.getAll().forEach((c) => {
    next.cookies.set(c.name, c.value, c);
  });
  next.cookies.set(GUEST_CART_COOKIE, id, GUEST_CART_COOKIE_OPTIONS);

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    next.headers.append(key, value);
  });

  return next;
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/marketplace(.*)",
  "/products/(.*)",
  "/cart",
  "/about",
  "/contact",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/checkout/success(.*)",
  "/checkout/cancel(.*)",
  "/api/webhooks(.*)",
]);

const isCustomerAuthedRoute = createRouteMatcher([
  "/checkout",
  "/dashboard(.*)",
  "/orders(.*)",
  "/profile(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const cookieRefreshes = await updateSession(request);

  if (!isPublicRoute(request)) {
    if (isAdminRoute(request)) {
      await auth.protect();
    } else if (isCustomerAuthedRoute(request)) {
      await auth.protect();
    }
  }

  const { userId } = await auth();

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  cookieRefreshes.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  response = applyGuestCartToNextResponse(request, response, userId);

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
