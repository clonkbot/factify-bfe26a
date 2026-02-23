import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listVerified = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let newsQuery = ctx.db
      .query("news")
      .withIndex("by_verified", (q) => q.eq("isManuallyVerified", true));

    const allNews = await newsQuery.order("desc").collect();

    if (args.category && args.category !== "all") {
      return allNews.filter((n) => n.category === args.category);
    }

    return allNews;
  },
});

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) return [];

    const allNews = await ctx.db.query("news").order("desc").collect();
    return allNews.filter((n) => !n.isManuallyVerified);
  },
});

export const submit = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    sourceUrl: v.optional(v.string()),
    category: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Simulate AI verdict (in production, this would call an actual AI service)
    const verdicts = ["real", "fake"] as const;
    const randomVerdict = verdicts[Math.floor(Math.random() * 2)];
    const reasons = {
      real: [
        "Multiple credible sources corroborate this information.",
        "Content aligns with verified factual data.",
        "Source has established credibility and fact-checking history.",
      ],
      fake: [
        "No credible sources found to support these claims.",
        "Contains misleading or out-of-context information.",
        "Source lacks verification and established credibility.",
      ],
    };
    const randomReason = reasons[randomVerdict][Math.floor(Math.random() * 3)];

    return await ctx.db.insert("news", {
      title: args.title,
      content: args.content,
      sourceUrl: args.sourceUrl,
      category: args.category,
      imageUrl: args.imageUrl,
      submittedBy: userId,
      submittedAt: Date.now(),
      aiVerdict: randomVerdict,
      aiReason: randomReason,
      aiVerifiedAt: Date.now(),
      isManuallyVerified: false,
    });
  },
});

export const adminCreate = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    sourceUrl: v.optional(v.string()),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    verdict: v.union(v.literal("real"), v.literal("fake")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) throw new Error("Not authorized");

    return await ctx.db.insert("news", {
      title: args.title,
      content: args.content,
      sourceUrl: args.sourceUrl,
      category: args.category,
      imageUrl: args.imageUrl,
      submittedBy: userId,
      submittedAt: Date.now(),
      aiVerdict: args.verdict,
      aiReason: args.reason,
      aiVerifiedAt: Date.now(),
      isManuallyVerified: true,
      manualVerdict: args.verdict,
      verifiedBy: userId,
      verifiedAt: Date.now(),
    });
  },
});

export const verify = mutation({
  args: {
    newsId: v.id("news"),
    verdict: v.union(v.literal("real"), v.literal("fake")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) throw new Error("Not authorized");

    await ctx.db.patch(args.newsId, {
      isManuallyVerified: true,
      manualVerdict: args.verdict,
      verifiedBy: userId,
      verifiedAt: Date.now(),
    });
  },
});

export const deleteNews = mutation({
  args: { newsId: v.id("news") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!admin) throw new Error("Not authorized");

    await ctx.db.delete(args.newsId);
  },
});
