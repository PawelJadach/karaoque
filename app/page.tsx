"use client";

import { useUser } from "@clerk/react";
import { Mic2 } from "lucide-react";
import Link from "next/link";
import { GoogleSignInButton } from "../components/AuthControls";
import { PageHeader } from "../components/PageHeader";
import { isClerkEnabled } from "../lib/clerk";
import { useI18n } from "../lib/i18n";

const CREATE_PATH = "/create";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-4 sm:pt-8">
      <PageHeader />
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-pink/20 text-pink shadow-[0_0_40px_rgba(255,77,141,0.35)]">
          <Mic2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Karaoque
        </h1>
        <p className="mt-3 text-base leading-6 text-muted sm:text-lg">
          {t.homeTagline}
        </p>
      </div>

      <CreateListCta />
    </main>
  );
}

function CreateListCta() {
  const { t } = useI18n();
  if (!isClerkEnabled) {
    return <CreateListLink hint={t.createListAsGuest} variant="primary" />;
  }
  return <ClerkCreateListCta />;
}

function ClerkCreateListCta() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="space-y-3">
        <CreateListButton disabled hint={t.createListAsSignedIn} variant="primary" />
        <CreateListButton disabled hint={t.createListAsGuest} variant="secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isSignedIn ? (
        <CreateListLink hint={t.createListAsSignedIn} variant="primary" />
      ) : (
        <GoogleSignInButton
          label={t.createList}
          hint={t.createListAsSignedIn}
          forceRedirectUrl={CREATE_PATH}
          variant="primary"
        />
      )}
      <CreateListLink hint={t.createListAsGuest} variant="secondary" />
    </div>
  );
}

function CreateListLink({
  hint,
  variant,
}: {
  hint: string;
  variant: "primary" | "secondary";
}) {
  const { t } = useI18n();
  return (
    <Link href={CREATE_PATH} className={createListButtonClass(variant)}>
      <span className="text-base font-semibold">{t.createList}</span>
      <span className={createListHintClass(variant)}>{hint}</span>
    </Link>
  );
}

function CreateListButton({
  disabled,
  hint,
  variant,
}: {
  disabled?: boolean;
  hint: string;
  variant: "primary" | "secondary";
}) {
  const { t } = useI18n();
  return (
    <button type="button" disabled={disabled} className={createListButtonClass(variant)}>
      <span className="text-base font-semibold">{t.createList}</span>
      <span className={createListHintClass(variant)}>{hint}</span>
    </button>
  );
}

function createListButtonClass(variant: "primary" | "secondary"): string {
  const base =
    "flex min-h-14 w-full flex-col items-center justify-center rounded-2xl px-4 py-2 transition enabled:active:scale-[0.99] disabled:opacity-60";
  if (variant === "secondary") {
    return `${base} border border-line bg-card text-foreground`;
  }
  return `${base} bg-pink text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)]`;
}

function createListHintClass(variant: "primary" | "secondary"): string {
  return variant === "secondary"
    ? "text-xs font-medium text-muted"
    : "text-xs font-medium text-white/80";
}
