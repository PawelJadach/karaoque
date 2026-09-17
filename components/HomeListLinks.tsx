"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

export type HomeListItem = {
  slug: string;
  name: string;
  hasPassword?: boolean;
};

export function HomeListLinks({
  title,
  lists,
}: {
  title: string;
  lists: HomeListItem[];
}) {
  if (lists.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
        {title}
      </h2>
      <ul className="space-y-2">
        {lists.map((list) => (
          <li key={list.slug}>
            <Link
              href={`/l/${list.slug}`}
              className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-base font-medium">
                {list.name}
              </span>
              {list.hasPassword ? (
                <Lock className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
