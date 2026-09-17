import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrNull } from "./lib/auth";
import { ErrorCode } from "./lib/errors";

export const store = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(ErrorCode.NOT_AUTHENTICATED);
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    const name = identity.name ?? identity.nickname ?? identity.email ?? "Google";
    const email = identity.email ?? "";
    const pictureUrl = identity.pictureUrl;

    if (existing) {
      if (
        existing.name !== name ||
        existing.email !== email ||
        existing.pictureUrl !== pictureUrl
      ) {
        await ctx.db.patch("users", existing._id, {
          name,
          email,
          pictureUrl,
        });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name,
      email,
      pictureUrl,
    });
  },
});

export const me = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      name: v.string(),
      email: v.string(),
      pictureUrl: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return null;
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      pictureUrl: user.pictureUrl,
    };
  },
});
