import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireListAccess } from "./lib/access";
import { MAX_SONGS_PER_LIST, MAX_TITLE_LENGTH } from "./lib/validators";

export const add = mutation({
  args: {
    slug: v.string(),
    password: v.optional(v.string()),
    title: v.string(),
  },
  returns: v.id("songs"),
  handler: async (ctx, args) => {
    const list = await requireListAccess(ctx, args.slug, args.password);
    const title = args.title.trim();
    if (title.length < 1) {
      throw new Error("Podaj nazwę piosenki");
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new Error("Nazwa piosenki jest za długa");
    }

    const existing = await ctx.db
      .query("songs")
      .withIndex("by_list", (q) => q.eq("listId", list._id))
      .take(MAX_SONGS_PER_LIST);
    if (existing.length >= MAX_SONGS_PER_LIST) {
      throw new Error("Lista jest pełna");
    }

    return await ctx.db.insert("songs", {
      listId: list._id,
      title,
      done: false,
    });
  },
});

export const update = mutation({
  args: {
    slug: v.string(),
    password: v.optional(v.string()),
    songId: v.id("songs"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const list = await requireListAccess(ctx, args.slug, args.password);
    const song = await ctx.db.get("songs", args.songId);
    if (!song || song.listId !== list._id) {
      throw new Error("Piosenka nie istnieje");
    }

    const title = args.title.trim();
    if (title.length < 1) {
      throw new Error("Podaj nazwę piosenki");
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new Error("Nazwa piosenki jest za długa");
    }

    await ctx.db.patch("songs", args.songId, { title });
    return null;
  },
});

export const setDone = mutation({
  args: {
    slug: v.string(),
    password: v.optional(v.string()),
    songId: v.id("songs"),
    done: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const list = await requireListAccess(ctx, args.slug, args.password);
    const song = await ctx.db.get("songs", args.songId);
    if (!song || song.listId !== list._id) {
      throw new Error("Piosenka nie istnieje");
    }

    await ctx.db.patch("songs", args.songId, { done: args.done });
    return null;
  },
});

export const remove = mutation({
  args: {
    slug: v.string(),
    password: v.optional(v.string()),
    songId: v.id("songs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const list = await requireListAccess(ctx, args.slug, args.password);
    const song = await ctx.db.get("songs", args.songId);
    if (!song || song.listId !== list._id) {
      throw new Error("Piosenka nie istnieje");
    }

    await ctx.db.delete("songs", args.songId);
    return null;
  },
});
