import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lists: defineTable({
    slug: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
    passwordSalt: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  songs: defineTable({
    listId: v.id("lists"),
    title: v.string(),
    done: v.boolean(),
  }).index("by_list", ["listId"]),
});
