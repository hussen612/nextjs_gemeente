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

// Query: whether any admin exists
export const hasAnyAdmin = query({
  args: {},
  handler: async (ctx) => {
    const one = await ctx.db.query('admins').first();
    return !!one;
  },
});

// Mutation: bootstrap first admin (only if none exists)
export const bootstrapSelf = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const any = await ctx.db.query('admins').first();
    if (any) throw new Error('Already initialized');
    await ctx.db.insert('admins', { userId: identity.subject, createdAt: Date.now() });
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

// Query: check Clerk-provided role/claims for admin
// This checks a few common places Clerk roles are stored in the identity claims
export const isAdminClerk = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const anyIdentity = identity as any;
    const roleCandidate =
      anyIdentity?.orgRole ||
      anyIdentity?.organizationRole ||
      anyIdentity?.publicMetadata?.role ||
      anyIdentity?.unsafeMetadata?.role ||
      anyIdentity?.role;
    if (typeof roleCandidate === 'string') {
      return roleCandidate.toLowerCase() === 'admin';
    }
    // Also support array of roles
    if (Array.isArray(roleCandidate)) {
      return roleCandidate.map((r: any) => String(r).toLowerCase()).includes('admin');
    }
    return false;
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
