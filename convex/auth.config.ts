import type { AuthConfig } from "convex/server";

// After creating a Clerk app, paste the Frontend API URL (issuer) here:
// https://verb-noun-00.clerk.accounts.dev
const clerkIssuerDomain = "";

export default {
  providers: clerkIssuerDomain
    ? [
        {
          domain: clerkIssuerDomain,
          applicationID: "convex",
        },
      ]
    : [],
} satisfies AuthConfig;
