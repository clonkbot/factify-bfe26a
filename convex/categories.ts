import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("categories").first();
    if (existing) return;

    const defaultCategories = [
      { name: "Politics", slug: "politics", icon: "🏛️", color: "#3B82F6" },
      { name: "Technology", slug: "technology", icon: "💻", color: "#8B5CF6" },
      { name: "Health", slug: "health", icon: "🏥", color: "#10B981" },
      { name: "Science", slug: "science", icon: "🔬", color: "#F59E0B" },
      { name: "Entertainment", slug: "entertainment", icon: "🎬", color: "#EC4899" },
      { name: "Sports", slug: "sports", icon: "⚽", color: "#EF4444" },
      { name: "Business", slug: "business", icon: "📈", color: "#6366F1" },
      { name: "World", slug: "world", icon: "🌍", color: "#14B8A6" },
    ];

    for (const cat of defaultCategories) {
      await ctx.db.insert("categories", cat);
    }
  },
});
