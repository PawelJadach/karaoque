import type { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://classic-sole-201.clerk.accounts.dev",
      applicationID: "convex",
    },
    {
      domain: "https://clerk.karaoque.vercel.app",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
