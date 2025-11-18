import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return url;
  },
});

export const getImageUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, { storageIds }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const idAny: any = identity;
    const email = idAny?.email ?? idAny?.emailAddress;
    let adminRow = null as any;
    if (email) {
      adminRow = await ctx.db
        .query('admins')
        .withIndex('by_email', q => q.eq('email', email))
        .unique();
    }
    if (!adminRow) {
      adminRow = await ctx.db
        .query('admins')
        .withIndex('by_userId', q => q.eq('userId', identity.subject))
        .unique();
    }
    const role = idAny?.orgRole || idAny?.organizationRole || idAny?.publicMetadata?.role || idAny?.unsafeMetadata?.role || idAny?.role;
    const hasClerkAdmin = Array.isArray(role)
      ? role.map((r: any) => String(r).toLowerCase()).includes('admin')
      : String(role || '').toLowerCase() === 'admin';
    if (!adminRow && !hasClerkAdmin) throw new Error('Forbidden');
    const pairs: { id: string; url: string | null }[] = [];
    for (const id of storageIds) {
      const url = await ctx.storage.getUrl(id);
      pairs.push({ id: id as unknown as string, url });
    }
    return pairs;
  },
});

export const getAlertImageUrls = query({
  args: { alertId: v.id('alerts') },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    if (!alert) return [];
    const images = (alert as any).images || [];
    const urls: string[] = [];
    for (const img of images) {
      const url = await ctx.storage.getUrl(img.storageId);
      if (url) urls.push(url);
    }
    return urls;
  },
});
