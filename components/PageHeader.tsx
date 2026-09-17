"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { AuthControls } from "./AuthControls";
import { LanguageSwitch } from "./LanguageSwitch";
import { useI18n } from "../lib/i18n";

export function PageHeader({ showHome = false }: { showHome?: boolean }) {
  const { t } = useI18n();

  return (
    <div
      className={`mb-6 flex items-center gap-2 ${showHome ? "justify-between" : "justify-end"}`}
    >
      {showHome ? (
        <Link
          href="/"
          aria-label={t.home}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card"
        >
          <Home className="h-5 w-5" />
        </Link>
      ) : null}
      <div className="flex items-center gap-2">
        <LanguageSwitch />
        <AuthControls />
      </div>
    </div>
  );
}
