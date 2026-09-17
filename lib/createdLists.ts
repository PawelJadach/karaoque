const STORAGE_KEY = "karaoque:created-lists";
const MAX_CREATED = 50;

export type CreatedList = {
  slug: string;
  name: string;
  claimToken: string;
};

function readCreatedLists(): CreatedList[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    const lists: CreatedList[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as CreatedList).slug !== "string" ||
        typeof (item as CreatedList).name !== "string" ||
        typeof (item as CreatedList).claimToken !== "string"
      ) {
        continue;
      }
      const slug = (item as CreatedList).slug.trim();
      if (!slug || seen.has(slug)) {
        continue;
      }
      seen.add(slug);
      lists.push({
        slug,
        name: (item as CreatedList).name,
        claimToken: (item as CreatedList).claimToken,
      });
    }
    return lists.slice(0, MAX_CREATED);
  } catch {
    return [];
  }
}

function writeCreatedLists(lists: CreatedList[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // Private mode or quota.
  }
}

export function saveCreatedList(list: CreatedList): void {
  if (typeof window === "undefined") {
    return;
  }
  const others = readCreatedLists().filter((item) => item.slug !== list.slug);
  writeCreatedLists([list, ...others].slice(0, MAX_CREATED));
}

export function loadCreatedLists(): CreatedList[] {
  return readCreatedLists();
}

export function forgetCreatedLists(slugs: string[]): void {
  if (typeof window === "undefined" || slugs.length === 0) {
    return;
  }
  const forget = new Set(slugs);
  writeCreatedLists(readCreatedLists().filter((list) => !forget.has(list.slug)));
}
