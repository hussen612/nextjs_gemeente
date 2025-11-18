import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';

export const checkUserExists = action({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<{ exists: boolean; error?: string }> => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      return { exists: false, error: 'Clerk configuratie ontbreekt' };
    }

    try {
      const response = await fetch(`https://api.clerk.com/v1/users?email_address=${encodeURIComponent(args.email)}`, {
        headers: {
          'Authorization': `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Clerk API error:', response.status, await response.text());
        return { exists: false, error: 'Kon gebruiker niet verifiëren' };
      }

      const users = await response.json();
      return { exists: Array.isArray(users) && users.length > 0 };
    } catch (error) {
      console.error('Error checking user:', error);
      return { exists: false, error: 'Fout bij het verifiëren van gebruiker' };
    }
  },
});

export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('admins').collect();
    return rows.map(r => ({ _id: r._id, email: r.email, createdAt: r.createdAt }));
  },
});

export const hasAnyAdmin = query({
  args: {},
  handler: async (ctx) => {
    const one = await ctx.db.query('admins').first();
    return !!one;
  },
});

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

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
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
    if (Array.isArray(roleCandidate)) {
      return roleCandidate.map((r: any) => String(r).toLowerCase()).includes('admin');
    }
    return false;
  },
});

export const addAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const myEmail = (identity as any)?.email ?? (identity as any)?.emailAddress;
    let me = null as any;
    if (myEmail) {
      me = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', myEmail))
        .unique();
    }
    if (!me) {
      me = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const idAny: any = identity;
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!me && !hasClerkAdmin) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();
    if (existing) return;
    await ctx.db.insert('admins', { email: args.email, createdAt: Date.now() });
  },
});

export const removeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const myEmail = (identity as any)?.email ?? (identity as any)?.emailAddress;
    let me = null as any;
    if (myEmail) {
      me = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', myEmail))
        .unique();
    }
    if (!me) {
      me = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const idAny: any = identity;
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!me && !hasClerkAdmin) throw new Error('Forbidden');

    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', q => q.eq('email', args.email))
      .unique();
    if (!existing) return;
    await ctx.db.delete(existing._id);
  },
});
