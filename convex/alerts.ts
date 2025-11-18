import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createAlert = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    location: v.string(),
    userId: v.string(),
    lat: v.number(),
    lng: v.number(),
    images: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      contentType: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");
    await ctx.db.insert("alerts", {
      type: args.type,
      description: args.description,
      location: args.location,
      userId: identity.subject,
      timestamp: Date.now(),
      status: "open",
      lat: args.lat,
      lng: args.lng,
      images: (args.images ?? []).map(img => ({
        storageId: img.storageId,
        contentType: img.contentType,
        uploadedAt: Date.now(),
      })),
      notes: [],
    });
  },
});

export const getAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db.query('alerts').collect();
    alerts.sort((a, b) => b.timestamp - a.timestamp);
    return alerts.slice(0, 100).map(a => ({
      _id: a._id,
      type: a.type,
      description: a.description,
      location: a.location,
      userId: a.userId,
      timestamp: a.timestamp,
      status: a.status,
      lat: a.lat,
      lng: a.lng,
    }));
  },
});

export const getMyAlerts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const alerts = await ctx.db
      .query('alerts')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    alerts.sort((a, b) => b.timestamp - a.timestamp);
    return alerts.map(a => ({
      _id: a._id,
      type: a.type,
      description: a.description,
      location: a.location,
      userId: a.userId,
      timestamp: a.timestamp,
      status: a.status,
      lat: a.lat,
      lng: a.lng,
    }));
  },
});

export const getAlertById = query({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.id);
    if (!alert) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      const { notes, ...rest } = alert as any;
      return rest;
    }
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
    let admin = null as any;
    if (email) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', email))
        .unique();
    }
    if (!admin) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const idAny: any = identity;
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!admin && !hasClerkAdmin) {
      const { notes, ...rest } = alert as any;
      return rest;
    }
    return alert;
  },
});

export const getAllAlerts = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('alerts').collect();
    rows.sort((a, b) => b.timestamp - a.timestamp);
    return rows;
  },
});

export const updateAlertStatus = mutation({
  args: {
    id: v.id("alerts"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
    let admin = null as any;
    if (email) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', email))
        .unique();
    }
    if (!admin) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const idAny: any = identity;
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!admin && !hasClerkAdmin) throw new Error('Forbidden');
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const addAlertNote = mutation({
  args: {
    id: v.id("alerts"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const email = (identity as any)?.email ?? (identity as any)?.emailAddress;
    let admin = null as any;
    if (email) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', email))
        .unique();
    }
    if (!admin) {
      admin = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const idAny: any = identity;
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!admin && !hasClerkAdmin) throw new Error('Forbidden');
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Not found");
    const notes = existing.notes ?? [];
    notes.push({ text: args.text, authorId: identity.subject, timestamp: Date.now() });
    await ctx.db.patch(args.id, { notes });
  },
});