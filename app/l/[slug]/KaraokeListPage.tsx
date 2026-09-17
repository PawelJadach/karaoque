"use client";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Check, ClipboardPaste, Copy, Home, Lock, Mic2, Pencil, Plus, SkipForward, Trash2, X } from "lucide-react";
import Link from "next/link";
import { type ClipboardEvent as ReactClipboardEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { LanguageSwitch } from "../../../components/LanguageSwitch";
import { AuthControls } from "../../../components/AuthControls";
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
import {
  rememberRecentList,
  removeRecentList,
} from "../../../lib/recentLists";
import { MAX_TITLE_LENGTH, type SongStatus } from "../../../convex/lib/validators";

type Song = {
  _id: Id<"songs">;
  title: string;
  status: SongStatus;
};

type Access = {
  slug: string;
  password?: string;
};

function listSummary(songs: Song[], t: Translations): string {
  const now = songs.filter((song) => song.status === "now").length;
  const next = songs.filter((song) => song.status === "next").length;
  const todo = songs.filter((song) => song.status === "todo").length;
  const done = songs.filter((song) => song.status === "done").length;
  const parts: string[] = [];
  if (now > 0) {
    parts.push(`${now} ${t.nowLabel}`);
  }
  if (next > 0) {
    parts.push(`${next} ${t.nextLabel}`);
  }
  if (todo > 0 || parts.length === 0) {
    parts.push(`${todo} ${t.toSing}`);
  }
  if (done > 0) {
    parts.push(`${done} ${t.done}`);
  }
  return parts.join(" · ");
}

function songsFromClipboard(raw: string): string[] {
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    const title = line
      .replace(/^\s*(?:[-*•]+|\d+[.)])\s+/, "")
      .trim()
      .slice(0, MAX_TITLE_LENGTH);
    if (!title || seen.has(title)) {
      continue;
    }
    seen.add(title);
    titles.push(title);
  }
  return titles;
}

function pastedToast(count: number, t: Translations): string {
  if (count === 1) {
    return t.pastedOne;
  }
  return t.pastedMany.replace("{n}", String(count));
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const page = useQuery(
    api.lists.getPage,
    isClient ? { slug, password } : "skip",
  );

  useEffect(() => {
    if (!page) {
      return;
    }
    if (page.status === "ok" || page.status === "needs_password") {
      rememberRecentList(slug, page.name);
    }
    if (page.status === "missing") {
      removeRecentList(slug);
    }
  }, [page, slug]);

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

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setToast(t.linkCopied);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function copyPassword() {
    if (!password) {
      return;
    }
    await navigator.clipboard.writeText(password);
    setToast(t.passwordCopied);
    window.setTimeout(() => setToast(null), 2500);
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

  const now = page.songs.filter((song) => song.status === "now");
  const next = page.songs.filter((song) => song.status === "next");
  const todo = page.songs.filter((song) => song.status === "todo");
  const done = page.songs.filter((song) => song.status === "done");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-4">
      <nav className="mb-4 flex items-center gap-2 rounded-3xl border border-line bg-card p-2">
        <Link
          href="/"
          aria-label={t.home}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line"
        >
          <Home className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={() => void copyLink()}
          aria-label={t.copyLink}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line"
        >
          <Copy className="h-5 w-5" />
        </button>
        {page.hasPassword && password ? (
          <button
            type="button"
            onClick={() => setShowPassword(true)}
            aria-label={t.showPassword}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line"
          >
            <Lock className="h-5 w-5" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1" />
        <LanguageSwitch />
        <AuthControls />
      </nav>

      {showPassword && password ? (
        <PasswordModal
          password={password}
          t={t}
          onCopy={() => void copyPassword()}
          onClose={() => setShowPassword(false)}
        />
      ) : null}

      {toast ? (
        <p className="fixed left-1/2 top-4 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-gold/90 px-4 py-3 text-center text-sm font-medium text-background">
          {toast}
        </p>
      ) : null}

      <header className="mb-5">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold">
          <Mic2 className="h-3.5 w-3.5" aria-hidden="true" />
          Karaoque
        </p>
        <h1 className="truncate text-2xl font-bold leading-tight">
          {page.name}
        </h1>
        <p className="text-sm text-muted">{listSummary(page.songs, t)}</p>
      </header>

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
          {now.length > 0 ? (
            <SongGroup
              title={t.nowTitle}
              empty=""
              accent="now"
              songs={now}
              access={access}
              onError={setActionError}
            />
          ) : null}
          {next.length > 0 ? (
            <SongGroup
              title={t.nextTitle}
              empty=""
              accent="next"
              songs={next}
              access={access}
              onError={setActionError}
            />
          ) : null}
          {todo.length > 0 ? (
            <SongGroup
              title={t.todoTitle}
              empty={t.todoEmpty}
              songs={todo}
              access={access}
              onError={setActionError}
            />
          ) : null}
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
        onToast={setToast}
        onAdd={async (title) => {
          setActionError(null);
          try {
            await addSong({ ...access, title });
          } catch (caught) {
            setActionError(translateError(caught, t, "ADD_FAILED"));
            throw caught;
          }
        }}
      />
    </main>
  );
}

function PasswordModal({
  password,
  t,
  onCopy,
  onClose,
}: {
  password: string;
  t: Translations;
  onCopy: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t.close}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        className="relative z-10 w-full max-w-sm rounded-3xl border border-line bg-card p-5"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="password-modal-title" className="text-lg font-semibold">
            {t.password}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="break-all rounded-2xl border border-line px-4 py-3 font-mono text-lg text-gold">
          {password}
        </p>
        <p className="mt-3 text-sm text-muted">{t.passwordModalHint}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gold px-4 py-3 font-semibold text-background"
          >
            <Copy className="h-4 w-4" />
            {t.copyPassword}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-4">
      <div className="mb-8 flex items-center justify-end gap-2">
        <LanguageSwitch />
        <AuthControls />
      </div>
      <div className="flex flex-1 items-center">{children}</div>
    </main>
  );
}

function SongGroup({
  title,
  empty,
  accent,
  songs,
  access,
  onError,
}: {
  title: string;
  empty: string;
  accent?: "now" | "next";
  songs: Song[];
  access: Access;
  onError: (message: string | null) => void;
}) {
  const titleClass =
    accent === "now"
      ? "text-pink"
      : accent === "next"
        ? "text-gold"
        : "text-muted";

  return (
    <section>
      <h2
        className={`mb-3 px-1 text-sm font-semibold uppercase tracking-[0.16em] ${titleClass}`}
      >
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
  const setSongStatus = useMutation(api.songs.setStatus);
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

  async function changeStatus(next: SongStatus) {
    const status = song.status === next ? "todo" : next;
    setBusy(true);
    onError(null);
    try {
      await setSongStatus({
        ...access,
        songId: song._id,
        status,
      });
    } catch (caught) {
      onError(translateError(caught, t, "UPDATE_FAILED"));
    } finally {
      setBusy(false);
    }
  }

  const rowClass =
    song.status === "now"
      ? "rounded-2xl border border-pink/70 bg-pink/15 px-2 py-2 shadow-[0_0_24px_rgba(255,77,141,0.18)]"
      : song.status === "next"
        ? "rounded-2xl border border-gold/45 bg-gold/10 px-2 py-2"
        : "rounded-2xl border border-line bg-card px-2 py-2";

  return (
    <li className={rowClass}>
      <div className="flex items-center gap-1">
        <div className="flex shrink-0 items-center rounded-xl border border-line/80 bg-black/20 p-0.5">
          <StatusButton
            label={song.status === "now" ? t.markTodo : t.markNow}
            active={song.status === "now"}
            activeClass="bg-pink/25 text-pink"
            disabled={busy}
            onClick={() => void changeStatus("now")}
          >
            <Mic2 className="h-4 w-4" />
          </StatusButton>
          <StatusButton
            label={song.status === "next" ? t.markTodo : t.markNext}
            active={song.status === "next"}
            activeClass="bg-gold/25 text-gold"
            disabled={busy}
            onClick={() => void changeStatus("next")}
          >
            <SkipForward className="h-4 w-4" />
          </StatusButton>
          <StatusButton
            label={song.status === "done" ? t.markTodo : t.markDone}
            active={song.status === "done"}
            activeClass="bg-gold/20 text-gold"
            disabled={busy}
            onClick={() => void changeStatus("done")}
          >
            <Check className="h-4 w-4" />
          </StatusButton>
        </div>

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
              song.status === "done" ? "text-muted line-through" : ""
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

function StatusButton({
  children,
  label,
  active,
  activeClass,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-10 shrink-0 items-center justify-center rounded-lg disabled:opacity-50 ${
        active ? activeClass : "text-muted"
      }`}
    >
      {children}
    </button>
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
  onToast,
}: {
  t: Translations;
  onAdd: (title: string) => Promise<void>;
  onToast: (message: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const flashToast = useCallback(
    (message: string) => {
      onToast(message);
      window.setTimeout(() => onToast(null), 2500);
    },
    [onToast],
  );

  const addTitles = useCallback(
    async (titles: string[]) => {
      if (titles.length === 0 || busy) {
        return;
      }
      setBusy(true);
      let added = 0;
      try {
        for (const nextTitle of titles) {
          await onAdd(nextTitle);
          added += 1;
        }
        setTitle("");
        flashToast(pastedToast(added, t));
      } catch {
        if (added > 0) {
          setTitle("");
        }
      } finally {
        setBusy(false);
      }
    },
    [busy, flashToast, onAdd, t],
  );

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
    } catch {
      // Error is shown by the list page.
    } finally {
      setBusy(false);
    }
  }

  function onPaste(event: ReactClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    const titles = songsFromClipboard(pasted);
    const shouldAddNow =
      titles.length > 1 || (titles.length === 1 && title.trim().length === 0);
    if (!shouldAddNow) {
      return;
    }
    event.preventDefault();
    void addTitles(titles);
  }

  async function pasteFromClipboard() {
    if (busy) {
      return;
    }
    try {
      const pasted = await navigator.clipboard.readText();
      const titles = songsFromClipboard(pasted);
      if (titles.length === 0) {
        flashToast(t.clipboardEmpty);
        return;
      }
      await addTitles(titles);
    } catch {
      flashToast(t.clipboardBlocked);
      inputRef.current?.focus();
    }
  }

  useEffect(() => {
    function onWindowPaste(event: ClipboardEvent) {
      if (
        busy ||
        isTypingTarget(event.target) ||
        event.defaultPrevented ||
        document.querySelector('[role="dialog"]')
      ) {
        return;
      }
      const pasted = event.clipboardData?.getData("text") ?? "";
      const titles = songsFromClipboard(pasted);
      if (titles.length === 0) {
        return;
      }
      event.preventDefault();
      void addTitles(titles);
    }
    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [addTitles, busy]);

  return (
    <form
      onSubmit={submit}
      className="fixed inset-x-0 bottom-0 border-t border-line bg-[#160918]/95 px-4 pt-3 backdrop-blur-md"
      style={{ paddingBottom: "calc(0.85rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex w-full max-w-lg gap-2">
        <input
          ref={inputRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onPaste={onPaste}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="done"
          placeholder={t.addSong}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-line bg-black/35 px-4 text-base outline-none placeholder:text-muted/70 focus:border-pink"
        />
        <button
          type="button"
          onClick={() => void pasteFromClipboard()}
          disabled={busy}
          aria-label={t.pasteFromClipboard}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line text-foreground disabled:opacity-50"
        >
          <ClipboardPaste className="h-5 w-5" />
        </button>
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
