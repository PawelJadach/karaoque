"use client";

import { useUser } from "@clerk/react";
import { Mic2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

      <ul className="mb-8 space-y-3 text-sm leading-5 text-muted sm:text-base">
        <li className="rounded-2xl border border-line bg-card/70 px-4 py-3">
          {t.marketingPointShare}
        </li>
        <li className="rounded-2xl border border-line bg-card/70 px-4 py-3">
          {t.marketingPointQueue}
        </li>
        <li className="rounded-2xl border border-line bg-card/70 px-4 py-3">
          {t.marketingPointNoApp}
        </li>
      </ul>

      <CreateListCta />
    </main>
  );
}

function CreateListCta() {
  if (!isClerkEnabled) {
    return <CreateListLink />;
  }
  return <ClerkCreateListCta />;
}

function ClerkCreateListCta() {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const [choosing, setChoosing] = useState(false);

  if (!isLoaded) {
    return (
      <button
        type="button"
        disabled
        className="h-14 w-full rounded-2xl bg-pink text-base font-semibold text-white opacity-60"
      >
        {t.createList}
      </button>
    );
  }

  if (isSignedIn) {
    return <CreateListLink />;
  }

  if (!choosing) {
    return (
      <button
        type="button"
        onClick={() => setChoosing(true)}
        className="h-14 w-full rounded-2xl bg-pink text-base font-semibold text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)] transition active:scale-[0.99]"
      >
        {t.createList}
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-card p-5">
      <Link
        href={CREATE_PATH}
        className="flex min-h-14 w-full flex-col items-center justify-center rounded-2xl bg-pink px-4 py-2 text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)] transition active:scale-[0.99]"
      >
        <span className="text-base font-semibold">{t.continueWithoutAccount}</span>
        <span className="text-xs font-medium text-white/80">
          {t.createListAnonymousHint}
        </span>
      </Link>
      <div className="mt-4">
        <GoogleSignInButton
          label={t.signIn}
          forceRedirectUrl={CREATE_PATH}
        />
        <p className="mt-2 text-sm leading-5 text-muted">{t.signInBenefit}</p>
      </div>
    </div>
  );
}

function CreateListLink() {
  const { t } = useI18n();
  return (
    <Link
      href={CREATE_PATH}
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-pink text-base font-semibold text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)] transition active:scale-[0.99]"
    >
      {t.createList}
    </Link>
  );
}
