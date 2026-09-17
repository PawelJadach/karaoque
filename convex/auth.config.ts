import type { AuthConfig } from "convex/server";

const clerkIssuerDomain = "https://classic-sole-201.clerk.accounts.dev";

export default {
  providers: [
    {
      domain: clerkIssuerDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
