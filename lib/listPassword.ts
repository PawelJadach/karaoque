const storageKey = (slug: string) => `karaoque:password:${slug}`;

function readItem(storage: Storage, slug: string): string | undefined {
  try {
    return storage.getItem(storageKey(slug)) || undefined;
  } catch {
    return undefined;
  }
}

function writeItem(storage: Storage, slug: string, password: string): void {
  try {
    storage.setItem(storageKey(slug), password);
  } catch {
    // Private mode or quota — unlocking still works for this tab.
  }
}

function removeItem(storage: Storage, slug: string): void {
  try {
    storage.removeItem(storageKey(slug));
  } catch {
    // Ignore storage failures.
  }
}

export function loadListPassword(slug: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const fromLocal = readItem(window.localStorage, slug);
  if (fromLocal) {
    return fromLocal;
  }

  const fromSession = readItem(window.sessionStorage, slug);
  if (fromSession) {
    writeItem(window.localStorage, slug, fromSession);
    removeItem(window.sessionStorage, slug);
    return fromSession;
  }

  return undefined;
}

export function saveListPassword(slug: string, password: string): void {
  writeItem(window.localStorage, slug, password);
  removeItem(window.sessionStorage, slug);
}

export function clearListPassword(slug: string): void {
  removeItem(window.localStorage, slug);
  removeItem(window.sessionStorage, slug);
}
