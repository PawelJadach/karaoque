import { useSyncExternalStore } from "react";

const STORAGE_KEY = "karaoque:recent-lists";
const CHANGE_EVENT = "karaoque-recent-lists";
const MAX_RECENT = 12;
const EMPTY_RECENT: RecentList[] = [];

export type RecentList = {
  slug: string;
  name: string;
  viewedAt: number;
};

let cachedRaw: string | null = null;
let cachedLists: RecentList[] = EMPTY_RECENT;

function parseRecentLists(raw: string | null): RecentList[] {
  if (!raw) {
    return EMPTY_RECENT;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY_RECENT;
    }
    const lists: RecentList[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as RecentList).slug !== "string" ||
        typeof (item as RecentList).name !== "string" ||
        typeof (item as RecentList).viewedAt !== "number"
      ) {
        continue;
      }
      const slug = (item as RecentList).slug.trim();
      const name = (item as RecentList).name.trim();
      if (!slug || !name || seen.has(slug)) {
        continue;
      }
      seen.add(slug);
      lists.push({
        slug,
        name,
        viewedAt: (item as RecentList).viewedAt,
      });
    }
    if (lists.length === 0) {
      return EMPTY_RECENT;
    }
    return lists
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, MAX_RECENT);
  } catch {
    return EMPTY_RECENT;
  }
}

function readRecentLists(): RecentList[] {
  if (typeof window === "undefined") {
    return EMPTY_RECENT;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) {
      return cachedLists;
    }
    cachedRaw = raw;
    cachedLists = parseRecentLists(raw);
    return cachedLists;
  } catch {
    return EMPTY_RECENT;
  }
}

function writeRecentLists(lists: RecentList[]): void {
  try {
    const next = lists.slice(0, MAX_RECENT);
    const raw = JSON.stringify(next);
    window.localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedLists = next.length === 0 ? EMPTY_RECENT : next;
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Private mode or quota — skip device history.
  }
}

export function rememberRecentList(slug: string, name: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const nextName = name.trim();
  if (!slug || !nextName) {
    return;
  }
  const current = readRecentLists();
  const alreadyFirst =
    current[0]?.slug === slug && current[0]?.name === nextName;
  if (alreadyFirst) {
    return;
  }
  const others = current.filter((list) => list.slug !== slug);
  writeRecentLists([
    { slug, name: nextName, viewedAt: Date.now() },
    ...others,
  ]);
}

export function removeRecentList(slug: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const current = readRecentLists();
  if (!current.some((list) => list.slug === slug)) {
    return;
  }
  writeRecentLists(current.filter((list) => list.slug !== slug));
}

function subscribeRecentLists(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useRecentLists(): RecentList[] {
  return useSyncExternalStore(
    subscribeRecentLists,
    readRecentLists,
    () => EMPTY_RECENT,
  );
}
