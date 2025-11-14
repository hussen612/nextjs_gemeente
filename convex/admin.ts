import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Query: list all admins (emails)
export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('admins').collect();
    return rows.map(r => ({ _id: r._id, email: r.email, createdAt: r.createdAt }));
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
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
    if (!email) throw new Error('No email on identity');
    await ctx.db.insert('admins', { email, createdAt: Date.now() });
  },
});

// Query: is current user an admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
    // Prefer email, fallback to legacy userId
    if (email) {
      const byEmail = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', email))
        .unique();
      if (byEmail) return true;
    }
    const byUserId = await ctx.db
      .query('admins')
      .withIndex('by_userId', q => q.eq('userId', identity.subject))
      .unique();
    return !!byUserId;
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

// Mutation: add an admin by email
export const addAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const myEmail = (identity as any)?.email ?? (identity as any)?.emailAddress;
    // Only existing admins can add others
    const me = myEmail ? await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', myEmail))
      .unique() : null;
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();
    if (existing) return;
    await ctx.db.insert('admins', { email: args.email, createdAt: Date.now() });
  },
});

// Mutation: remove an admin by email
export const removeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const myEmail = (identity as any)?.email ?? (identity as any)?.emailAddress;
    const me = myEmail ? await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', myEmail))
      .unique() : null;
    if (!me) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();
    if (!existing) return;
    await ctx.db.delete(existing._id);
  },
});
