"use client";

import { api } from "../convex/_generated/api";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { Lock, Mic2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { AuthControls, GoogleSignInBanner } from "../components/AuthControls";
import { HomeListLinks, type HomeListItem } from "../components/HomeListLinks";
import { LanguageSwitch } from "../components/LanguageSwitch";
import { isClerkEnabled } from "../lib/clerk";
import { saveCreatedList } from "../lib/createdLists";
import { translateError, useI18n } from "../lib/i18n";
import { saveListPassword } from "../lib/listPassword";
import { rememberRecentList, useRecentLists } from "../lib/recentLists";

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const createList = useMutation(api.lists.create);
  const recent = useRecentLists();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const recentItems = useMemo<HomeListItem[]>(
    () => recent.map((item) => ({ slug: item.slug, name: item.name })),
    [recent],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.errors.NAME_REQUIRED);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const trimmedPassword = password.trim();
      const created = await createList({
        name: trimmedName,
        password: trimmedPassword || undefined,
      });
      saveCreatedList({
        slug: created.slug,
        name: trimmedName,
        claimToken: created.claimToken,
      });
      rememberRecentList(created.slug, trimmedName);
      if (trimmedPassword) {
        saveListPassword(created.slug, trimmedPassword);
      }
      router.push(`/l/${created.slug}`);
    } catch (caught) {
      setError(translateError(caught, t, "CREATE_FAILED"));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-4 sm:pt-8">
      <div className="mb-6 flex items-center justify-end gap-2">
        <LanguageSwitch />
        <AuthControls />
      </div>
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

      <AccountAndRecentLists recentItems={recentItems} />

      <GoogleSignInBanner />

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-line bg-card p-5 shadow-2xl backdrop-blur-md sm:p-6"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">
            {t.name}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="off"
            placeholder={t.namePlaceholder}
            className="h-14 w-full rounded-2xl border border-line bg-black/25 px-4 text-base text-foreground outline-none placeholder:text-muted/60 focus:border-pink"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
            <Lock className="h-4 w-4" aria-hidden="true" />
            {t.passwordOptional}
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={64}
            autoComplete="new-password"
            placeholder={t.passwordPlaceholder}
            className="h-14 w-full rounded-2xl border border-line bg-black/25 px-4 text-base text-foreground outline-none placeholder:text-muted/60 focus:border-pink"
          />
        </label>
        <p className="mt-2 text-sm leading-5 text-muted">{t.passwordHint}</p>

        {error ? (
          <p className="mt-4 rounded-xl bg-pink/15 px-3 py-2 text-sm text-pink">
            {error}
          </p>
        ) : null}

        <CreateListButton busy={busy} />
      </form>
    </main>
  );
}

function CreateListButton({ busy }: { busy: boolean }) {
  const { t } = useI18n();
  if (!isClerkEnabled) {
    return <SubmitListButton busy={busy} showAnonymousHint t={t} />;
  }
  return <ClerkCreateListButton busy={busy} />;
}

function ClerkCreateListButton({ busy }: { busy: boolean }) {
  const { t } = useI18n();
  const { isLoaded, isSignedIn } = useUser();
  const showAnonymousHint = !isLoaded || !isSignedIn;
  return <SubmitListButton busy={busy} showAnonymousHint={showAnonymousHint} t={t} />;
}

function SubmitListButton({
  busy,
  showAnonymousHint,
  t,
}: {
  busy: boolean;
  showAnonymousHint: boolean;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="mt-5 flex min-h-14 w-full flex-col items-center justify-center rounded-2xl bg-pink px-4 py-2 text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)] transition enabled:active:scale-[0.99] disabled:opacity-60"
    >
      <span className="text-base font-semibold">
        {busy ? t.creatingList : t.createList}
      </span>
      {!busy && showAnonymousHint ? (
        <span className="text-xs font-medium text-white/80">
          {t.createListAnonymousHint}
        </span>
      ) : null}
    </button>
  );
}

function AccountAndRecentLists({ recentItems }: { recentItems: HomeListItem[] }) {
  const { t } = useI18n();
  if (!isClerkEnabled) {
    return <HomeListLinks title={t.recentLists} lists={recentItems} />;
  }
  return <SignedInLists recentItems={recentItems} />;
}

function SignedInLists({ recentItems }: { recentItems: HomeListItem[] }) {
  const { t } = useI18n();
  const { isAuthenticated } = useConvexAuth();
  const myLists = useQuery(api.lists.listMine, isAuthenticated ? {} : "skip");
  const visitedLists = useQuery(
    api.lists.listVisited,
    isAuthenticated ? {} : "skip",
  );
  const mineSlugs = new Set((myLists ?? []).map((list) => list.slug));
  const visitedSlugs = new Set((visitedLists ?? []).map((list) => list.slug));
  const remainingRecent = recentItems.filter(
    (item) => !mineSlugs.has(item.slug) && !visitedSlugs.has(item.slug),
  );

  return (
    <>
      <HomeListLinks title={t.myLists} lists={myLists ?? []} />
      <HomeListLinks title={t.visitedLists} lists={visitedLists ?? []} />
      <HomeListLinks title={t.recentLists} lists={remainingRecent} />
    </>
  );
}
