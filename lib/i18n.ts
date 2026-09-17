import { useCallback, useSyncExternalStore } from "react";

export type Lang = "pl" | "en";

const LANG_KEY = "karaoque:lang";
const LANG_EVENT = "karaoque-lang";

const translations = {
  pl: {
    homeTagline:
      "Wspólna lista piosenek na karaoke. Stwórz stronę, wyślij link znajomym — bez rejestracji.",
    continueWithGoogle: "Kontynuuj z Google",
    continueWithoutAccount: "Kontynuuj",
    signIn: "Zaloguj się",
    signInBenefit:
      "Konto zapamięta Twoje listy i odwiedzone tablice na każdym urządzeniu.",
    googleShort: "Google",
    myLists: "Twoje listy",
    visitedLists: "Odwiedzone",
    recentLists: "Ostatnio oglądane",
    signInHint:
      "Zaloguj się Google, żeby mieć swoje listy na każdym urządzeniu. Nadal możesz tworzyć listy bez konta.",
    boardSignInTitle: "Zalogować się?",
    boardSignInBody:
      "Zaloguj się Google, żeby zapamiętać tę tablicę na koncie jako odwiedzoną. Możesz wejść bez logowania.",
    notNow: "Nie teraz",
    name: "Nazwa",
    namePlaceholder: "np. Urodziny Asi",
    passwordOptional: "Hasło (opcjonalne)",
    passwordPlaceholder: "Zostaw puste, jeśli nie potrzeba",
    passwordHint:
      "Hasło nie jest wymagane. Jeśli je ustawisz, wyślij je osobno razem z linkiem.",
    createList: "Stwórz listę",
    createListAsSignedIn: "jako zalogowany",
    createListAsGuest: "jako niezalogowany",
    createListAnonymousHint: "bez rejestracji",
    creatingList: "Tworzę listę...",
    loadingList: "Ładuję listę...",
    missingTitle: "Nie ma takiej listy",
    missingBody: "Link jest niepoprawny albo lista została usunięta.",
    createNewList: "Stwórz nową listę",
    lockedBody:
      "Ta lista jest chroniona hasłem. Wpisz je, żeby dodawać i edytować piosenki.",
    password: "Hasło",
    enter: "Wejdź",
    home: "Strona główna",
    copyLink: "Kopiuj link",
    linkCopied: "Link skopiowany",
    copyFromBar: "Skopiuj link z paska przeglądarki",
    passwordCopied: "Hasło skopiowane",
    toSing: "do zaśpiewania",
    done: "gotowe",
    nowLabel: "teraz",
    nextLabel: "następna",
    nowTitle: "Teraz śpiewane",
    nextTitle: "Następna",
    showPassword: "Pokaż hasło",
    hidePassword: "Ukryj hasło",
    copyPassword: "Kopiuj hasło",
    close: "Zamknij",
    passwordModalHint: "Wyślij je znajomym razem z linkiem.",
    emptyTitle: "Jeszcze pusto",
    emptyBody: "Dodaj pierwszą piosenkę na dole.",
    todoTitle: "Do zaśpiewania",
    todoEmpty: "Wszystko już zaśpiewane.",
    doneTitle: "Zaśpiewane",
    addSong: "Dodaj piosenkę...",
    addSongAria: "Dodaj piosenkę",
    pasteFromClipboard: "Wklej ze schowka",
    clipboardEmpty: "Schowek jest pusty",
    clipboardBlocked: "Nie można odczytać schowka. Wklej w pole na dole.",
    pastedOne: "Dodano piosenkę",
    pastedMany: "Dodano {n} piosenki",
    markDone: "Oznacz jako zaśpiewaną",
    markTodo: "Oznacz jako do zaśpiewania",
    markNow: "Oznacz jako teraz śpiewaną",
    markNext: "Oznacz jako następną",
    changeStatus: "Zmień status",
    save: "Zapisz",
    cancel: "Anuluj",
    delete: "Usuń",
    edit: "Edytuj",
    language: "Język",
    errors: {
      NAME_REQUIRED: "Podaj nazwę",
      NAME_TOO_LONG: "Nazwa może mieć max. 80 znaków",
      PASSWORD_TOO_LONG: "Hasło może mieć max. 64 znaki",
      LIST_NOT_FOUND: "Lista nie istnieje",
      INVALID_PASSWORD: "Nieprawidłowe hasło",
      SONG_TITLE_REQUIRED: "Podaj nazwę piosenki",
      SONG_TITLE_TOO_LONG: "Nazwa piosenki jest za długa",
      LIST_FULL: "Lista jest pełna",
      SONG_NOT_FOUND: "Piosenka nie istnieje",
      GENERIC: "Coś poszło nie tak",
      CREATE_FAILED: "Nie udało się utworzyć listy",
      ADD_FAILED: "Nie udało się dodać piosenki",
      SAVE_FAILED: "Nie udało się zapisać",
      UPDATE_FAILED: "Nie udało się zaktualizować",
      DELETE_FAILED: "Nie udało się usunąć",
      NOT_AUTHENTICATED: "Zaloguj się, żeby zobaczyć swoje listy",
    },
  },
  en: {
    homeTagline:
      "A shared karaoke song list. Create a page, send the link to friends — no sign-up.",
    continueWithGoogle: "Continue with Google",
    continueWithoutAccount: "Continue",
    signIn: "Sign in",
    signInBenefit:
      "An account keeps your lists and visited boards on every device.",
    googleShort: "Google",
    myLists: "Your lists",
    visitedLists: "Visited",
    recentLists: "Recently viewed",
    signInHint:
      "Sign in with Google to keep your lists on every device. You can still create lists without an account.",
    boardSignInTitle: "Sign in?",
    boardSignInBody:
      "Sign in with Google to save this board to your account as visited. You can continue without signing in.",
    notNow: "Not now",
    name: "Name",
    namePlaceholder: "e.g. Asia's birthday",
    passwordOptional: "Password (optional)",
    passwordPlaceholder: "Leave empty if you don't need one",
    passwordHint:
      "A password is optional. If you set one, send it separately along with the link.",
    createList: "Create list",
    createListAsSignedIn: "while signed in",
    createListAsGuest: "without an account",
    createListAnonymousHint: "no sign-up needed",
    creatingList: "Creating list...",
    loadingList: "Loading list...",
    missingTitle: "This list doesn't exist",
    missingBody: "The link is wrong or the list was deleted.",
    createNewList: "Create a new list",
    lockedBody:
      "This list is password protected. Enter it to add and edit songs.",
    password: "Password",
    enter: "Enter",
    home: "Home",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    copyFromBar: "Copy the link from the address bar",
    passwordCopied: "Password copied",
    toSing: "to sing",
    done: "done",
    nowLabel: "now",
    nextLabel: "next",
    nowTitle: "Now singing",
    nextTitle: "Up next",
    showPassword: "Show password",
    hidePassword: "Hide password",
    copyPassword: "Copy password",
    close: "Close",
    passwordModalHint: "Send it to friends along with the link.",
    emptyTitle: "Nothing here yet",
    emptyBody: "Add the first song below.",
    todoTitle: "To sing",
    todoEmpty: "Everything has been sung.",
    doneTitle: "Sung",
    addSong: "Add a song...",
    addSongAria: "Add song",
    pasteFromClipboard: "Paste from clipboard",
    clipboardEmpty: "Clipboard is empty",
    clipboardBlocked: "Couldn't read the clipboard. Paste into the field below.",
    pastedOne: "Song added",
    pastedMany: "Added {n} songs",
    markDone: "Mark as sung",
    markTodo: "Mark as to sing",
    markNow: "Mark as now singing",
    markNext: "Mark as up next",
    changeStatus: "Change status",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    language: "Language",
    errors: {
      NAME_REQUIRED: "Enter a name",
      NAME_TOO_LONG: "Name can be at most 80 characters",
      PASSWORD_TOO_LONG: "Password can be at most 64 characters",
      LIST_NOT_FOUND: "List not found",
      INVALID_PASSWORD: "Wrong password",
      SONG_TITLE_REQUIRED: "Enter a song name",
      SONG_TITLE_TOO_LONG: "Song name is too long",
      LIST_FULL: "This list is full",
      SONG_NOT_FOUND: "Song not found",
      GENERIC: "Something went wrong",
      CREATE_FAILED: "Couldn't create the list",
      ADD_FAILED: "Couldn't add the song",
      SAVE_FAILED: "Couldn't save",
      UPDATE_FAILED: "Couldn't update",
      DELETE_FAILED: "Couldn't delete",
      NOT_AUTHENTICATED: "Sign in to see your lists",
    },
  },
} as const;

export type Translations = (typeof translations)[Lang];
export type ErrorCode = keyof Translations["errors"];

function subscribeNever(): () => void {
  return () => undefined;
}

function readLang(): Lang {
  try {
    return window.localStorage.getItem(LANG_KEY) === "en" ? "en" : "pl";
  } catch {
    return "pl";
  }
}

function subscribeLang(onChange: () => void): () => void {
  window.addEventListener(LANG_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LANG_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export function useI18n() {
  const lang = useSyncExternalStore<Lang>(subscribeLang, readLang, () => "pl");
  const setLang = useCallback((next: Lang) => {
    window.localStorage.setItem(LANG_KEY, next);
    window.dispatchEvent(new Event(LANG_EVENT));
    document.documentElement.lang = next;
  }, []);

  return {
    lang,
    setLang,
    t: translations[lang],
  };
}

export function translateError(
  error: unknown,
  t: Translations,
  fallback: ErrorCode,
): string {
  const message = error instanceof Error ? error.message : "";
  if (message && message in t.errors) {
    return t.errors[message as ErrorCode];
  }
  return t.errors[fallback];
}
