"use client";

import { SignInButton, UserButton, useUser } from "@clerk/react";
import { useConvexAuth } from "convex/react";
import { isClerkEnabled } from "../lib/clerk";
import { useI18n } from "../lib/i18n";

export function AuthControls() {
  if (!isClerkEnabled) {
    return null;
  }
  return <ClerkAuthControls />;
}

function ClerkAuthControls() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();

  if (!isClerkEnabled) {
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="h-11 w-11 shrink-0 rounded-full border border-line" />
    );
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            avatarBox: "h-11 w-11",
          },
        }}
      />
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-line bg-white px-3 text-sm font-semibold text-zinc-900"
      >
        <GoogleMark />
        <span className="hidden sm:inline">{t.continueWithGoogle}</span>
        <span className="sm:hidden">{t.googleShort}</span>
      </button>
    </SignInButton>
  );
}

export function GoogleSignInBanner() {
  if (!isClerkEnabled) {
    return null;
  }
  return <ClerkGoogleSignInBanner />;
}

function ClerkGoogleSignInBanner() {
  const { t } = useI18n();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isClerkEnabled || isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-5 rounded-3xl border border-line bg-card p-5">
      <p className="text-sm leading-5 text-muted">{t.signInHint}</p>
      <div className="mt-4">
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-zinc-900"
          >
            <GoogleMark />
            {t.continueWithGoogle}
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.93l-3.88-3c-1.08.74-2.47 1.18-4.07 1.18-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.14 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
