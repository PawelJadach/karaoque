export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const CLERK_PROXY_URL = process.env.NEXT_PUBLIC_CLERK_PROXY_URL ?? "";

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
