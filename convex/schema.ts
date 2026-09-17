import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { songStatusValidator } from "./lib/validators";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  lists: defineTable({
    slug: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
    passwordSalt: v.optional(v.string()),
    ownerId: v.optional(v.id("users")),
    claimTokenHash: v.optional(v.string()),
    claimTokenSalt: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  songs: defineTable({
    listId: v.id("lists"),
    title: v.string(),
    done: v.optional(v.boolean()),
    status: v.optional(songStatusValidator),
  }).index("by_list", ["listId"]),
});
