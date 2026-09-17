import { v } from "convex/values";

export const songValidator = v.object({
  _id: v.id("songs"),
  title: v.string(),
  done: v.boolean(),
});

export const listPageValidator = v.union(
  v.object({
    status: v.literal("missing"),
  }),
  v.object({
    status: v.literal("needs_password"),
    name: v.string(),
  }),
  v.object({
    status: v.literal("ok"),
    name: v.string(),
    hasPassword: v.boolean(),
    songs: v.array(songValidator),
  }),
);

export const MAX_SONGS_PER_LIST = 200;
export const MAX_NAME_LENGTH = 80;
export const MAX_TITLE_LENGTH = 200;
export const MAX_PASSWORD_LENGTH = 64;
