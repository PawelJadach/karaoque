"use client";

import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";
import { Lock, Mic2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveListPassword } from "../lib/listPassword";

export default function HomePage() {
  const router = useRouter();
  const createList = useMutation(api.lists.create);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Podaj nazwę wyjścia");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const trimmedPassword = password.trim();
      const { slug } = await createList({
        name: trimmedName,
        password: trimmedPassword || undefined,
      });
      if (trimmedPassword) {
        saveListPassword(slug, trimmedPassword);
      }
      router.push(`/l/${slug}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Nie udało się utworzyć listy",
      );
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10 pt-8 sm:pt-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-pink/20 text-pink shadow-[0_0_40px_rgba(255,77,141,0.35)]">
          <Mic2 className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Karaoque
        </h1>
        <p className="mt-3 text-base leading-6 text-muted sm:text-lg">
          Wspólna lista piosenek na karaoke. Stwórz stronę, wyślij link
          znajomym — bez rejestracji.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-line bg-card p-5 shadow-2xl backdrop-blur-md sm:p-6"
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-muted">
            Nazwa wyjścia
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            autoComplete="off"
            placeholder="np. Urodziny Asi"
            className="h-14 w-full rounded-2xl border border-line bg-black/25 px-4 text-base text-foreground outline-none placeholder:text-muted/60 focus:border-pink"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-muted">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Hasło (opcjonalne)
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={64}
            autoComplete="new-password"
            placeholder="Zostaw puste, jeśli nie potrzeba"
            className="h-14 w-full rounded-2xl border border-line bg-black/25 px-4 text-base text-foreground outline-none placeholder:text-muted/60 focus:border-pink"
          />
        </label>
        <p className="mt-2 text-sm leading-5 text-muted">
          Hasło nie jest wymagane. Jeśli je ustawisz, wyślij je osobno razem z
          linkiem.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl bg-pink/15 px-3 py-2 text-sm text-pink">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-14 w-full rounded-2xl bg-pink text-base font-semibold text-white shadow-[0_10px_30px_rgba(255,77,141,0.35)] transition enabled:active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Tworzę listę..." : "Stwórz listę"}
        </button>
      </form>
    </main>
  );
}
