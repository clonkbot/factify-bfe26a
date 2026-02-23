import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      ...user,
      isAdmin: !!admin,
    };
  },
});

export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if current user is admin (or if no admins exist, first user becomes admin)
    const admins = await ctx.db.query("admins").collect();
    if (admins.length > 0) {
      const isAdmin = admins.some((a) => a.userId === userId);
      if (!isAdmin) throw new Error("Not authorized");
    }

    // Find user by email - search through authAccounts
    const accounts = await ctx.db.query("authAccounts").collect();
    const targetAccount = accounts.find((a) => {
      const providerAccountId = a.providerAccountId;
      return providerAccountId === args.email;
    });

    if (!targetAccount) throw new Error("User not found");

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", targetAccount.userId))
      .first();

    if (existingAdmin) throw new Error("User is already an admin");

    await ctx.db.insert("admins", {
      userId: targetAccount.userId,
      addedAt: Date.now(),
    });
  },
});

export const initFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admins = await ctx.db.query("admins").collect();
    if (admins.length > 0) return false;

    await ctx.db.insert("admins", {
      userId,
      addedAt: Date.now(),
    });

    return true;
  },
});
