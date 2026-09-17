import { v } from "convex/values";

export const SONG_STATUSES = ["todo", "next", "now", "done"] as const;
export type SongStatus = (typeof SONG_STATUSES)[number];

export const songStatusValidator = v.union(
  v.literal("todo"),
  v.literal("next"),
  v.literal("now"),
  v.literal("done"),
);

export const songValidator = v.object({
  _id: v.id("songs"),
  title: v.string(),
  status: songStatusValidator,
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

export const listSummaryValidator = v.object({
  slug: v.string(),
  name: v.string(),
  hasPassword: v.boolean(),
});

export const MAX_SONGS_PER_LIST = 200;
export const MAX_NAME_LENGTH = 80;
export const MAX_TITLE_LENGTH = 200;
export const MAX_PASSWORD_LENGTH = 64;
export const MAX_MINE_LISTS = 50;
export const MAX_VISITED_LISTS = 50;
