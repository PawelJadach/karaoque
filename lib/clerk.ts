export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const isClerkEnabled = CLERK_PUBLISHABLE_KEY.length > 0;
