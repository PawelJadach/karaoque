"use client";

import { api } from "../convex/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect } from "react";
import { forgetCreatedLists, loadCreatedLists } from "../lib/createdLists";

export function AccountSync() {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);
  const claimMany = useMutation(api.lists.claimMany);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await storeUser();
      if (cancelled) {
        return;
      }
      const pending = loadCreatedLists();
      if (pending.length === 0) {
        return;
      }
      const forget = await claimMany({
        lists: pending.map((list) => ({
          slug: list.slug,
          claimToken: list.claimToken,
        })),
      });
      if (!cancelled) {
        forgetCreatedLists(forget);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [claimMany, isAuthenticated, storeUser]);

  return null;
}
