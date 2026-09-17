"use client";

import {
  AuthenticateWithRedirectCallback,
  SignIn,
  SignUp,
} from "@clerk/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_AFTER_SIGN_UP_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_URL,
  isClerkEnabled,
} from "../lib/clerk";
import { PageHeader } from "./PageHeader";

function ClerkAuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-4 sm:pt-8">
      <PageHeader showHome />
      <div className="flex flex-1 items-start justify-center pt-4">{children}</div>
    </main>
  );
}

function useClerkAuthAvailable() {
  const router = useRouter();

  useEffect(() => {
    if (!isClerkEnabled) {
      router.replace("/");
    }
  }, [router]);

  return isClerkEnabled;
}

function useRewriteClerkHashCallback(pathPrefix: string) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#/sso-callback")) {
      return;
    }

    const hashPathAndQuery = hash.slice(1);
    const hashUrl = new URL(hashPathAndQuery, window.location.origin);
    const merged = new URLSearchParams(window.location.search);
    hashUrl.searchParams.forEach((value, key) => {
      merged.set(key, value);
    });
    const query = merged.toString();
    router.replace(`${pathPrefix}/sso-callback${query ? `?${query}` : ""}`);
  }, [pathPrefix, router]);
}

export function ClerkSignInScreen() {
  const enabled = useClerkAuthAvailable();
  useRewriteClerkHashCallback(CLERK_SIGN_IN_URL);

  if (!enabled) {
    return null;
  }

  return (
    <ClerkAuthFrame>
      <SignIn
        routing="path"
        path={CLERK_SIGN_IN_URL}
        signUpUrl={CLERK_SIGN_UP_URL}
        fallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
        signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
      />
    </ClerkAuthFrame>
  );
}

export function ClerkSignUpScreen() {
  const enabled = useClerkAuthAvailable();
  useRewriteClerkHashCallback(CLERK_SIGN_UP_URL);

  if (!enabled) {
    return null;
  }

  return (
    <ClerkAuthFrame>
      <SignUp
        routing="path"
        path={CLERK_SIGN_UP_URL}
        signInUrl={CLERK_SIGN_IN_URL}
        fallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
        signInFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
      />
    </ClerkAuthFrame>
  );
}

export function ClerkSsoCallbackScreen() {
  const enabled = useClerkAuthAvailable();

  if (!enabled) {
    return null;
  }

  return (
    <ClerkAuthFrame>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
        signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
      />
    </ClerkAuthFrame>
  );
}
