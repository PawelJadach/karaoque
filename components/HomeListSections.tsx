"use client";

import { api } from "../convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useMemo } from "react";
import { HomeListLinks, type HomeListItem } from "./HomeListLinks";
import { isClerkEnabled } from "../lib/clerk";
import { useI18n } from "../lib/i18n";
import { useRecentLists } from "../lib/recentLists";

export function HomeListSections() {
  const { t } = useI18n();
  const recent = useRecentLists();
  const recentItems = useMemo<HomeListItem[]>(
    () => recent.map((item) => ({ slug: item.slug, name: item.name })),
    [recent],
  );

  if (!isClerkEnabled) {
    return <HomeListLinks title={t.recentLists} lists={recentItems} />;
  }
  return <SignedInLists recentItems={recentItems} />;
}

function SignedInLists({ recentItems }: { recentItems: HomeListItem[] }) {
  const { t } = useI18n();
  const { isAuthenticated } = useConvexAuth();
  const myLists = useQuery(api.lists.listMine, isAuthenticated ? {} : "skip");
  const visitedLists = useQuery(
    api.lists.listVisited,
    isAuthenticated ? {} : "skip",
  );
  const mineSlugs = new Set((myLists ?? []).map((list) => list.slug));
  const visitedSlugs = new Set((visitedLists ?? []).map((list) => list.slug));
  const remainingRecent = recentItems.filter(
    (item) => !mineSlugs.has(item.slug) && !visitedSlugs.has(item.slug),
  );

  return (
    <>
      <HomeListLinks title={t.myLists} lists={myLists ?? []} />
      <HomeListLinks title={t.visitedLists} lists={visitedLists ?? []} />
      <HomeListLinks title={t.recentLists} lists={remainingRecent} />
    </>
  );
}
