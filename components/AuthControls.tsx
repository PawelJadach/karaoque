"use client";

import { SignInButton, UserButton, useUser } from "@clerk/react";
import { useState } from "react";
import { isClerkEnabled } from "../lib/clerk";
import { useI18n } from "../lib/i18n";

export function AuthControls() {
  if (!isClerkEnabled) {
    return null;
  }
  return <SignedInUserButton />;
}

function SignedInUserButton() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

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

export function BoardSignInPrompt() {
  if (!isClerkEnabled) {
    return null;
  }
  return <ClerkBoardSignInPrompt />;
}

function ClerkBoardSignInPrompt() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const [dismissed, setDismissed] = useState(false);

  if (!isLoaded || isSignedIn || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t.close}
        onClick={() => setDismissed(true)}
        className="absolute inset-0 bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-signin-title"
        className="relative z-10 w-full max-w-sm rounded-3xl border border-line bg-card p-5"
      >
        <h2 id="board-signin-title" className="text-lg font-semibold">
          {t.boardSignInTitle}
        </h2>
        <p className="mt-2 text-sm leading-5 text-muted">{t.boardSignInBody}</p>
        <div className="mt-5 space-y-2">
          <GoogleSignInButton label={t.continueWithGoogle} />
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="h-12 w-full rounded-2xl border border-line text-sm font-semibold text-muted"
          >
            {t.notNow}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GoogleSignInButton({
  label,
  forceRedirectUrl,
}: {
  label: string;
  forceRedirectUrl?: string;
}) {
  return (
    <SignInButton
      mode="modal"
      {...(forceRedirectUrl
        ? {
            forceRedirectUrl,
            fallbackRedirectUrl: forceRedirectUrl,
            signUpForceRedirectUrl: forceRedirectUrl,
            signUpFallbackRedirectUrl: forceRedirectUrl,
          }
        : {})}
    >
      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-zinc-900"
      >
        <GoogleMark />
        {label}
      </button>
    </SignInButton>
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
