import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  news: defineTable({
    title: v.string(),
    content: v.string(),
    sourceUrl: v.optional(v.string()),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    submittedBy: v.id("users"),
    submittedAt: v.number(),
    // AI verification
    aiVerdict: v.optional(v.union(v.literal("real"), v.literal("fake"), v.literal("pending"))),
    aiReason: v.optional(v.string()),
    aiVerifiedAt: v.optional(v.number()),
    // Manual verification by admin
    isManuallyVerified: v.boolean(),
    manualVerdict: v.optional(v.union(v.literal("real"), v.literal("fake"))),
    verifiedBy: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_verified", ["isManuallyVerified"])
    .index("by_submitted", ["submittedAt"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    color: v.string(),
  }).index("by_slug", ["slug"]),

  admins: defineTable({
    userId: v.id("users"),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),
});
