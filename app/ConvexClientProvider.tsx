"use client";

import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { AccountSync } from "../components/AccountSync";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_AFTER_SIGN_UP_URL,
  CLERK_PROXY_URL,
  CLERK_PUBLISHABLE_KEY,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_URL,
  isClerkEnabled,
} from "../lib/clerk";
import { clerkAppearance } from "../lib/clerkAppearance";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!isClerkEnabled) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      proxyUrl={CLERK_PROXY_URL || undefined}
      signInUrl={CLERK_SIGN_IN_URL}
      signUpUrl={CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
      signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AccountSync />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
