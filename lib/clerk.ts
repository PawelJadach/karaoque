export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const CLERK_PROXY_URL = process.env.NEXT_PUBLIC_CLERK_PROXY_URL ?? "";

export const CLERK_SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";

export const CLERK_SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

export const CLERK_AFTER_SIGN_IN_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/create";

export const CLERK_AFTER_SIGN_UP_URL =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/create";

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
