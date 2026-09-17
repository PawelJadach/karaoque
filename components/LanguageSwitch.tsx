"use client";

import { useI18n } from "../lib/i18n";

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className="inline-flex rounded-full border border-line bg-card/95 p-1 backdrop-blur-md"
      role="group"
      aria-label={t.language}
    >
      <LangButton active={lang === "pl"} onClick={() => setLang("pl")}>
        PL
      </LangButton>
      <LangButton active={lang === "en"} onClick={() => setLang("en")}>
        EN
      </LangButton>
    </div>
  );
}

function LangButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 min-w-11 rounded-full px-3 text-sm font-semibold ${
        active ? "bg-pink text-white" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
