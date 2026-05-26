export const GUEST_CART_COOKIE = "guest_cart_id";

/** Set only by middleware so RSC can resolve a new guest id in the same request (cookies() is read-only for writes in RSC). */
export const GUEST_CART_OWNER_HEADER = "x-swe-internal-guest-owner";
