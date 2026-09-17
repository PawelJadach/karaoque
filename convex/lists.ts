import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  generateClaimToken,
  generateSlug,
  getListBySlug,
  listPasswordOk,
} from "./lib/access";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";
import { ErrorCode } from "./lib/errors";
import { hashPassword, verifyPassword } from "./lib/password";
import { resolveSongStatus } from "./lib/songStatus";
import {
  listPageValidator,
  listSummaryValidator,
  MAX_MINE_LISTS,
  MAX_VISITED_LISTS,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_SONGS_PER_LIST,
} from "./lib/validators";

export const getPage = query({
  args: {
    slug: v.string(),
    password: v.optional(v.string()),
  },
  returns: listPageValidator,
  handler: async (ctx, args) => {
    const list = await getListBySlug(ctx, args.slug);
    if (!list) {
      return { status: "missing" as const };
    }

    const allowed = await listPasswordOk(list, args.password);
    if (!allowed) {
      return {
        status: "needs_password" as const,
        name: list.name,
      };
    }

    const songs = await ctx.db
      .query("songs")
      .withIndex("by_list", (q) => q.eq("listId", list._id))
      .take(MAX_SONGS_PER_LIST);

    return {
      status: "ok" as const,
      name: list.name,
      hasPassword: Boolean(list.passwordHash),
      songs: songs.map((song) => ({
        _id: song._id,
        title: song.title,
        status: resolveSongStatus(song),
      })),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    password: v.optional(v.string()),
  },
  returns: v.object({
    slug: v.string(),
    claimToken: v.string(),
  }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name.length < 1) {
      throw new Error(ErrorCode.NAME_REQUIRED);
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw new Error(ErrorCode.NAME_TOO_LONG);
    }

    const password = args.password?.trim() || undefined;
    if (password && password.length > MAX_PASSWORD_LENGTH) {
      throw new Error(ErrorCode.PASSWORD_TOO_LONG);
    }

    let slug = generateSlug();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await getListBySlug(ctx, slug);
      if (!existing) {
        break;
      }
      slug = generateSlug();
    }

    const passwordFields = password ? await hashPassword(password) : undefined;
    const claimToken = generateClaimToken();
    const claimFields = await hashPassword(claimToken);
    const owner = await getCurrentUserOrNull(ctx);

    await ctx.db.insert("lists", {
      slug,
      name,
      passwordHash: passwordFields?.hash,
      passwordSalt: passwordFields?.salt,
      ownerId: owner?._id,
      claimTokenHash: claimFields.hash,
      claimTokenSalt: claimFields.salt,
    });

    return { slug, claimToken };
  },
});

export const listMine = query({
  args: {},
  returns: v.array(listSummaryValidator),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const lists = await ctx.db
      .query("lists")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .take(MAX_MINE_LISTS);

    return lists.map((list) => ({
      slug: list.slug,
      name: list.name,
      hasPassword: Boolean(list.passwordHash),
    }));
  },
});

export const listVisited = query({
  args: {},
  returns: v.array(listSummaryValidator),
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return [];
    }

    const visits = await ctx.db
      .query("listVisits")
      .withIndex("by_user_and_visited", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_VISITED_LISTS);

    const summaries = [];
    for (const visit of visits) {
      const list = await ctx.db.get("lists", visit.listId);
      if (!list || list.ownerId === user._id) {
        continue;
      }
      summaries.push({
        slug: list.slug,
        name: list.name,
        hasPassword: Boolean(list.passwordHash),
      });
    }
    return summaries;
  },
});

export const recordVisit = mutation({
  args: {
    slug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const list = await getListBySlug(ctx, args.slug);
    if (!list || list.ownerId === user._id) {
      return null;
    }

    const existing = await ctx.db
      .query("listVisits")
      .withIndex("by_user_and_list", (q) =>
        q.eq("userId", user._id).eq("listId", list._id),
      )
      .unique();

    const visitedAt = Date.now();
    if (existing) {
      await ctx.db.patch("listVisits", existing._id, { visitedAt });
    } else {
      await ctx.db.insert("listVisits", {
        userId: user._id,
        listId: list._id,
        visitedAt,
      });
    }
    return null;
  },
});

export const claimMany = mutation({
  args: {
    lists: v.array(
      v.object({
        slug: v.string(),
        claimToken: v.string(),
      }),
    ),
  },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const forget: string[] = [];

    for (const item of args.lists.slice(0, MAX_MINE_LISTS)) {
      const list = await getListBySlug(ctx, item.slug);
      if (!list) {
        forget.push(item.slug);
        continue;
      }
      if (list.ownerId === user._id) {
        forget.push(item.slug);
        continue;
      }
      if (list.ownerId) {
        forget.push(item.slug);
        continue;
      }
      if (!list.claimTokenHash || !list.claimTokenSalt) {
        forget.push(item.slug);
        continue;
      }
      const allowed = await verifyPassword(
        item.claimToken,
        list.claimTokenSalt,
        list.claimTokenHash,
      );
      if (!allowed) {
        forget.push(item.slug);
        continue;
      }
      await ctx.db.patch("lists", list._id, { ownerId: user._id });
      forget.push(item.slug);
    }

    return forget;
  },
});
