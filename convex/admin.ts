import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Query: list all admins (userIds)
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('admins').collect();
    return rows.map(r => ({ _id: r._id, userId: r.userId, createdAt: r.createdAt }));
  },
});

// Query: is current user an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const row = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    return !!row;
  },
});

// Mutation: add an admin by Clerk userId
export const addAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    // Only existing admins can add others
    const me = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .unique();
    if (existing) return;
    await ctx.db.insert('admins', { userId: args.userId, createdAt: Date.now() });
  },
});

// Mutation: remove an admin by Clerk userId
export const removeAdmin = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const me = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', args.userId))
      .unique();
    if (!existing) return;
    await ctx.db.delete(existing._id);
  },
});
