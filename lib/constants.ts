export const GUEST_CART_COOKIE = "guest_cart_id";

/** ISO 4217 code for Tanzanian Shilling (Stripe, payments) */
export const CURRENCY_CODE = "tzs" as const;

/** Set only by middleware so RSC can resolve a new guest id in the same request (cookies() is read-only for writes in RSC). */
export const GUEST_CART_OWNER_HEADER = "x-swe-internal-guest-owner";
