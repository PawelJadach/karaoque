import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateSlug, getListBySlug, listPasswordOk } from "./lib/access";
import { ErrorCode } from "./lib/errors";
import { hashPassword } from "./lib/password";
import {
  listPageValidator,
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
        done: song.done,
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

    await ctx.db.insert("lists", {
      slug,
      name,
      passwordHash: passwordFields?.hash,
      passwordSalt: passwordFields?.salt,
    });

    return { slug };
  },
});
