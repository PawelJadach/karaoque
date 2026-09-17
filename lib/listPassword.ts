const storageKey = (slug: string) => `karaoque:password:${slug}`;

export function loadListPassword(slug: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const value = window.sessionStorage.getItem(storageKey(slug));
  return value || undefined;
}

export function saveListPassword(slug: string, password: string): void {
  window.sessionStorage.setItem(storageKey(slug), password);
}

export function clearListPassword(slug: string): void {
  window.sessionStorage.removeItem(storageKey(slug));
}
