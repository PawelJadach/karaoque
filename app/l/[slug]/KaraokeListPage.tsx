"use client";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
  Mic2,
  Pencil,
  Plus,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  translateError,
  useI18n,
  useIsClient,
  type Translations,
} from "../../../lib/i18n";
import {
  loadListPassword,
  saveListPassword,
} from "../../../lib/listPassword";

type Song = {
  _id: Id<"songs">;
  title: string;
  done: boolean;
};

type Access = {
  slug: string;
  password?: string;
};

export function KaraokeListPage({ slug }: { slug: string }) {
  const { t } = useI18n();
  const isClient = useIsClient();
  const storedPassword = isClient ? loadListPassword(slug) : undefined;
  const [passwordOverride, setPasswordOverride] = useState<
    string | undefined
  >();
  const password = passwordOverride ?? storedPassword;
  const [passwordDraft, setPasswordDraft] = useState("");
  const [emptyPasswordSubmit, setEmptyPasswordSubmit] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const page = useQuery(
    api.lists.getPage,
    isClient ? { slug, password } : "skip",
  );

  const passwordError =
    emptyPasswordSubmit ||
    (page?.status === "needs_password" && Boolean(password));

  const addSong = useMutation(api.songs.add);
  const access: Access = { slug, password };

  async function onUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPassword = passwordDraft.trim();
    if (!nextPassword) {
      setEmptyPasswordSubmit(true);
      return;
    }
    saveListPassword(slug, nextPassword);
    setEmptyPasswordSubmit(false);
    setPasswordOverride(nextPassword);
  }

  async function shareList() {
    const url = window.location.href;
    const title = page?.status === "ok" ? page.name : "Karaoque";
    const shareText =
      password && page?.status === "ok" && page.hasPassword
        ? `${t.password}: ${password}`
        : undefined;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
          text: shareText,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage(t.linkCopied);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage(t.linkCopied);
      } catch {
        setShareMessage(t.copyFromBar);
      }
    }
    window.setTimeout(() => setShareMessage(null), 2500);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setShareMessage(t.linkCopied);
    window.setTimeout(() => setShareMessage(null), 2500);
  }

  async function copyPassword() {
    if (!password) {
      return;
    }
    await navigator.clipboard.writeText(password);
    setShareMessage(t.passwordCopied);
    window.setTimeout(() => setShareMessage(null), 2500);
  }

  if (!isClient || page === undefined) {
    return (
      <ScreenShell>
        <p className="text-center text-muted">{t.loadingList}</p>
      </ScreenShell>
    );
  }

  if (page.status === "missing") {
    return (
      <ScreenShell>
        <div className="rounded-3xl border border-line bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">{t.missingTitle}</h1>
          <p className="mt-2 text-muted">{t.missingBody}</p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-pink px-5 font-semibold text-white"
          >
            {t.createNewList}
          </Link>
        </div>
      </ScreenShell>
    );
  }

  if (page.status === "needs_password") {
    return (
      <ScreenShell>
        <div className="rounded-3xl border border-line bg-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink/20 text-pink">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold">{page.name}</h1>
          <p className="mt-2 text-sm leading-5 text-muted">{t.lockedBody}</p>
          <form onSubmit={onUnlock} className="mt-5">
            <input
              type="password"
              value={passwordDraft}
              onChange={(event) => {
                setPasswordDraft(event.target.value);
                setEmptyPasswordSubmit(false);
              }}
              autoComplete="current-password"
              placeholder={t.password}
              className="h-14 w-full rounded-2xl border border-line bg-black/25 px-4 text-base outline-none focus:border-pink"
            />
            {passwordError ? (
              <p className="mt-3 text-sm text-pink">
                {t.errors.INVALID_PASSWORD}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-4 h-14 w-full rounded-2xl bg-pink font-semibold text-white"
            >
              {t.enter}
            </button>
          </form>
        </div>
      </ScreenShell>
    );
  }

  const todo = page.songs.filter((song) => !song.done);
  const done = page.songs.filter((song) => song.done);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4">
      <header className="mb-5 flex items-start gap-3">
        <Link
          href="/"
          aria-label={t.home}
          className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-card"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold">
            <Mic2 className="h-3.5 w-3.5" aria-hidden="true" />
            Karaoque
          </p>
          <h1 className="truncate text-2xl font-bold leading-tight">
            {page.name}
          </h1>
          <p className="text-sm text-muted">
            {todo.length} {t.toSing}
            {done.length > 0 ? ` · ${done.length} ${t.done}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void copyLink()}
            aria-label={t.copyLink}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => void shareList()}
            aria-label={t.share}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink text-white"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      {page.hasPassword && password ? (
        <div className="mb-4 rounded-2xl border border-line bg-card px-4 py-3">
          <p className="text-sm text-muted">{t.passwordBanner}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="min-w-0 flex-1 break-all font-mono text-base text-gold">
              {password}
            </p>
            <button
              type="button"
              onClick={() => void copyPassword()}
              aria-label={t.copyPassword}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-muted"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : page.hasPassword ? (
        <p className="mb-4 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
          {t.passwordBanner}
        </p>
      ) : null}

      {shareMessage ? (
        <p className="mb-4 rounded-2xl bg-gold/15 px-4 py-3 text-sm text-gold">
          {shareMessage}
        </p>
      ) : null}

      {actionError ? (
        <p className="mb-4 rounded-2xl bg-pink/15 px-4 py-3 text-sm text-pink">
          {actionError}
        </p>
      ) : null}

      {page.songs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-card/60 px-5 py-12 text-center">
          <p className="text-lg font-medium">{t.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SongGroup
            title={t.todoTitle}
            empty={t.todoEmpty}
            songs={todo}
            access={access}
            onError={setActionError}
          />
          {done.length > 0 ? (
            <SongGroup
              title={t.doneTitle}
              empty=""
              songs={done}
              access={access}
              onError={setActionError}
            />
          ) : null}
        </div>
      )}

      <AddSongBar
        t={t}
        onAdd={async (title) => {
          setActionError(null);
          try {
            await addSong({ ...access, title });
          } catch (caught) {
            setActionError(translateError(caught, t, "ADD_FAILED"));
          }
        }}
      />
    </main>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg items-center px-4 py-10">
      {children}
    </main>
  );
}

function SongGroup({
  title,
  empty,
  songs,
  access,
  onError,
}: {
  title: string;
  empty: string;
  songs: Song[];
  access: Access;
  onError: (message: string | null) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h2>
      {songs.length === 0 ? (
        <p className="px-1 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {songs.map((song) => (
            <SongRow
              key={song._id}
              song={song}
              access={access}
              onError={onError}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SongRow({
  song,
  access,
  onError,
}: {
  song: Song;
  access: Access;
  onError: (message: string | null) => void;
}) {
  const { t } = useI18n();
  const updateSong = useMutation(api.songs.update);
  const setSongDone = useMutation(api.songs.setDone);
  const removeSong = useMutation(api.songs.remove);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(song.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function saveTitle() {
    const title = draft.trim();
    if (!title || title === song.title) {
      setEditing(false);
      setDraft(song.title);
      return;
    }
    setBusy(true);
    onError(null);
    try {
      await updateSong({ ...access, songId: song._id, title });
      setEditing(false);
    } catch (caught) {
      onError(translateError(caught, t, "SAVE_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-card px-2 py-2">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={song.done ? t.markTodo : t.markDone}
          disabled={busy}
          onClick={() => {
            void (async () => {
              setBusy(true);
              onError(null);
              try {
                await setSongDone({
                  ...access,
                  songId: song._id,
                  done: !song.done,
                });
              } catch (caught) {
                onError(translateError(caught, t, "UPDATE_FAILED"));
              } finally {
                setBusy(false);
              }
            })();
          }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            song.done ? "bg-gold/20 text-gold" : "border border-line text-muted"
          }`}
        >
          <Check className="h-5 w-5" />
        </button>

        {editing ? (
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              void saveTitle();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              autoFocus
              maxLength={200}
              className="h-11 w-full rounded-xl border border-pink bg-black/30 px-3 text-base outline-none"
            />
          </form>
        ) : (
          <p
            className={`min-w-0 flex-1 px-2 text-base leading-5 ${
              song.done ? "text-muted line-through" : ""
            }`}
          >
            {song.title}
          </p>
        )}

        {editing ? (
          <>
            <IconButton
              label={t.save}
              onClick={() => void saveTitle()}
              disabled={busy}
            >
              <Check className="h-4 w-4" />
            </IconButton>
            <IconButton
              label={t.cancel}
              onClick={() => {
                setEditing(false);
                setDraft(song.title);
              }}
            >
              <X className="h-4 w-4" />
            </IconButton>
          </>
        ) : confirmDelete ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  onError(null);
                  try {
                    await removeSong({ ...access, songId: song._id });
                  } catch (caught) {
                    onError(translateError(caught, t, "DELETE_FAILED"));
                    setBusy(false);
                  }
                })();
              }}
              className="h-11 rounded-xl bg-pink px-3 text-sm font-semibold text-white"
            >
              {t.delete}
            </button>
            <IconButton label={t.cancel} onClick={() => setConfirmDelete(false)}>
              <X className="h-4 w-4" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              label={t.edit}
              onClick={() => {
                setConfirmDelete(false);
                setDraft(song.title);
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton label={t.delete} onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
      </div>
    </li>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function AddSongBar({
  t,
  onAdd,
}: {
  t: Translations;
  onAdd: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) {
      return;
    }
    setBusy(true);
    try {
      await onAdd(nextTitle);
      setTitle("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="fixed inset-x-0 bottom-0 border-t border-line bg-[#160918]/95 px-4 pt-3 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex w-full max-w-lg gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="done"
          placeholder={t.addSong}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-line bg-black/35 px-4 text-base outline-none placeholder:text-muted/70 focus:border-pink"
        />
        <button
          type="submit"
          disabled={busy || title.trim().length === 0}
          aria-label={t.addSongAria}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-pink text-white disabled:opacity-50"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}
